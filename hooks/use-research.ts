"use client";

import { useCallback, useRef, useState } from "react";
import { WORKFLOW_STEPS } from "@/lib/steps";
import { uid } from "@/lib/utils";
import type {
  AgentEvent,
  Finding,
  ResearchPlan,
  ResearchReport,
  Source,
  WorkflowStep,
} from "@/lib/types";

export type LogEntry = { id: string; message: string; time: number };

export type ResearchState = {
  status: "idle" | "researching" | "done" | "error";
  topic: string;
  steps: WorkflowStep[];
  findings: Finding[];
  sources: Source[];
  logs: LogEntry[];
  plan: ResearchPlan | null;
  reportDelta: string;
  report: ResearchReport | null;
  error: string | null;
  startedAt: number | null;
};

function initialSteps(): WorkflowStep[] {
  return WORKFLOW_STEPS.map((s) => ({
    ...s,
    status: "pending" as const,
  }));
}

const initialState: ResearchState = {
  status: "idle",
  topic: "",
  steps: initialSteps(),
  findings: [],
  sources: [],
  logs: [],
  plan: null,
  reportDelta: "",
  report: null,
  error: null,
  startedAt: null,
};

export function useResearch() {
  const [state, setState] = useState<ResearchState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({
      ...initialState,
      steps: initialSteps(),
    });
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const start = useCallback(async (topic: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState({
      ...initialState,
      steps: initialSteps(),
      status: "researching",
      topic,
      startedAt: Date.now(),
      logs: [{ id: uid(), message: `Research started for "${topic}"`, time: Date.now() }],
    });

    const patch = (fn: (s: ResearchState) => ResearchState) =>
      setState((prev) => fn(prev));

    const handle = (event: AgentEvent) => {
      switch (event.type) {
        case "topic":
          patch((s) => ({ ...s, topic: event.topic }));
          break;
        case "log":
          patch((s) => ({
            ...s,
            logs: [
              ...s.logs,
              { id: uid(), message: event.message, time: Date.now() },
            ].slice(-200),
          }));
          break;
        case "plan":
          patch((s) => ({ ...s, plan: event.plan }));
          break;
        case "step_start":
          patch((s) => ({
            ...s,
            steps: s.steps.map((st) =>
              st.id === event.stepId
                ? { ...st, status: "active", startedAt: Date.now() }
                : st,
            ),
          }));
          break;
        case "step_detail":
          patch((s) => ({
            ...s,
            steps: s.steps.map((st) =>
              st.id === event.stepId ? { ...st, detail: event.detail } : st,
            ),
          }));
          break;
        case "finding":
          patch((s) => ({
            ...s,
            findings: [...s.findings, event.finding],
          }));
          break;
        case "source":
          patch((s) => {
            const exists = s.sources.some(
              (x) => (x.url || "") === (event.source.url || ""),
            );
            return {
              ...s,
              sources: exists ? s.sources : [...s.sources, event.source],
            };
          });
          break;
        case "step_complete":
          patch((s) => ({
            ...s,
            steps: s.steps.map((st) =>
              st.id === event.stepId
                ? { ...st, status: "done", completedAt: Date.now() }
                : st,
            ),
          }));
          break;
        case "report_reset":
          patch((s) => ({ ...s, reportDelta: "" }));
          break;
        case "report_delta":
          patch((s) => ({
            ...s,
            reportDelta: s.reportDelta + event.text,
          }));
          break;
        case "report":
          patch((s) => ({ ...s, report: event.report }));
          break;
        case "error":
          patch((s) => ({ ...s, error: event.message }));
          break;
        case "done":
          patch((s) => ({
            ...s,
            status: s.error ? "error" : "done",
          }));
          break;
      }
    };

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        let message = `Request failed (${res.status})`;
        try {
          const j = JSON.parse(text);
          if (j?.error) message = j.error;
        } catch {
          /* ignore */
        }
        patch((s) => ({ ...s, status: "error", error: message }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const event = JSON.parse(payload) as AgentEvent;
            handle(event);
          } catch {
            // ignore malformed chunk
          }
        }
      }

      patch((s) => ({ ...s, status: s.error ? "error" : s.report ? "done" : s.status }));
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        patch((s) => ({ ...s, status: "idle" }));
        return;
      }
      patch((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  return { state, start, reset, stop };
}
