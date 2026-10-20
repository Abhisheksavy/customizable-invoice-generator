"use client";

import { Eye, PenLine } from "lucide-react";
import { cn } from "@/lib/cn";

export type EditorView = "edit" | "preview";

const OPTIONS = [
  { view: "edit", label: "Edit", icon: PenLine },
  { view: "preview", label: "Preview", icon: Eye },
] as const;

/** Phone-only toggle between the form and the invoice preview. */
export function ViewSwitch({
  view,
  onChange,
}: {
  view: EditorView;
  onChange: (view: EditorView) => void;
}) {
  return (
    <div className="sticky top-16 z-20 border-b border-line/70 bg-canvas/90 px-4 py-2 backdrop-blur-md lg:hidden print:hidden">
      <div
        role="group"
        aria-label="Editor view"
        className="mx-auto grid max-w-md grid-cols-2 gap-1 rounded-xl bg-ink/[0.06] p-1"
      >
        {OPTIONS.map(({ view: option, label, icon: Icon }) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => onChange(option)}
            className={cn(
              "flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
              view === option ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
