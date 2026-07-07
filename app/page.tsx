"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Menu,
  PanelRightOpen,
  RefreshCw,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { FindingsPanel } from "@/components/findings-panel";
import { HomeScreen } from "@/components/home-screen";
import { LogsConsole } from "@/components/logs-console";
import { Logo } from "@/components/logo";
import { ResultsView } from "@/components/results-view";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { Button } from "@/components/ui/button";
import { useResearch } from "@/hooks/use-research";
import { pushHistory, saveReport, type SavedReport } from "@/lib/storage";
import type { ResearchReport } from "@/lib/types";

export default function Page() {
  const { state, start, reset, stop } = useResearch();
  const [openedReport, setOpenedReport] = useState<SavedReport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [findingsOpen, setFindingsOpen] = useState(true);

  const handleStart = (topic: string) => {
    setOpenedReport(null);
    pushHistory(topic);
    start(topic);
  };

  const handleReset = () => {
    setOpenedReport(null);
    reset();
  };

  const handleSave = () => {
    if (state.report) {
      saveReport(state.report);
      window.dispatchEvent(new Event("yra:saved"));
    }
  };

  const showHome =
    state.status === "idle" && !state.report && !openedReport && !state.topic;

  if (showHome) {
    return <HomeScreen onStart={handleStart} />;
  }

  const activeReport: ResearchReport | null =
    openedReport?.report ?? state.report ?? null;

  const buildActive = state.steps.find(
    (s) => s.id === "build" && s.status === "active",
  );

  return (
    <div className="app-bg flex h-screen w-full overflow-hidden">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <AppSidebar
          onNew={handleReset}
          onStart={handleStart}
          onOpenReport={(r) => {
            setOpenedReport(r);
            setSidebarOpen(false);
          }}
          activeTopic={state.topic}
        />
      </aside>

      {/* Sidebar - mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer-panel"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <AppSidebar
                onNew={() => {
                  handleReset();
                  setSidebarOpen(false);
                }}
                onStart={(t) => {
                  handleStart(t);
                  setSidebarOpen(false);
                }}
                onOpenReport={(r) => {
                  setOpenedReport(r);
                  setSidebarOpen(false);
                }}
                onClose={() => setSidebarOpen(false)}
                activeTopic={state.topic}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          topic={openedReport?.topic ?? state.topic}
          status={state.status}
          onMenu={() => setSidebarOpen(true)}
          onStop={stop}
          onReset={handleReset}
          showActions={!activeReport}
        />

        <div className="flex min-h-0 flex-1">
          {/* Center */}
          <div className="flex min-w-0 flex-1 flex-col">
            {state.status === "error" && !activeReport ? (
              <ErrorState message={state.error} onRetry={() => handleStart(state.topic)} onReset={handleReset} />
            ) : activeReport ? (
              <ResultsView report={activeReport} onSave={openedReport ? undefined : handleSave} />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[1fr_22rem]">
                  <div className="min-h-0 overflow-y-auto px-4 py-4 xl:border-r xl:border-border">
                    <div className="mx-auto max-w-2xl space-y-4">
                      {state.plan && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass rounded-xl p-4"
                        >
                          <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Research Plan
                          </div>
                          <p className="text-sm text-foreground/90">
                            {state.plan.summary}
                          </p>
                          {state.plan.searchQueries?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {state.plan.searchQueries.slice(0, 6).map((q, i) => (
                                <span
                                  key={i}
                                  className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted-foreground"
                                >
                                  {q}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      <WorkflowTimeline steps={state.steps} />
                      <LogsConsole logs={state.logs} />

                      {buildActive && (
                        <BuildPreview chars={state.reportDelta.length} />
                      )}
                    </div>
                  </div>

                  {/* Findings panel - desktop */}
                  <div className="hidden min-h-0 xl:block">
                    <FindingsPanel findings={state.findings} sources={state.sources} />
                  </div>
                </div>

                {/* Findings panel - mobile toggle */}
                <MobileFindings state={state} open={findingsOpen} setOpen={setFindingsOpen} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TopBar({
  topic,
  status,
  onMenu,
  onStop,
  onReset,
  showActions,
}: {
  topic: string;
  status: string;
  onMenu: () => void;
  onStop: () => void;
  onReset: () => void;
  showActions: boolean;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-md p-2 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="hidden min-w-0 lg:block">
          <div className="truncate text-sm font-medium">{topic || "Research"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === "researching" && (
          <Button variant="secondary" size="sm" onClick={onStop}>
            <Square className="h-3 w-3" />
            Stop
          </Button>
        )}
        {status === "done" && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RefreshCw className="h-3 w-3" />
            New
          </Button>
        )}
      </div>
    </header>
  );
}

function BuildPreview({ chars }: { chars: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex h-6 w-6 items-center justify-center rounded-md brand-gradient">
            <RefreshCw className="h-3 w-3 animate-spin text-white" />
          </span>
          Building your report…
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {chars.toLocaleString()} chars streamed
        </span>
      </div>
      <div className="space-y-2">
        {[100, 92, 96, 70, 88, 60].map((w, i) => (
          <div
            key={i}
            className="shimmer h-3 rounded bg-white/[0.05]"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ErrorState({
  message,
  onRetry,
  onReset,
}: {
  message: string | null;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="glass max-w-md rounded-xl p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/15 text-danger">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold">Research failed</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {message || "Something went wrong while running the agent."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="secondary" onClick={onReset}>
            Home
          </Button>
          <Button variant="gradient" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileFindings({
  state,
  open,
  setOpen,
}: {
  state: ReturnType<typeof useResearch>["state"];
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  useEffect(() => {}, []);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center gap-2 border-t border-border py-2 text-xs text-muted-foreground xl:hidden"
      >
        <PanelRightOpen className="h-3.5 w-3.5" />
        {open ? "Hide" : "Show"} findings ({state.findings.length})
      </button>
      {open && (
        <div className="max-h-64 border-t border-border xl:hidden">
          <FindingsPanel findings={state.findings} sources={state.sources} />
        </div>
      )}
    </>
  );
}
