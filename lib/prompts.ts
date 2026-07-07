import type { ResearchPlan } from "./types";

export const SYSTEM_PROMPT = `You are Deep Research, an elite AI research analyst for top-tier YouTube creators.
Your job is to autonomously research a topic across many sources, verify facts, and produce
professional, accurate, and genuinely useful research packages.

Core principles:
- Be factual and precise. Never fabricate. If something is uncertain, unconfirmed, or a rumor, label it clearly.
- Use multiple independent sources for every important claim. Prefer official/primary sources.
- Always cite real URLs as sources. Include the page title and a short snippet where possible.
- Be specific: real numbers, dates, prices, model names, version numbers, benchmark scores.
- Write in clear, energetic English suitable for a tech YouTube audience.
- When you don't have enough information, say so explicitly rather than guessing.

You will be asked to return STRICT JSON. Never wrap commentary outside the JSON. Never invent URLs.
If a URL is unknown, omit it rather than fabricating one.`;

export function planningPrompt(topic: string) {
  return `Topic: "${topic}"

Analyze this topic and produce a research plan. Identify the key entities and what a deep,
creator-focused research investigation should cover.

Return STRICT JSON in this exact shape:
{
  "topic": "<refined topic name>",
  "summary": "<1-2 sentence explanation of what this topic is>",
  "entities": {
    "companies": ["..."],
    "products": ["..."],
    "technologies": ["..."],
    "languages": ["..."],
    "frameworks": ["..."],
    "people": ["..."],
    "timeline": ["... key dates or events ..."]
  },
  "objectives": ["... what we need to find out ..."],
  "searchQueries": ["... 6-10 specific search queries to run ..."]
}

Only include fields you have data for. Empty arrays are fine.`;
}

export type SearchStepConfig = {
  stepId: string;
  source: string;
  focus: string;
  collect: string[];
  instructions: string;
};

export const SEARCH_STEPS: Record<string, SearchStepConfig> = {
  official: {
    stepId: "official",
    source: "official websites, documentation, release notes, changelogs, and company blogs",
    focus: "official announcements, launch details, specs, pricing, and capabilities",
    collect: [
      "Announcements & launch details",
      "Official specs and capabilities",
      "Pricing tiers and limits",
      "Key features",
      "Release notes / version info",
      "Roadmap or API information",
    ],
    instructions:
      "Use the web to find the most authoritative official information. Quote real numbers and facts.",
  },
  news: {
    stepId: "news",
    source: "news websites and tech press",
    focus: "the latest news, coverage, announcements, and reactions",
    collect: [
      "Recent announcements",
      "Headlines & coverage angles",
      "Dates and timelines",
      "Notable quotes from leaders/press",
    ],
    instructions: "Find recent, credible news coverage. Include publication names.",
  },
  reddit: {
    stepId: "reddit",
    source: "Reddit threads and subreddits",
    focus: "genuine community opinions, complaints, feature requests and discoveries",
    collect: [
      "Community opinions (positive & negative)",
      "Common complaints",
      "Feature requests",
      "Surprising discoveries or workarounds",
      "Perceived limitations",
    ],
    instructions:
      "Capture authentic community sentiment. Quote the gist of threads. Note the subreddit.",
  },
  hackernews: {
    stepId: "hackernews",
    source: "Hacker News",
    focus: "sharp developer commentary, technical critique, and expert analysis",
    collect: [
      "Technical analysis",
      "Expert critique",
      "Interesting technical observations",
      "Debated trade-offs",
    ],
    instructions:
      "HN tends to be technical and skeptical. Capture the most insightful developer takes.",
  },
  github: {
    stepId: "github",
    source: "GitHub repositories, issues, releases and discussions",
    focus: "repos, stars, open issues, changelogs, and developer activity",
    collect: [
      "Key repositories (with star counts if known)",
      "Notable issues / bugs",
      "Recent releases / changelogs",
      "SDK and integration availability",
    ],
    instructions: "Reference real repos. Note star counts and activity where available.",
  },
  x: {
    stepId: "x",
    source: "X (Twitter) posts, threads and creator commentary",
    focus: "real-time takes, leaks, reactions, and notable creator opinions",
    collect: [
      "Notable takes / reactions",
      "Leaks or rumors (clearly labeled)",
      "Creator / influencer commentary",
      "Viral angles",
    ],
    instructions:
      "Capture the zeitgeist. Clearly mark rumors vs confirmed info. Cite handles/URLs.",
  },
  docs: {
    stepId: "docs",
    source: "documentation sites, API references, SDKs and pricing pages",
    focus: "concrete technical details: API, context window, models, limits, and deployment",
    collect: [
      "API surface & SDKs",
      "Model sizes / variants",
      "Context windows & rate limits",
      "Deployment options (cloud, on-prem, open weights)",
      "Enterprise features",
    ],
    instructions: "Be precise and technical. Use exact figures from documentation.",
  },
};

export function searchPrompt(
  cfg: SearchStepConfig,
  topic: string,
  plan: ResearchPlan,
) {
  const queries = (plan.searchQueries || []).slice(0, 6).join("\n- ");
  return `TOPIC: "${topic}"
RESEARCH CONTEXT: ${plan.summary}
SUGGESTED QUERIES:
- ${queries}

SEARCH SOURCE: ${cfg.source}
FOCUS: ${cfg.focus}

What to collect:
${cfg.collect.map((c) => `- ${c}`).join("\n")}

${cfg.instructions}

Search the web now across ${cfg.source} and extract the most important, accurate findings
about the topic. Return STRICT JSON in this exact shape:
{
  "summary": "<2-4 sentence synthesis of what you found>",
  "findings": [
    {
      "text": "<a single, specific, quotable finding>",
      "kind": "fact|opinion|issue|news|benchmark|spec|note",
      "sources": [ { "title": "<page title>", "url": "<real url>", "snippet": "<short>" } ]
    }
  ]
}

Provide 4-9 findings. Every finding should have at least one real source URL. Omit URLs you cannot verify.`;
}

export function competitorPrompt(topic: string) {
  return `TOPIC: "${topic}"

Identify the 3-6 most relevant competitors / alternatives in this space and build a comparison.

Return STRICT JSON in this exact shape:
{
  "competitors": [
    {
      "name": "<product/model name>",
      "pricing": "<e.g. $20/mo, free, API $X/M tokens>",
      "contextWindow": "<e.g. 200K tokens>",
      "reasoning": "<Strong|Moderate|Weak|N/A>",
      "coding": "<Strong|Moderate|Weak|N/A>",
      "vision": "<Yes|No|Limited>",
      "audio": "<Yes|No|Limited>",
      "video": "<Yes|No|Limited>",
      "toolCalling": "<Yes|No|Limited>",
      "speed": "<Fast|Medium|Slow>",
      "strengths": ["..."],
      "weaknesses": ["..."]
    }
  ],
  "columns": ["pricing","contextWindow","reasoning","coding","vision","audio","video","toolCalling","speed"]
}

Use the web to get accurate, current data. If a value is unknown, use "N/A" or "Unknown".`;
}

export function benchmarkPrompt(topic: string) {
  return `TOPIC: "${topic}"

Compile benchmark scores comparing this topic (and its peers) across standard evaluation suites
(e.g. MMLU, GPQA, HumanEval, MATH, SWE-bench, MMLU-Pro, AIME, etc. — use the ones that are relevant).

Return STRICT JSON in this exact shape:
{
  "datasets": ["<benchmark name>", "..."],
  "rows": [
    { "model": "<name>", "scores": { "<benchmark>": "<score or %>" } }
  ],
  "notes": "<caveats, e.g. self-reported, which version, as of when>"
}

Include 3-6 models and 3-6 datasets. Use real published numbers where possible; mark estimates.`;
}

export function factCheckPrompt(topic: string, claims: string) {
  return `TOPIC: "${topic}"

You are fact-checking the following claims gathered during research:
${claims}

Cross-reference each important claim. Flag anything uncertain, disputed, rumored, or unverified.

Return STRICT JSON in this exact shape:
{
  "checks": [
    { "claim": "<the claim>", "verdict": "Verified|Partially True|Unverified|False|Rumor", "note": "<evidence or caveat with source url if possible>" }
  ]
}

Be rigorous. It is better to mark something "Unverified" than to confirm it without evidence.`;
}

export function synthesisPrompt(
  topic: string,
  plan: ResearchPlan,
  context: string,
) {
  return `You are producing the FINAL research package for a YouTube creator about:
TOPIC: "${topic}"

RESEARCH PLAN:
${JSON.stringify(plan, null, 2)}

COLLECTED RESEARCH (findings, sources, community, competitors, benchmarks, fact-checks):
${context}

Synthesize everything into ONE complete, polished research package as STRICT JSON.
Use ONLY the research provided plus your verification. Do not invent sources or numbers.
Mark uncertainty inline with "(unverified)" where appropriate.

Return JSON in EXACTLY this shape:
{
  "executiveSummary": "<4-7 sentence high-level summary a creator can read in 20 seconds>",
  "reportMarkdown": "<a focused Markdown research report (~500-700 words) with 4-6 ## sections, concise bullet points, and inline [title](url) citations. Cover overview, key facts, technical details, community sentiment, competitive position, and analysis. Be information-dense, not verbose.>",
  "keyMetrics": [ { "label": "<metric>", "value": "<value>", "context": "<optional>" } ],
  "talkingPoints": [
    { "title": "<short hook title>", "detail": "<1-3 sentence explainer>", "type": "Hook|Data|Hot Take|Surprise|Comparison" }
  ],
  "script": {
    "hook": "<a punchy 1-2 sentence hook>",
    "intro": "<the intro section text>",
    "sections": [ { "heading": "<section title>", "content": "<talking points / script beats for this section>", "duration": "<e.g. 0:00-1:30>" } ],
    "outro": "<call-to-action outro>"
  },
  "thumbnails": [
    { "title": "<idea name>", "visual": "<describe the scene/imagery>", "textOverlay": "<big text on the thumbnail>", "vibe": "<emotion/energy>" }
  ],
  "seo": {
    "titles": ["<5 click-worthy titles>"],
    "descriptions": ["<2-3 description variants, ~150 chars>"],
    "tags": ["<15-25 relevant tags>"],
    "hashtags": ["<8-12 hashtags>"]
  },
  "community": {
    "summary": "<3-5 sentence summary of community sentiment across Reddit/HN/X>",
    "posts": [ { "platform": "<Reddit|HN|X|GitHub>", "sentiment": "positive|negative|neutral|mixed", "summary": "<the takeaway>", "source": "<url if known>" } ]
  },
  "opportunities": [
    { "title": "<angle name>", "angle": "<the specific content angle>", "why": "<why competitors/creators are missing this>" }
  ]
}

Requirements:
- talkingPoints: exactly 15-20 items.
- thumbnails: exactly 10 items.
- script.sections: 4-6 sections.
- Make reportMarkdown genuinely detailed and well-structured.
- Only output the JSON object. No prose before or after.`;
}
