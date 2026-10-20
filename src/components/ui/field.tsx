"use client";

import { CircleAlert } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldControlProps {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  hideLabel?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/** Labels a control and links its hint and error text so screen readers announce them. */
export function Field({
  label,
  hint,
  error,
  optional,
  hideLabel,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className={cn(
          "flex items-baseline gap-1.5 text-sm font-medium text-ink-soft",
          hideLabel && "sr-only",
        )}
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-ink-muted">
            <span className="sr-only">, </span>
            Optional
          </span>
        )}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error ? (
        <p id={errorId} className="flex items-start gap-1 text-xs font-medium text-danger">
          <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
