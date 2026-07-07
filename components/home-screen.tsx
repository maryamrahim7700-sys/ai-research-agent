"use client";

import { motion } from "framer-motion";
import { ArrowRight, Compass, Layers, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const EXAMPLES = [
  "Claude Mythos 5",
  "OpenAI GPT-6",
  "Gemini 3 Ultra",
  "Cursor AI",
  "AI Video Generation",
  "AI Agents",
  "OpenAI",
  "DeepSeek V4",
];

const FEATURES = [
  {
    icon: Search,
    title: "Autonomous research",
    desc: "Plans, searches 7+ sources, and reasons over results on its own.",
  },
  {
    icon: ShieldCheck,
    title: "Fact-checked",
    desc: "Every claim is cross-referenced. Uncertainty is always flagged.",
  },
  {
    icon: Layers,
    title: "Creator-ready",
    desc: "Scripts, thumbnails, SEO, talking points and competitor matrix.",
  },
];

export function HomeScreen({ onStart }: { onStart: (topic: string) => void }) {
  const [value, setValue] = useState("");

  const submit = (topic?: string) => {
    const t = (topic ?? value).trim();
    if (!t) return;
    onStart(t);
  };

  return (
    <div className="app-bg relative min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Logo />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Autonomous multi-step research agent
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            <span className="gradient-text">What do you want</span>
            <br />
            <span className="text-foreground">to research today?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            One prompt. The agent plans the workflow, searches official sources,
            news, Reddit, HN, GitHub &amp; X, verifies the facts, and builds a
            complete YouTube research package.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="group mt-9 w-full"
        >
          <div className="glass flex items-center gap-2 rounded-2xl p-2 shadow-2xl transition-all focus-within:border-primary/40 focus-within:glow-primary">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. Claude Mythos 5, GPT-6, AI Video Generation…"
              className="h-11 w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <Button
              type="submit"
              size="lg"
              variant="gradient"
              disabled={!value.trim()}
              className="shrink-0"
            >
              Research
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setValue(ex);
                submit(ex);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary-soft hover:text-foreground"
            >
              <Compass className="h-3 w-3" />
              {ex}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass rounded-xl p-4 transition-colors hover:border-border-strong"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-foreground">{f.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {f.desc}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
