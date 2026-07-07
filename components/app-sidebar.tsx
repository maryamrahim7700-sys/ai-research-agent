"use client";

import {
  Bookmark,
  Clock,
  FileText,
  History,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deleteReport, loadHistory, loadSavedReports } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { SavedReport } from "@/lib/storage";
import { Logo } from "@/components/logo";

type Props = {
  onNew: () => void;
  onStart: (topic: string) => void;
  onOpenReport: (r: SavedReport) => void;
  onClose?: () => void;
  activeTopic?: string;
};

export function AppSidebar({
  onNew,
  onStart,
  onOpenReport,
  onClose,
  activeTopic,
}: Props) {
  const [saved, setSaved] = useState<SavedReport[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setSaved(loadSavedReports());
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    const refresh = () => {
      setSaved(loadSavedReports());
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("yra:saved", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("yra:saved", refresh);
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-surface/60 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4">
        <Logo />
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3">
        <Button
          variant="gradient"
          className="w-full"
          onClick={onNew}
        >
          <Plus className="h-4 w-4" />
          New Research
        </Button>
      </div>

      <ScrollArea className="mt-4 flex-1 px-3">
        <div className="space-y-6 pb-6">
          <Section icon={History} label="History">
            {history.length === 0 ? (
              <Empty text="No history yet" />
            ) : (
              history.map((t) => (
                <button
                  key={t}
                  onClick={() => onStart(t)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground",
                    activeTopic === t && "bg-white/[0.05] text-foreground",
                  )}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="truncate">{t}</span>
                </button>
              ))
            )}
          </Section>

          <Section icon={Bookmark} label="Saved Reports">
            {saved.length === 0 ? (
              <Empty text="Saved reports appear here" />
            ) : (
              saved.map((r) => (
                <div
                  key={r.id}
                  className="group flex items-center gap-1 rounded-lg pr-1 hover:bg-white/[0.05]"
                >
                  <button
                    onClick={() => onOpenReport(r)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="truncate">{r.topic}</span>
                  </button>
                  <button
                    onClick={() => setSaved(deleteReport(r.id))}
                    className="rounded p-1 text-muted-foreground/0 transition-all hover:text-danger group-hover:text-muted-foreground"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </Section>

          <Section icon={Sparkles} label="Templates">
            {[
              "AI Model Deep Dive",
              "Startup Breakdown",
              "Framework Comparison",
              "Trend Analysis",
            ].map((t) => (
              <button
                key={t}
                onClick={() => onStart(t)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <span className="truncate">{t}</span>
              </button>
            ))}
          </Section>
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-2.5 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-[10px] font-bold text-primary">
            SF
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium text-foreground">
              stepfun/step-3.7-flash
            </div>
            <div className="text-[10px] text-muted-foreground">
              via OpenRouter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof History;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-2.5 py-1.5 text-[12px] italic text-muted-foreground/50">
      {text}
    </div>
  );
}
