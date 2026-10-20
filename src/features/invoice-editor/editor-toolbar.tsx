"use client";

import {
  ArrowLeft,
  Check,
  CircleCheck,
  CircleDashed,
  CircleDot,
  LoaderCircle,
  Printer,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore, type ComponentType } from "react";
import { useWatch } from "react-hook-form";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { InvoiceInput, InvoiceStatus } from "@/shared/dto/invoice.dto";
import { useBeforeUnloadWarning, useHasUnsavedChanges } from "./hooks/use-unsaved-changes";

type SaveState = "new" | "saving" | "dirty" | "saved";

const SAVE_STATES = {
  new: { icon: CircleDashed, text: "Not saved yet", tone: "text-ink-muted" },
  saving: { icon: LoaderCircle, text: "Saving…", tone: "text-ink-muted" },
  dirty: { icon: CircleDot, text: "Unsaved changes", tone: "text-warning" },
  saved: { icon: CircleCheck, text: "All changes saved", tone: "text-success" },
} satisfies Record<
  SaveState,
  { icon: ComponentType<{ className?: string }>; text: string; tone: string }
>;

interface EditorToolbarProps {
  status: InvoiceStatus;
  isNew: boolean;
  isSaving: boolean;
  savedSnapshot: string | null;
  onSave: () => void;
  onPrint: () => void;
  onSend: () => void;
  onDelete?: () => void;
}

export function EditorToolbar({
  status,
  isNew,
  isSaving,
  savedSnapshot,
  onSave,
  onPrint,
  onSend,
  onDelete,
}: EditorToolbarProps) {
  const invoiceNumber = useWatch<InvoiceInput, "invoiceNumber">({ name: "invoiceNumber" });
  const hasUnsavedChanges = useHasUnsavedChanges(savedSnapshot);
  useBeforeUnloadWarning(hasUnsavedChanges);

  const saveState: SaveState = isSaving
    ? "saving"
    : isNew
      ? "new"
      : hasUnsavedChanges
        ? "dirty"
        : "saved";
  const title = isNew ? "New invoice" : invoiceNumber.trim() || "Untitled invoice";

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link
          href="/invoices"
          aria-label="All invoices"
          className={buttonStyles({ variant: "ghost", size: "icon-sm" })}
        >
          <ArrowLeft aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold sm:text-base">{title}</h1>
            {!isNew && <InvoiceStatusBadge status={status} />}
          </div>
          <SaveIndicator state={saveState} />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete invoice"
              title="Delete invoice"
              onClick={onDelete}
              className="text-ink-muted hover:text-danger"
            >
              <Trash2 aria-hidden />
            </Button>
          )}
          <ToolbarButton icon={Printer} label="Print / PDF" onClick={onPrint} />
          <ToolbarButton icon={Send} label="Send" onClick={onSend} />
          <Button onClick={onSave} disabled={isSaving} className="max-lg:hidden">
            {isSaving ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : (
              <Check aria-hidden />
            )}
            Save
            <SaveShortcutHint />
          </Button>
        </div>
      </div>
    </header>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const { icon: Icon, text, tone } = SAVE_STATES[state];
  return (
    <p role="status" className={cn("flex items-center gap-1 text-xs", tone)}>
      <Icon aria-hidden className={cn("size-3", state === "saving" && "animate-spin")} />
      {text}
    </p>
  );
}

interface ToolbarButtonProps {
  icon: ComponentType<{ "aria-hidden"?: boolean }>;
  label: string;
  onClick: () => void;
}

/** Icon and label on wider screens, icon only (still labelled for screen readers) on phones. */
function ToolbarButton({ icon: Icon, label, onClick }: ToolbarButtonProps) {
  return (
    <Button variant="secondary" onClick={onClick} className="max-sm:size-11 max-sm:px-0">
      <Icon aria-hidden />
      <span className="max-sm:sr-only">{label}</span>
    </Button>
  );
}

const subscribeToNothing = () => () => {};

function SaveShortcutHint() {
  const isApple = useSyncExternalStore(
    subscribeToNothing,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => true,
  );
  return (
    <kbd className="ml-0.5 rounded border border-white/25 px-1.5 py-px font-sans text-[11px] font-normal text-white/75">
      {isApple ? "⌘S" : "Ctrl S"}
    </kbd>
  );
}
