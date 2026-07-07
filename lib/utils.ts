import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractJson<T = unknown>(text: string): T | null {
  if (!text) return null;
  let cleaned = text.trim();

  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) cleaned = fence[1].trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // fall through to brace matching
  }

  const start = cleaned.indexOf("{");
  const startArr = cleaned.indexOf("[");
  const begins =
    start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);

  if (begins === -1) return null;

  const openChar = cleaned[begins];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let escape = false;

  for (let i = begins; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inStr) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(begins, i + 1)) as T;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export function formatUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
