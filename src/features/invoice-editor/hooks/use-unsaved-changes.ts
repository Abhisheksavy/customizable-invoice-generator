"use client";

import { useEffect } from "react";
import { useFormState, useWatch } from "react-hook-form";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { snapshotOf } from "../invoice-form-values";

/** True when the form differs from the last save, or from its starting values if it was never saved. */
export function useHasUnsavedChanges(savedSnapshot: string | null): boolean {
  const values = useWatch<InvoiceInput>();
  const { defaultValues } = useFormState<InvoiceInput>();
  return snapshotOf(values) !== (savedSnapshot ?? snapshotOf(defaultValues));
}

/** Asks the browser to confirm before the tab is closed or reloaded with unsaved changes. */
export function useBeforeUnloadWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [enabled]);
}
