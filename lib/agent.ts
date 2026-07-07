import {
  benchmarkPrompt,
  competitorPrompt,
  factCheckPrompt,
  planningPrompt,
  SEARCH_STEPS,
  searchPrompt,
  synthesisPrompt,
  SYSTEM_PROMPT,
} from "./prompts";
import { callJson, callModel, streamModel } from "./openrouter";
import { extractJson, uid } from "./utils";
import type {
  AgentEvent,
  Competitor,
  Finding,
  ResearchPlan,
  ResearchReport,
  Source,
} from "./types";

type Send = (event: AgentEvent) => void;

function dedupeSources(sources: Source[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const s of sources) {
    const key = (s.url || s.title || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

async function runPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function runResearch(
  topic: string,
  send: (event: AgentEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const collected: Source[] = [];
  const allFindings: { stepId: string; summary: string; items: Finding[] }[] = [];
  let competitors: Competitor[] = [];
  let competitorColumns: string[] = [];
  let benchmarkData: ResearchReport["benchmarks"] = { datasets: [], rows: [] };
  let factCheck: ResearchReport["factCheck"] = [];
  let plan: ResearchPlan = {
    topic,
    summary: "",
    entities: {},
    objectives: [],
    searchQueries: [],
  };

  const aborted = () => !!signal?.aborted;

  try {
    // ---- Planning ----
    send({ type: "step_start", stepId: "plan" });
    send({ type: "log", message: `Analyzing topic: "${topic}"` });
    try {
      const planJson = await callJson<ResearchPlan>({
        system: SYSTEM_PROMPT,
        prompt: planningPrompt(topic),
        maxOutputTokens: 1800,
        signal,
      });
      if (planJson) plan = { ...plan, ...planJson };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      send({ type: "log", message: `Planning warning: ${msg}` });
    }
    if (!plan.searchQueries?.length) {
      plan.searchQueries = [
        `${topic}`,
        `${topic} announcement`,
        `${topic} reddit`,
        `${topic} hacker news`,
        `${topic} github`,
        `${topic} vs competitors`,
      ];
    }
    send({ type: "plan", plan });
    send({
      type: "step_detail",
      stepId: "plan",
      detail: plan.summary || "Research plan generated",
    });
    send({ type: "step_complete", stepId: "plan" });

    if (aborted()) return;

    // ---- Search steps (parallel) ----
    const searchOrder = [
      "official",
      "news",
      "reddit",
      "hackernews",
      "github",
      "x",
      "docs",
    ];

    await runPool(searchOrder, 2, async (stepId) => {
      if (aborted()) return;
      const cfg = SEARCH_STEPS[stepId];
      send({ type: "step_start", stepId });
      send({ type: "log", message: `Querying ${cfg.source}…` });

      const stepFindings: Finding[] = [];
      const recordFinding = (f: Finding) => {
        stepFindings.push(f);
        if (f.sources) collected.push(...f.sources);
        send({ type: "finding", finding: f });
        for (const s of f.sources || []) send({ type: "source", source: s });
      };

      try {
        const result = await callJson<{
          summary: string;
          findings: { text: string; kind: Finding["kind"]; sources?: Source[] }[];
        }>({
          system: SYSTEM_PROMPT,
          prompt: searchPrompt(cfg, topic, plan),
          online: true,
          maxOutputTokens: 2200,
          signal,
        });

        if (result?.findings?.length) {
          for (const f of result.findings) {
            recordFinding({
              id: uid(),
              stepId,
              kind: f.kind || "fact",
              text: f.text,
              sources: dedupeSources(f.sources || []),
            });
          }
          send({
            type: "step_detail",
            stepId,
            detail: result.summary || `${result.findings.length} findings`,
          });
          allFindings.push({
            stepId,
            summary: result.summary || "",
            items: stepFindings,
          });
        } else {
          recordFinding({
            id: uid(),
            stepId,
            kind: "note",
            text: `No structured data returned for ${cfg.source}.`,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ type: "log", message: `${cfg.source} search error: ${msg}` });
        send({ type: "step_detail", stepId, detail: "Partial data" });
      }

      send({ type: "step_complete", stepId });
    });

    if (aborted()) return;

    // ---- Competitors + Benchmarks (parallel) ----
    await runPool(["competitors", "benchmarks"], 2, async (stepId) => {
      if (aborted()) return;
      send({ type: "step_start", stepId });
      try {
        if (stepId === "competitors") {
          send({ type: "log", message: "Identifying competitors…" });
          const comp = await callJson<{
            competitors: Competitor[];
            columns: string[];
          }>({
            system: SYSTEM_PROMPT,
            prompt: competitorPrompt(topic),
            online: true,
            maxOutputTokens: 3000,
            signal,
          });
          if (comp?.competitors?.length) {
            competitors = comp.competitors;
            competitorColumns =
              comp.columns || [
                "pricing",
                "contextWindow",
                "reasoning",
                "coding",
                "vision",
                "audio",
                "video",
                "toolCalling",
                "speed",
              ];
            send({
              type: "step_detail",
              stepId,
              detail: `Compared ${competitors.length} competitors`,
            });
          }
        } else {
          send({ type: "log", message: "Compiling benchmark scores…" });
          const bm = await callJson<ResearchReport["benchmarks"]>({
            system: SYSTEM_PROMPT,
            prompt: benchmarkPrompt(topic),
            online: true,
            maxOutputTokens: 2000,
            signal,
          });
          if (bm?.rows?.length) {
            benchmarkData = bm;
            send({
              type: "step_detail",
              stepId,
              detail: `${bm.rows.length} models × ${bm.datasets.length} benchmarks`,
            });
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ type: "log", message: `${stepId} error: ${msg}` });
      }
      send({ type: "step_complete", stepId });
    });

    if (aborted()) return;

    // ---- Fact check ----
    send({ type: "step_start", stepId: "factcheck" });
    send({ type: "log", message: "Cross-referencing claims…" });
    const claims = allFindings
      .flatMap((s) => s.items)
      .slice(0, 18)
      .map((f, i) => `${i + 1}. ${f.text}`)
      .join("\n");
    try {
      const fc = await callJson<{ checks: ResearchReport["factCheck"] }>({
        system: SYSTEM_PROMPT,
        prompt: factCheckPrompt(topic, claims || "No specific claims extracted."),
        maxOutputTokens: 2000,
        signal,
      });
      if (fc?.checks?.length) {
        factCheck = fc.checks;
        const verified = factCheck.filter((c) => c.verdict === "Verified").length;
        send({
          type: "step_detail",
          stepId: "factcheck",
          detail: `${verified}/${factCheck.length} claims verified`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      send({ type: "log", message: `Fact-check error: ${msg}` });
    }
    send({ type: "step_complete", stepId: "factcheck" });

    if (aborted()) return;

    // ---- Build report (streamed synthesis) ----
    send({ type: "step_start", stepId: "build" });
    send({ type: "log", message: "Synthesizing final report…" });

    const context = [
      "=== FINDINGS BY SOURCE ===",
      ...allFindings.map(
        (s) =>
          `\n[${s.stepId.toUpperCase()}] ${s.summary}\n` +
          s.items
            .map((f) => `- ${f.text}${f.sources?.length ? ` (src: ${f.sources.map((x) => x.url).join(", ")})` : ""}`)
            .join("\n"),
      ),
      "\n=== COMPETITORS ===",
      JSON.stringify(competitors, null, 2),
      "\n=== BENCHMARKS ===",
      JSON.stringify(benchmarkData, null, 2),
      "\n=== FACT CHECK ===",
      JSON.stringify(factCheck, null, 2),
      "\n=== ALL SOURCES ===",
      dedupeSources(collected)
        .slice(0, 60)
        .map((s) => `- ${s.title}: ${s.url}`)
        .join("\n"),
    ].join("\n");

    let synthText = "";
    let emittedAny = false;
    try {
      synthText = await streamModel(
        {
          system: SYSTEM_PROMPT,
          prompt: synthesisPrompt(topic, plan, context),
          maxOutputTokens: 5500,
          signal,
        },
        {
          signal,
          onDelta: (delta) => {
            emittedAny = true;
            send({ type: "report_delta", text: delta });
          },
        },
      );
    } catch {
      send({ type: "log", message: "Streaming interrupted, regenerating…" });
    }

    if (!synthText.trim()) {
      if (emittedAny) send({ type: "report_reset" });
      send({ type: "log", message: "Generating report…" });
      synthText = await callModel({
        system: SYSTEM_PROMPT,
        prompt: synthesisPrompt(topic, plan, context),
        maxOutputTokens: 5500,
        signal,
      });
      send({ type: "report_delta", text: synthText });
    }

    const parsed = extractJson<ResearchReport>(synthText);

    const report: ResearchReport = {
      topic,
      generatedAt: new Date().toISOString(),
      plan,
      executiveSummary: parsed?.executiveSummary || "",
      reportMarkdown: parsed?.reportMarkdown || synthText,
      keyMetrics: parsed?.keyMetrics,
      talkingPoints: parsed?.talkingPoints || [],
      script: parsed?.script || { hook: "", intro: "", sections: [], outro: "" },
      thumbnails: parsed?.thumbnails || [],
      seo:
        parsed?.seo || { titles: [], descriptions: [], tags: [], hashtags: [] },
      competitors,
      competitorColumns,
      benchmarks: benchmarkData,
      community: parsed?.community || { summary: "", posts: [] },
      opportunities: parsed?.opportunities || [],
      sources: dedupeSources(collected),
      factCheck,
    };

    send({ type: "report", report });
    send({ type: "step_complete", stepId: "build" });
    send({ type: "done" });
  } catch (err) {
    send({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
    send({ type: "done" });
  }
}
