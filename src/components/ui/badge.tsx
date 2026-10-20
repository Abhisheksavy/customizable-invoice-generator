import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-ink/[0.05] text-ink-soft ring-ink/10",
  success: "bg-success-tint text-success ring-success/20",
  warning: "bg-warning-tint text-warning ring-warning/20",
};

interface BadgeProps {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
