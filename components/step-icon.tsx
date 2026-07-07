"use client";

import {
  AtSign,
  BarChart3,
  BookOpen,
  Brain,
  Flame,
  GitBranch,
  Globe,
  MessageCircle,
  Newspaper,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Brain,
  Globe,
  Newspaper,
  MessageCircle,
  Flame,
  Github: GitBranch,
  Twitter: AtSign,
  BookOpen,
  Scale,
  ShieldCheck,
  BarChart3,
  Sparkles,
};

export function StepIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Sparkles;
  return <Icon className={className} />;
}
