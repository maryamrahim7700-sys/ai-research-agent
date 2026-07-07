"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bookmark,
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  FileText,
  Hash,
  Image,
  Lightbulb,
  ListChecks,
  MessagesSquare,
  Scale,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import {
  copyText,
  exportJson,
  exportMarkdown,
  reportToMarkdown,
} from "@/lib/export";
import { cn } from "@/lib/utils";
import type { Competitor, ResearchReport } from "@/lib/types";

function scoreToNum(v: string): number | null {
  if (!v) return null;
  const m = String(v).match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (String(v).includes("/") && n > 5) return null; // ratios like 3/5
  return n;
}

export function ResultsView({
  report,
  onSave,
}: {
  report: ResearchReport;
  onSave?: () => void;
}) {
  const [tab, setTab] = useState("summary");

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{report.topic}</h2>
            <p suppressHydrationWarning className="text-[11px] text-muted-foreground">
              Research complete · {report.sources.length} sources ·{" "}
              {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onSave && (
            <Button variant="secondary" size="sm" onClick={onSave}>
              <Bookmark className="h-3.5 w-3.5" />
              Save
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyText(reportToMarkdown(report))}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportMarkdown(report)}>
            <FileText className="h-3.5 w-3.5" />
            MD
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportJson(report)}>
            <FileJson className="h-3.5 w-3.5" />
            JSON
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-5 py-4">
        <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col">
          <div className="overflow-x-auto pb-1">
            <TabsList>
              <TabsTrigger value="summary"><Sparkles className="h-3.5 w-3.5" />Summary</TabsTrigger>
              <TabsTrigger value="report"><FileText className="h-3.5 w-3.5" />Report</TabsTrigger>
              <TabsTrigger value="points"><ListChecks className="h-3.5 w-3.5" />Talking Points</TabsTrigger>
              <TabsTrigger value="script"><TrendingUp className="h-3.5 w-3.5" />Script</TabsTrigger>
              <TabsTrigger value="thumbnails"><Image className="h-3.5 w-3.5" />Thumbnails</TabsTrigger>
              <TabsTrigger value="seo"><Tag className="h-3.5 w-3.5" />SEO</TabsTrigger>
              <TabsTrigger value="matrix"><Scale className="h-3.5 w-3.5" />Matrix</TabsTrigger>
              <TabsTrigger value="community"><MessagesSquare className="h-3.5 w-3.5" />Community</TabsTrigger>
              <TabsTrigger value="opportunities"><Lightbulb className="h-3.5 w-3.5" />Opportunities</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="pb-10 pr-2">
              <TabsContent value="summary">
                <SummaryTab report={report} />
              </TabsContent>
              <TabsContent value="report">
                <ReportTab report={report} />
              </TabsContent>
              <TabsContent value="points">
                <TalkingPointsTab report={report} />
              </TabsContent>
              <TabsContent value="script">
                <ScriptTab report={report} />
              </TabsContent>
              <TabsContent value="thumbnails">
                <ThumbnailsTab report={report} />
              </TabsContent>
              <TabsContent value="seo">
                <SeoTab report={report} />
              </TabsContent>
              <TabsContent value="matrix">
                <MatrixTab report={report} />
              </TabsContent>
              <TabsContent value="community">
                <CommunityTab report={report} />
              </TabsContent>
              <TabsContent value="opportunities">
                <OpportunitiesTab report={report} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}

function TabHeader({ title, desc, icon: Icon }: { title: string; desc: string; icon: typeof Sparkles }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function SummaryTab({ report }: { report: ResearchReport }) {
  const e = report.plan.entities ?? {};
  const entityGroups: { label: string; items?: string[] }[] = [
    { label: "Companies", items: e.companies },
    { label: "Products", items: e.products },
    { label: "Technologies", items: e.technologies },
    { label: "Languages", items: e.languages },
    { label: "Frameworks", items: e.frameworks },
    { label: "People", items: e.people },
    { label: "Timeline", items: e.timeline },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" /> Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[15px] leading-relaxed text-foreground/90">
            {report.executiveSummary || "—"}
          </p>
        </CardContent>
      </Card>

      {report.keyMetrics && report.keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {report.keyMetrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </div>
                  <div className="mt-1 text-xl font-semibold text-foreground">
                    {m.value}
                  </div>
                  {m.context && (
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {m.context}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Research Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {report.plan.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {o}
                </li>
              ))}
              {!report.plan.objectives.length && <EmptyText />}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Key Entities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entityGroups
              .filter((g) => g.items && g.items.length)
              .map((g) => (
                <div key={g.label}>
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {g.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items!.map((it) => (
                      <Badge key={it} variant="muted">
                        {it}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            {!entityGroups.some((g) => g.items && g.items.length) && <EmptyText />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportTab({ report }: { report: ResearchReport }) {
  return (
    <div className="space-y-4">
      <Markdown>{report.reportMarkdown || "No report generated."}</Markdown>
      {report.factCheck.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" /> Fact Verification
              <span className="text-xs font-normal text-muted-foreground">
                ({report.factCheck.filter((c) => c.verdict === "Verified").length}/
                {report.factCheck.length} verified)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.factCheck.map((c, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-white/[0.02] p-3"
              >
                <VerdictBadge verdict={c.verdict} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground/90">{c.claim}</p>
                  {c.note && (
                    <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, string> = {
    Verified: "success",
    "Partially True": "primary",
    Unverified: "muted",
    False: "danger",
    Rumor: "warning",
  };
  return (
    <Badge variant={(map[verdict] as never) ?? "muted"} className="h-fit shrink-0">
      {verdict}
    </Badge>
  );
}

function TalkingPointsTab({ report }: { report: ResearchReport }) {
  const all = report.talkingPoints
    .map((t) => `• ${t.title}${t.type ? ` [${t.type}]` : ""}: ${t.detail}`)
    .join("\n");
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <TabHeader title="Main Talking Points" desc={`${report.talkingPoints.length} points for your video`} icon={ListChecks} />
        <CopyButton text={all} label="Copy all" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {report.talkingPoints.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4) }}
          >
            <Card className="group h-full">
              <CardContent className="p-4">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    {t.type && <Badge variant="accent">{t.type}</Badge>}
                  </div>
                  <CopyButton text={`${t.title}: ${t.detail}`} label="" className="opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="text-sm font-medium text-foreground">{t.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {t.detail}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {!report.talkingPoints.length && <EmptyText />}
      </div>
    </div>
  );
}

function ScriptTab({ report }: { report: ResearchReport }) {
  const s = report.script;
  const full = `HOOK: ${s.hook}\n\nINTRO: ${s.intro}\n\n${s.sections
    .map((sec) => `${sec.heading}${sec.duration ? ` (${sec.duration})` : ""}:\n${sec.content}`)
    .join("\n\n")}\n\nOUTRO: ${s.outro}`;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <TabHeader title="YouTube Script Outline" desc="Hook · Intro · Sections · Outro" icon={TrendingUp} />
        <CopyButton text={full} label="Copy script" />
      </div>
      <div className="space-y-3">
        <ScriptBlock label="Hook" color="primary" text={s.hook} />
        <ScriptBlock label="Intro" color="accent" text={s.intro} />
        {s.sections.map((sec, i) => (
          <ScriptBlock
            key={i}
            label={sec.heading}
            badge={sec.duration}
            color="default"
            text={sec.content}
          />
        ))}
        <ScriptBlock label="Outro / CTA" color="success" text={s.outro} />
      </div>
    </div>
  );
}

function ScriptBlock({
  label,
  text,
  color,
  badge,
}: {
  label: string;
  text: string;
  color: "primary" | "accent" | "success" | "default";
  badge?: string;
}) {
  const colorMap = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    success: "bg-success/10 text-success",
    default: "bg-white/[0.05] text-muted-foreground",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", colorMap[color])}>
            {label}
          </span>
          {badge && <span className="text-[11px] text-muted-foreground">{badge}</span>}
        </div>
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
          {text || "—"}
        </p>
      </CardContent>
    </Card>
  );
}

function ThumbnailsTab({ report }: { report: ResearchReport }) {
  return (
    <div>
      <TabHeader title="Thumbnail Ideas" desc={`${report.thumbnails.length} concepts to test`} icon={Image} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {report.thumbnails.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
          >
            <Card className="group h-full overflow-hidden">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-surface-2 to-accent/10 p-4">
                <div className="bg-grid absolute inset-0 opacity-40" />
                <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-[11px] font-semibold text-white backdrop-blur">
                  {i + 1}
                </span>
                <div className="relative text-center">
                  <div className="text-lg font-black uppercase leading-tight tracking-tight text-white drop-shadow-lg">
                    {t.textOverlay}
                  </div>
                </div>
                <Badge className="absolute bottom-2 right-2" variant="default">
                  {t.vibe}
                </Badge>
              </div>
              <CardContent className="p-3">
                <div className="text-sm font-medium text-foreground">{t.title}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {t.visual}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {!report.thumbnails.length && <EmptyText />}
      </div>
    </div>
  );
}

function SeoTab({ report }: { report: ResearchReport }) {
  const seo = report.seo;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SeoGroup
        icon={TrendingUp}
        title="Titles"
        items={seo.titles}
        copyAll={seo.titles.join("\n")}
      />
      <SeoGroup
        icon={FileText}
        title="Descriptions"
        items={seo.descriptions}
        copyAll={seo.descriptions.join("\n\n")}
      />
      <SeoGroup
        icon={Tag}
        title="Tags"
        items={seo.tags}
        copyAll={seo.tags.join(", ")}
        asChips
      />
      <SeoGroup
        icon={Hash}
        title="Hashtags"
        items={seo.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`))}
        copyAll={seo.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
        asChips
      />
    </div>
  );
}

function SeoGroup({
  icon: Icon,
  title,
  items,
  copyAll,
  asChips,
}: {
  icon: typeof Tag;
  title: string;
  items: string[];
  copyAll: string;
  asChips?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          {title}
          <span className="text-xs font-normal text-muted-foreground">
            ({items.length})
          </span>
        </CardTitle>
        {items.length > 0 && <CopyButton text={copyAll} label="Copy" />}
      </CardHeader>
      <CardContent>
        {asChips ? (
          <div className="flex flex-wrap gap-1.5">
            {items.map((t, i) => (
              <Badge key={i} variant="muted" className="text-[11px]">
                {t}
              </Badge>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((t, i) => (
              <li
                key={i}
                className="group flex items-start justify-between gap-2 rounded-lg border border-border bg-white/[0.02] p-2.5 text-[13px] text-foreground/85"
              >
                <span>{t}</span>
                <CopyButton text={t} label="" className="opacity-0 transition-opacity group-hover:opacity-100" />
              </li>
            ))}
          </ul>
        )}
        {!items.length && <EmptyText />}
      </CardContent>
    </Card>
  );
}

function MatrixTab({ report }: { report: ResearchReport }) {
  const cols =
    report.competitorColumns && report.competitorColumns.length
      ? report.competitorColumns
      : ["pricing", "contextWindow", "reasoning", "coding", "vision", "speed"];

  const pretty = (k: string) =>
    k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  return (
    <div>
      <TabHeader title="Competitor Matrix" desc={`${report.competitors.length} products compared`} icon={Scale} />
      {report.competitors.length === 0 ? (
        <EmptyText />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="sticky left-0 z-10 bg-white/[0.03] px-3 py-2.5 text-left font-semibold text-foreground">
                    Product
                  </th>
                  {cols.map((c) => (
                    <th key={c} className="px-3 py-2.5 text-left font-semibold text-foreground whitespace-nowrap">
                      {pretty(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.competitors.map((c, i) => (
                  <tr key={i} className="border-t border-border hover:bg-white/[0.02]">
                    <td className="sticky left-0 z-10 bg-card px-3 py-2.5 font-medium text-foreground">
                      {(c as Competitor).name}
                    </td>
                    {cols.map((c2) => (
                      <td key={c2} className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {String((c as Record<string, unknown>)?.[c2] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {report.competitors.map((c, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold text-foreground">
                    {(c as Competitor).name}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                    <div>
                      <div className="flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-3 w-3" /> Strengths
                      </div>
                      <ul className="mt-1 space-y-0.5 text-muted-foreground">
                        {c.strengths?.map((s, j) => <li key={j}>• {s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-warning">
                        <Lightbulb className="h-3 w-3" /> Weaknesses
                      </div>
                      <ul className="mt-1 space-y-0.5 text-muted-foreground">
                        {c.weaknesses?.map((s, j) => <li key={j}>• {s}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {report.benchmarks.rows.length > 0 && (
            <div className="mt-6">
              <TabHeader title="Benchmark Analysis" desc="Published scores across evaluation suites" icon={BarChart3} />
              <div className="space-y-4">
                {report.benchmarks.datasets.map((ds) => (
                  <BenchmarkBars
                    key={ds}
                    dataset={ds}
                    rows={report.benchmarks.rows}
                  />
                ))}
                {report.benchmarks.notes && (
                  <p className="text-xs italic text-muted-foreground">
                    {report.benchmarks.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BenchmarkBars({
  dataset,
  rows,
}: {
  dataset: string;
  rows: { model: string; scores: Record<string, string> }[];
}) {
  const data = rows
    .map((r) => {
      const raw = r.scores[dataset];
      const num = scoreToNum(raw ?? "");
      return { model: r.model, raw, num };
    })
    .filter((d) => d.num !== null)
    .sort((a, b) => (b.num ?? 0) - (a.num ?? 0));

  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.num ?? 0), 100);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-3 text-sm font-medium">{dataset}</div>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-28 shrink-0 truncate text-[12px] text-muted-foreground">
              {d.model}
            </div>
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((d.num ?? 0) / max) * 100)}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                className="flex h-full items-center justify-end rounded-md brand-gradient pr-2"
              >
                <span className="text-[10px] font-semibold text-white">
                  {d.raw}
                </span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityTab({ report }: { report: ResearchReport }) {
  const c = report.community;
  return (
    <div>
      <TabHeader title="Community Insights" desc="Reddit · Hacker News · X · GitHub" icon={Users} />
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-[14px] leading-relaxed text-foreground/90">
            {c.summary || "—"}
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {c.posts.map((p, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="default">{p.platform}</Badge>
                <SentimentBadge sentiment={p.sentiment} />
              </div>
              <p className="text-[13px] leading-relaxed text-foreground/85">
                {p.summary}
              </p>
              {p.source && (
                <a
                  href={p.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[11px] text-accent hover:underline"
                >
                  View source ↗
                </a>
              )}
            </CardContent>
          </Card>
        ))}
        {!c.posts.length && <EmptyText />}
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const map: Record<string, string> = {
    positive: "success",
    negative: "danger",
    neutral: "muted",
    mixed: "warning",
  };
  return (
    <Badge variant={(map[sentiment] as never) ?? "muted"} className="capitalize">
      {sentiment}
    </Badge>
  );
}

function OpportunitiesTab({ report }: { report: ResearchReport }) {
  return (
    <div>
      <TabHeader title="Hidden Opportunities" desc="Angles other creators are missing" icon={Lightbulb} />
      <div className="grid gap-3 sm:grid-cols-2">
        {report.opportunities.map((o, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.4) }}
          >
            <Card className="h-full border-primary/20">
              <CardContent className="p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {o.title}
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/85">
                  {o.angle}
                </p>
                {o.why && (
                  <p className="mt-2 rounded-md bg-white/[0.03] p-2 text-[12px] text-muted-foreground">
                    <span className="font-medium text-foreground/80">Why it works: </span>
                    {o.why}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {!report.opportunities.length && <EmptyText />}
      </div>
    </div>
  );
}

function EmptyText() {
  return (
    <p className="text-sm italic text-muted-foreground/60">
      No data was returned for this section.
    </p>
  );
}
