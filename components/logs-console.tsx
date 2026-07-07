"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry } from "@/hooks/use-research";

export function LogsConsole({ logs }: { logs: LogEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Agent Activity
        </span>
      </div>
      <ScrollArea className="h-32">
        <div className="space-y-0.5 p-3 font-mono text-[11px] leading-relaxed">
          {logs.map((l) => (
            <div key={l.id} className="flex gap-2">
              <span
                suppressHydrationWarning
                className="shrink-0 text-muted-foreground/40"
              >
                {new Date(l.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="text-foreground/70">{l.message}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
