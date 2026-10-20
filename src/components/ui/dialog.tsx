"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  dismissible?: boolean;
  className?: string;
  children: ReactNode;
}

/** Modal on top of the native <dialog>: the browser handles focus trapping, Escape and focus return. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  dismissible = true,
  className,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        if (!dismissible) event.preventDefault();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-full max-w-lg overflow-visible bg-transparent p-0 text-ink backdrop:bg-transparent open:animate-rise max-sm:mb-0 max-sm:max-w-none print:hidden",
        className,
      )}
    >
      <div className="rounded-2xl bg-surface p-5 shadow-float max-sm:rounded-b-none max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <div id={descriptionId} className="mt-1 text-sm text-ink-muted">
                {description}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onClose}
            disabled={!dismissible}
          >
            <X aria-hidden />
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
