import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorSkeleton } from "@/features/invoice-editor/editor-skeleton";
import { InvoiceEditor } from "@/features/invoice-editor/invoice-editor";
import { createNewInvoiceValues } from "@/features/invoice-editor/invoice-form-values";
import { loadNewInvoiceDefaults } from "@/server/page-data";

export const metadata: Metadata = { title: "New invoice" };

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <NewInvoiceEditor />
    </Suspense>
  );
}

async function NewInvoiceEditor() {
  const { defaults, today } = await loadNewInvoiceDefaults();
  // Keyed by the suggested number: an unsaved draft survives navigation, but saving starts the next one fresh.
  return (
    <InvoiceEditor
      key={defaults.invoiceNumber}
      initialValues={createNewInvoiceValues(defaults, today)}
    />
  );
}
