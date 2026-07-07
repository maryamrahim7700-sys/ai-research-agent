"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { StepIcon } from "@/components/step-icon";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/types";

export function WorkflowTimeline({ steps }: { steps: WorkflowStep[] }) {
  const total = steps.length;
  const done = steps.filter((s) => s.status === "done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const activeStep = steps.find((s) => s.status === "active");

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Research Progress
          </span>
          <span className="text-xs font-semibold tabular-nums text-foreground">
            {done}/{total}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full brand-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {activeStep && (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            Currently: <span className="text-foreground">{activeStep.label}</span>
          </div>
        )}
      </div>

      <div className="relative">
        {steps.map((step, i) => (
          <TimelineRow key={step.id} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ step, index }: { step: WorkflowStep; index: number }) {
  const isActive = step.status === "active";
  const isDone = step.status === "done";

  return (
    <div className="relative flex gap-3 pb-1">
      <div className="flex flex-col items-center">
        <motion.div
          initial={false}
          animate={{
            scale: isActive ? 1.05 : 1,
            backgroundColor: isDone
              ? "rgba(52,211,153,0.15)"
              : isActive
                ? "rgba(124,92,255,0.18)"
                : "rgba(255,255,255,0.03)",
            borderColor: isDone
              ? "rgba(52,211,153,0.4)"
              : isActive
                ? "rgba(124,92,255,0.5)"
                : "rgba(255,255,255,0.08)",
          }}
          className={cn(
            "relative z-10 flex h-9 w-9 items-center justify-center rounded-xl border",
          )}
        >
          <AnimatePresence mode="wait">
            {isDone ? (
              <motion.div
                key="done"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <Check className="h-4 w-4 text-success" strokeWidth={3} />
              </motion.div>
            ) : isActive ? (
              <motion.div key="active">
                <StepIcon name={step.icon} className="h-4 w-4 text-primary" />
              </motion.div>
            ) : (
              <motion.div key="idle">
                <StepIcon
                  name={step.icon}
                  className="h-4 w-4 text-muted-foreground/50"
                />
              </motion.div>
            )}
          </AnimatePresence>
          {isActive && (
            <Loader2 className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 animate-spin text-primary" />
          )}
        </motion.div>

        {index < 11 && (
          <div
            className={cn(
              "w-px flex-1",
              isDone ? "bg-success/30" : "bg-border",
            )}
            style={{ minHeight: 18 }}
          />
        )}
      </div>

      <div className="flex-1 pb-4 pt-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isDone
                ? "text-foreground"
                : isActive
                  ? "text-foreground"
                  : "text-muted-foreground/60",
            )}
          >
            {step.label}
          </span>
          {isActive && (
            <span className="flex gap-0.5">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1 w-1 rounded-full bg-primary"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: d * 0.2,
                  }}
                />
              ))}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{step.description}</p>

        <AnimatePresence>
          {step.detail && (isDone || isActive) && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 overflow-hidden"
            >
              <div className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-muted-foreground">
                {step.detail}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
