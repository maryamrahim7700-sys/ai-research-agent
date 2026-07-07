import { runResearch } from "@/lib/agent";
import type { AgentEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const encoder = new TextEncoder();

export async function POST(request: Request) {
  let topic = "";
  try {
    const body = await request.json();
    topic = (body?.topic ?? "").toString().trim();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!topic) {
    return new Response(JSON.stringify({ error: "A topic is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "OPENROUTER_API_KEY is not configured. Add it to .env.local and restart the dev server.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const ac = new AbortController();
  request.signal.addEventListener("abort", () => ac.abort());

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: AgentEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // controller already closed
        }
      };

      send({ type: "topic", topic });

      runResearch(topic, send, ac.signal)
        .catch((err) => {
          send({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        })
        .finally(() => {
          try {
            controller.close();
          } catch {
            // already closed
          }
        });
    },
    cancel() {
      ac.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
