import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg brand-gradient glow-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4.5 w-4.5 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3l1.9 4.6L18.5 9l-3.4 3.2.9 4.8L12 14.9 8 17l.9-4.8L5.5 9l4.6-1.4L12 3z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight">
          Deep Research
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          YouTube Agent
        </span>
      </div>
    </div>
  );
}
