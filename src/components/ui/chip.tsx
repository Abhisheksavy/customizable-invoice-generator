import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

interface ChipProps extends ComponentProps<"button"> {
  active?: boolean;
}

/** Small pill button for quick picks such as payment terms. */
export function Chip({ active = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3",
        active
          ? "border-ink bg-ink text-white"
          : "border-line-strong bg-surface text-ink-soft hover:border-ink-muted hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
