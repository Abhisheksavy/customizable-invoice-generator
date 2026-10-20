import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditorSkeleton } from "@/features/invoice-editor/editor-skeleton";
import { InvoiceEditor } from "@/features/invoice-editor/invoice-editor";
import { toInvoiceInput } from "@/features/invoice-editor/invoice-form-values";
import { loadInvoice } from "@/server/page-data";

export async function generateMetadata({ params }: PageProps<"/invoices/[id]">): Promise<Metadata> {
  const invoice = await loadInvoice((await params).id);
  return {
    title: invoice ? `${invoice.invoiceNumber} · ${invoice.customer.name}` : "Invoice not found",
  };
}

export default function InvoicePage({ params }: PageProps<"/invoices/[id]">) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <SavedInvoiceEditor params={params} />
    </Suspense>
  );
}

async function SavedInvoiceEditor({ params }: Pick<PageProps<"/invoices/[id]">, "params">) {
  const invoice = await loadInvoice((await params).id);
  if (!invoice) notFound();

  return (
    <InvoiceEditor
      key={invoice.id}
      initialValues={toInvoiceInput(invoice)}
      savedInvoice={{ id: invoice.id, status: invoice.status, sentAt: invoice.sentAt }}
    />
  );
}
