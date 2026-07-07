"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Link2, Quote, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatUrl } from "@/lib/utils";
import type { Finding, Source } from "@/lib/types";

const KIND_LABEL: Record<Finding["kind"], { label: string; variant: string }> = {
  fact: { label: "Fact", variant: "accent" },
  opinion: { label: "Opinion", variant: "default" },
  issue: { label: "Issue", variant: "warning" },
  news: { label: "News", variant: "primary" },
  benchmark: { label: "Benchmark", variant: "success" },
  spec: { label: "Spec", variant: "accent" },
  note: { label: "Note", variant: "muted" },
};

export function FindingsPanel({
  findings,
  sources,
}: {
  findings: Finding[];
  sources: Source[];
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-sm font-medium">Live Findings</div>
            <div className="text-[11px] text-muted-foreground">
              {findings.length} findings · {sources.length} sources
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-success">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          LIVE
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2.5 p-3">
          <AnimatePresence initial={false}>
            {findings
              .slice()
              .reverse()
              .map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <FindingCard finding={f} />
                </motion.div>
              ))}
          </AnimatePresence>

          {findings.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <div className="mb-2 h-10 w-10 rounded-full border border-border bg-white/[0.02]" />
              <p className="text-xs text-muted-foreground">
                Findings will stream in here as the agent researches…
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {sources.length > 0 && (
        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            <Link2 className="h-3 w-3" />
            Sources
          </div>
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
            {sources.slice(0, 30).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.title}
                className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span className="truncate">{formatUrl(s.url)}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const meta = KIND_LABEL[finding.kind] ?? KIND_LABEL.note;
  return (
    <div className="glass rounded-lg p-3 transition-colors hover:border-border-strong">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Badge variant={meta.variant as never} className="text-[10px] uppercase tracking-wide">
          {meta.label}
        </Badge>
        <Quote className="h-3 w-3 text-muted-foreground/40" />
      </div>
      <p className="text-[13px] leading-relaxed text-foreground/90">
        {finding.text}
      </p>
      {finding.sources && finding.sources.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {finding.sources.slice(0, 3).map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded text-[10px] text-accent transition-colors hover:underline"
            >
              <Link2 className="h-2.5 w-2.5" />
              {formatUrl(s.url)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
