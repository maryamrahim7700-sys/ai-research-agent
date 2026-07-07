<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project: YouTube Research Agent

### Commands
- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build (includes TypeScript type-checking)
- `npm run lint` — ESLint
- `npx tsc --noEmit -p tsconfig.json` — fast TypeScript type-check only

### Architecture
- Next.js 16 (App Router) + React 19 + Tailwind v4 (CSS-first `@theme` tokens in `app/globals.css`)
- AI via Vercel AI SDK v6 (`ai` + `@ai-sdk/openai`) pointed at OpenRouter (`https://openrouter.ai/api/v1`), model `stepfun/step-3.7-flash` (with `:online` suffix for web-search steps). See `lib/openrouter.ts`.
- `app/api/research/route.ts` — SSE streaming endpoint that runs the autonomous pipeline in `lib/agent.ts` and emits `AgentEvent`s (defined in `lib/types.ts`).
- `hooks/use-research.ts` — client hook that consumes the SSE stream and drives the UI state.
- `lib/prompts.ts` — all prompt templates; `lib/steps.ts` — the 12 workflow steps; `lib/storage.ts` — localStorage history/saved reports; `lib/export.ts` — Markdown/JSON export.
- UI: `app/page.tsx` (home + research shell), `components/` (sidebar, workflow timeline, findings panel, results view with 9 tabs, shadcn-style primitives in `components/ui/`).

### Config
- `.env.local` holds `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.

### Notes
- The `stepfun/step-3.7-flash` upstream on OpenRouter is frequently rate-limited/overloaded (429/503). `callModel` retries transient errors and empty responses with backoff. If a full run is very slow, it is provider capacity, not a code bug.
- Hydration warnings mentioning `rtrvr-*` attributes are caused by a browser extension, not the app.

