import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

interface SwitchProps extends Omit<ComponentProps<"button">, "onChange" | "role"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** On/off toggle announced as a switch; give it a label with aria-label or aria-labelledby. */
export function Switch({ checked, onCheckedChange, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-brand" : "bg-line-strong",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-4.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[1.125rem]" : "translate-x-[0.1875rem]",
        )}
      />
    </button>
  );
}
