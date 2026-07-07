import type { ResearchReport } from "./types";

export function copyText(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* ignore */
    }
    document.body.removeChild(ta);
    return;
  }
  return navigator.clipboard.writeText(text);
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function reportToMarkdown(r: ResearchReport): string {
  const lines: string[] = [];
  lines.push(`# ${r.topic} — YouTube Research Report`);
  lines.push("");
  lines.push(`> Generated ${new Date(r.generatedAt).toLocaleString()} by Deep Research Agent`);
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(r.executiveSummary || "—");

  if (r.keyMetrics?.length) {
    lines.push("", "## Key Metrics");
    for (const m of r.keyMetrics) lines.push(`- **${m.label}**: ${m.value}${m.context ? ` _(${m.context})_` : ""}`);
  }

  lines.push("", "## Main Talking Points");
  for (const t of r.talkingPoints) lines.push(`- **${t.title}**${t.type ? ` [${t.type}]` : ""}: ${t.detail}`);

  lines.push("", "## YouTube Script Outline");
  lines.push(`**Hook:** ${r.script.hook}`, "");
  lines.push(`**Intro:** ${r.script.intro}`, "");
  for (const s of r.script.sections) {
    lines.push(`### ${s.heading}${s.duration ? ` (${s.duration})` : ""}`);
    lines.push(s.content, "");
  }
  lines.push(`**Outro:** ${r.script.outro}`);

  lines.push("", "## Thumbnail Ideas");
  r.thumbnails.forEach((t, i) => lines.push(`${i + 1}. **${t.title}** — ${t.visual} _(text: "${t.textOverlay}", vibe: ${t.vibe})_`));

  lines.push("", "## SEO Package");
  lines.push("### Titles", ...r.seo.titles.map((t) => `- ${t}`));
  lines.push("### Descriptions", ...r.seo.descriptions.map((t) => `- ${t}`));
  lines.push("### Tags", `\n${r.seo.tags.join(", ")}`);
  lines.push("### Hashtags", r.seo.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "));

  if (r.competitors.length) {
    lines.push("", "## Competitor Matrix");
    const cols = r.competitorColumns?.length
      ? r.competitorColumns
      : ["pricing", "contextWindow", "reasoning", "coding", "vision", "speed"];
    lines.push(`| Product | ${cols.join(" | ")} |`);
    lines.push(`| --- | ${cols.map(() => "---").join(" | ")} |`);
    for (const c of r.competitors) {
      const cells = cols.map((col) => String((c as Record<string, unknown>)?.[col] ?? "—"));
      lines.push(`| ${c.name} | ${cells.join(" | ")} |`);
    }
  }

  if (r.benchmarks.rows.length) {
    lines.push("", "## Benchmarks");
    lines.push(`| Model | ${r.benchmarks.datasets.join(" | ")} |`);
    lines.push(`| --- | ${r.benchmarks.datasets.map(() => "---").join(" | ")} |`);
    for (const row of r.benchmarks.rows) {
      lines.push(`| ${row.model} | ${r.benchmarks.datasets.map((d) => row.scores[d] ?? "—").join(" | ")} |`);
    }
    if (r.benchmarks.notes) lines.push("", `_${r.benchmarks.notes}_`);
  }

  lines.push("", "## Community Insights");
  lines.push(r.community.summary || "—");
  for (const p of r.community.posts) lines.push(`- **[${p.platform} · ${p.sentiment}]** ${p.summary}${p.source ? ` ([source](${p.source}))` : ""}`);

  lines.push("", "## Hidden Opportunities");
  for (const o of r.opportunities) lines.push(`- **${o.title}** — ${o.angle} _(${o.why})_`);

  if (r.factCheck.length) {
    lines.push("", "## Fact Verification");
    for (const c of r.factCheck) lines.push(`- **[${c.verdict}]** ${c.claim}${c.note ? ` — ${c.note}` : ""}`);
  }

  if (r.sources.length) {
    lines.push("", "## Sources");
    for (const s of r.sources) lines.push(`- [${s.title}](${s.url})`);
  }

  return lines.join("\n");
}

export function exportMarkdown(r: ResearchReport) {
  downloadFile(`${slug(r.topic)}-research.md`, reportToMarkdown(r), "text/markdown");
}

export function exportJson(r: ResearchReport) {
  downloadFile(`${slug(r.topic)}-research.json`, JSON.stringify(r, null, 2), "application/json");
}
