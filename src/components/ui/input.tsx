import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const controlStyles =
  "w-full min-w-0 rounded-lg border border-line-strong bg-surface px-3 text-base text-ink shadow-card transition-colors placeholder:text-ink-muted/70 hover:border-ink-muted/60 focus-visible:border-brand aria-invalid:border-danger aria-invalid:bg-danger-tint/40 disabled:cursor-not-allowed disabled:bg-surface-muted sm:text-sm";

export interface InputProps extends ComponentProps<"input"> {
  leading?: ReactNode;
  trailing?: ReactNode;
}

/** Text input with optional inline adornments such as "$" or "%". */
export function Input({ leading, trailing, className, ...props }: InputProps) {
  const input = (
    <input
      className={cn(
        controlStyles,
        "h-11 sm:h-10",
        leading && "pl-7",
        trailing && "pr-8",
        className,
      )}
      {...props}
    />
  );
  if (!leading && !trailing) return input;

  return (
    <div className="relative min-w-0">
      {leading && <Affix side="left">{leading}</Affix>}
      {input}
      {trailing && <Affix side="right">{trailing}</Affix>}
    </div>
  );
}

function Affix({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 flex items-center text-sm text-ink-muted",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      {children}
    </span>
  );
}
