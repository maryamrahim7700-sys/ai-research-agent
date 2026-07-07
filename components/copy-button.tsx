"use client";

import { Check, Copy, type LucideProps } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/export";

export function CopyButton({
  text,
  label,
  className,
  size = 14,
}: {
  text: string;
  label?: string;
  className?: string;
  size?: number;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        copyText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check className="text-success" style={{ width: size, height: size }} />
      ) : (
        <Copy style={{ width: size, height: size }} />
      )}
      {label ?? (copied ? "Copied" : "Copy")}
    </button>
  );
}

export function CopyIcon({ copied, ...props }: LucideProps & { copied?: boolean }) {
  return copied ? (
    <Check className="text-success" {...props} />
  ) : (
    <Copy {...props} />
  );
}
