export type Source = {
  title: string;
  url: string;
  snippet?: string;
};

export type Finding = {
  id: string;
  stepId: string;
  kind: "fact" | "opinion" | "issue" | "news" | "benchmark" | "spec" | "note";
  text: string;
  sources?: Source[];
};

export type WorkflowStepStatus = "pending" | "active" | "done" | "error";

export type WorkflowStep = {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: WorkflowStepStatus;
  detail?: string;
  startedAt?: number;
  completedAt?: number;
};

export type Competitor = {
  name: string;
  features?: Record<string, string>;
  pricing?: string;
  contextWindow?: string;
  reasoning?: string;
  coding?: string;
  vision?: string;
  audio?: string;
  video?: string;
  toolCalling?: string;
  speed?: string;
  strengths?: string[];
  weaknesses?: string[];
};

export type BenchmarkRow = {
  model: string;
  scores: Record<string, string>;
};

export type ResearchPlan = {
  topic: string;
  summary: string;
  entities: {
    companies?: string[];
    products?: string[];
    technologies?: string[];
    languages?: string[];
    frameworks?: string[];
    people?: string[];
    timeline?: string[];
  };
  objectives: string[];
  searchQueries: string[];
};

export type TalkingPoint = {
  title: string;
  detail: string;
  type?: string;
};

export type ScriptSection = {
  heading: string;
  content: string;
  duration?: string;
};

export type ThumbnailIdea = {
  title: string;
  visual: string;
  textOverlay: string;
  vibe: string;
};

export type SeoPackage = {
  titles: string[];
  descriptions: string[];
  tags: string[];
  hashtags: string[];
};

export type CommunityPost = {
  platform: string;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  summary: string;
  source?: string;
};

export type Opportunity = {
  title: string;
  angle: string;
  why: string;
};

export type ResearchReport = {
  topic: string;
  generatedAt: string;
  plan: ResearchPlan;
  executiveSummary: string;
  reportMarkdown: string;
  keyMetrics?: { label: string; value: string; context?: string }[];
  talkingPoints: TalkingPoint[];
  script: {
    hook: string;
    intro: string;
    sections: ScriptSection[];
    outro: string;
  };
  thumbnails: ThumbnailIdea[];
  seo: SeoPackage;
  competitors: Competitor[];
  competitorColumns?: string[];
  benchmarks: {
    datasets: string[];
    rows: BenchmarkRow[];
    notes?: string;
  };
  community: {
    summary: string;
    posts: CommunityPost[];
  };
  opportunities: Opportunity[];
  sources: Source[];
  factCheck: { claim: string; verdict: string; note?: string }[];
};

export type AgentEvent =
  | { type: "topic"; topic: string }
  | { type: "plan"; plan: ResearchPlan }
  | { type: "step_start"; stepId: string }
  | { type: "step_detail"; stepId: string; detail: string }
  | { type: "finding"; finding: Finding }
  | { type: "source"; source: Source }
  | { type: "step_complete"; stepId: string }
  | { type: "log"; message: string }
  | { type: "report_reset" }
  | { type: "report_delta"; text: string }
  | { type: "report"; report: ResearchReport }
  | { type: "error"; message: string }
  | { type: "done" };
