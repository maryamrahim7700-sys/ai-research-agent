export type StepDef = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

export const WORKFLOW_STEPS: StepDef[] = [
  {
    id: "plan",
    label: "Planning Research",
    description: "Understanding the topic and mapping the research strategy",
    icon: "Brain",
  },
  {
    id: "official",
    label: "Searching Official Sources",
    description: "Official websites, docs, release notes and company blogs",
    icon: "Globe",
  },
  {
    id: "news",
    label: "Searching News",
    description: "Latest announcements, coverage and press releases",
    icon: "Newspaper",
  },
  {
    id: "reddit",
    label: "Searching Reddit",
    description: "Community discussions, opinions and real-world usage",
    icon: "MessageCircle",
  },
  {
    id: "hackernews",
    label: "Searching Hacker News",
    description: "Developer commentary and technical analysis",
    icon: "Flame",
  },
  {
    id: "github",
    label: "Searching GitHub",
    description: "Repositories, issues, changelogs and stars",
    icon: "Github",
  },
  {
    id: "x",
    label: "Searching X",
    description: "Real-time takes, leaks and creator commentary",
    icon: "Twitter",
  },
  {
    id: "docs",
    label: "Reading Documentation",
    description: "API references, pricing, SDKs and capabilities",
    icon: "BookOpen",
  },
  {
    id: "competitors",
    label: "Comparing Competitors",
    description: "Building the competitive landscape matrix",
    icon: "Scale",
  },
  {
    id: "factcheck",
    label: "Fact Verification",
    description: "Cross-referencing claims and flagging uncertainty",
    icon: "ShieldCheck",
  },
  {
    id: "benchmarks",
    label: "Benchmark Analysis",
    description: "Comparing performance against leading models",
    icon: "BarChart3",
  },
  {
    id: "build",
    label: "Building Report",
    description: "Synthesizing everything into a structured report",
    icon: "Sparkles",
  },
];
