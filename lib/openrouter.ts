import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { extractJson, sleep } from "./utils";

const API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_MODEL = process.env.OPENROUTER_MODEL || "stepfun/step-3.7-flash";

if (!API_KEY) {
  console.warn(
    "[openrouter] OPENROUTER_API_KEY is not set. Research requests will fail.",
  );
}

export const openrouter = createOpenAI({
  apiKey: API_KEY ?? "missing",
  baseURL: "https://openrouter.ai/api/v1",
  name: "openrouter",
  headers: {
    "HTTP-Referer": "https://youtube-research-agent.local",
    "X-Title": "YouTube Research Agent",
  },
});

export function model(online = false) {
  return openrouter(online ? `${BASE_MODEL}:online` : BASE_MODEL);
}

export type GenerateOptions = {
  system: string;
  prompt: string;
  online?: boolean;
  maxOutputTokens?: number;
  signal?: AbortSignal;
};

// Survive transient upstream rate-limiting (429) and overloads (503) that
// OpenRouter surfaces for shared/rate-limited models like step-3.7-flash.
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  baseDelay = 5000,
  signal?: AbortSignal,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) throw new Error("aborted");
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient =
        /429|rate.?limit|overload|503|502|timeout|temporarily|try again/i.test(
          msg,
        );
      if (!transient || attempt === retries) throw err;
      await sleep(baseDelay * (attempt + 1));
    }
  }
  throw lastErr;
}

export async function callModel(opts: GenerateOptions): Promise<string> {
  return withRetry(
    async () => {
      const result = await generateText({
        model: model(opts.online ?? false),
        system: opts.system,
        prompt: opts.prompt,
        abortSignal: opts.signal,
        maxOutputTokens: opts.maxOutputTokens ?? 4000,
        maxRetries: 3,
      });
      const text = result.text ?? "";
      // Treat empty completions (common when the provider is overloaded) as a
      // transient failure so it gets retried instead of silently returning "".
      if (!text.trim()) {
        throw new Error("empty response (provider overloaded)");
      }
      return text;
    },
    2,
    5000,
    opts.signal,
  );
}

export async function callJson<T = unknown>(opts: GenerateOptions): Promise<T | null> {
  const text = await callModel(opts);
  return extractJson<T>(text);
}

export type StreamHandlers = {
  onDelta: (text: string) => void;
  signal?: AbortSignal;
};

export async function streamModel(
  opts: GenerateOptions,
  handlers: StreamHandlers,
): Promise<string> {
  // No outer retry: a mid-stream failure would duplicate already-emitted
  // deltas. Rely on streamText's connection-level maxRetries instead; the
  // caller falls back to callModel on failure.
  const result = streamText({
    model: model(opts.online ?? false),
    system: opts.system,
    prompt: opts.prompt,
    abortSignal: handlers.signal,
    maxOutputTokens: opts.maxOutputTokens ?? 8000,
    maxRetries: 3,
  });

  let full = "";
  for await (const delta of result.textStream) {
    full += delta;
    handlers.onDelta(delta);
  }
  if (!full.trim()) {
    throw new Error("empty response (provider overloaded)");
  }
  return full;
}
