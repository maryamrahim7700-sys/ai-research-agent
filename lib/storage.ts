import type { ResearchReport } from "./types";

const KEY = "ytra:saved-reports";
const HISTORY_KEY = "ytra:history";

export type SavedReport = {
  id: string;
  topic: string;
  savedAt: number;
  report: ResearchReport;
};

export function loadSavedReports(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedReport[];
  } catch {
    return [];
  }
}

export function saveReport(report: ResearchReport): SavedReport[] {
  if (typeof window === "undefined") return [];
  const entry: SavedReport = {
    id: report.topic + "-" + Date.now(),
    topic: report.topic,
    savedAt: Date.now(),
    report,
  };
  const existing = loadSavedReports();
  const next = [entry, ...existing].slice(0, 30);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function deleteReport(id: string): SavedReport[] {
  if (typeof window === "undefined") return [];
  const next = loadSavedReports().filter((r) => r.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function loadHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function pushHistory(topic: string): string[] {
  if (typeof window === "undefined") return [];
  const next = [topic, ...loadHistory().filter((t) => t !== topic)].slice(0, 20);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
