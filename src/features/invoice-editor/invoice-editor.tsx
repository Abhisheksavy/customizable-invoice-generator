"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FormProvider, useForm, type FieldErrors, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { ApiError, invoiceApi } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { addDays, todayIsoDate } from "@/shared/dates";
import {
  invoiceInputSchema,
  type InvoiceDto,
  type InvoiceInput,
  type InvoiceStatus,
} from "@/shared/dto/invoice.dto";
import type { SendInvoiceInput } from "@/shared/dto/send-invoice.dto";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";
import { EditorToolbar } from "./editor-toolbar";
import { countFieldErrors } from "./form-errors";
import { useSaveShortcut } from "./hooks/use-save-shortcut";
import { DEFAULT_PAYMENT_TERMS_DAYS, snapshotOf } from "./invoice-form-values";
import { MobileActionBar } from "./mobile-action-bar";
import { PreviewPanel } from "./preview-panel";
import { AdjustmentsSection } from "./sections/adjustments-section";
import { CustomFieldsSection } from "./sections/custom-fields-section";
import { DetailsSection } from "./sections/details-section";
import { LineItemsSection } from "./sections/line-items-section";
import { NotesSection } from "./sections/notes-section";
import { PartySection } from "./sections/party-section";
import { StyleSection } from "./sections/style-section";
import { composeSendDefaults } from "./send-defaults";
import { SendInvoiceDialog, type SendOutcome } from "./send-invoice-dialog";
import { ViewSwitch, type EditorView } from "./view-switch";

export interface SavedInvoiceMeta {
  id: string;
  status: InvoiceStatus;
  sentAt: string | null;
}

interface InvoiceEditorProps {
  initialValues: InvoiceInput;
  savedInvoice?: SavedInvoiceMeta;
}

interface SendDialogState {
  defaults: SendInvoiceInput;
  savesFirst: boolean;
  replyTo: string;
}

/** The invoice workspace: form and live preview side by side, with save, print, send and delete. */
export function InvoiceEditor({ initialValues, savedInvoice }: InvoiceEditorProps) {
  const router = useRouter();
  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceInputSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });
  const [saved, setSaved] = useState<SavedInvoiceMeta | null>(savedInvoice ?? null);
  const [savedSnapshot, setSavedSnapshot] = useState(
    savedInvoice ? snapshotOf(initialValues) : null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<EditorView>("edit");
  const [sendDialog, setSendDialog] = useState<SendDialogState | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // New invoices are rendered with the server's date; switch to the browser's local date.
    if (savedInvoice) return;
    const today = todayIsoDate();
    if (form.getValues("issueDate") === today) return;
    form.resetField("issueDate", { defaultValue: today });
    form.resetField("dueDate", { defaultValue: addDays(today, DEFAULT_PAYMENT_TERMS_DAYS) });
  }, [form, savedInvoice]);

  useSaveShortcut(() => void handleSave());

  const hasUnsavedChanges = () => !saved || snapshotOf(form.getValues()) !== savedSnapshot;

  /** Sends validated values to the API; a new invoice gets its permanent URL without a reload. */
  async function persist(input: InvoiceInput): Promise<InvoiceDto | null> {
    const submittedSnapshot = snapshotOf(form.getValues());
    setIsSaving(true);
    try {
      const invoice = saved
        ? await invoiceApi.update(saved.id, input)
        : await invoiceApi.create(input);
      setSaved({ id: invoice.id, status: invoice.status, sentAt: invoice.sentAt });
      setSavedSnapshot(submittedSnapshot);
      if (!saved) window.history.replaceState(null, "", `/invoices/${invoice.id}`);
      return invoice;
    } catch (error) {
      showApiError(error);
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  /** Validates every field, then saves; resolves to the saved invoice, or null if anything failed. */
  function validateAndSave(): Promise<InvoiceDto | null> {
    return new Promise((resolve) => {
      void form.handleSubmit(
        async (input) => resolve(await persist(input)),
        (errors) => {
          showValidationSummary(errors);
          resolve(null);
        },
      )();
    });
  }

  async function handleSave() {
    if (isSaving) return;
    const isFirstSave = !saved;
    const invoice = await validateAndSave();
    if (invoice) toast.success(isFirstSave ? `${invoice.invoiceNumber} saved` : "Changes saved");
  }

  function showValidationSummary(errors: FieldErrors<InvoiceInput>) {
    setView("edit");
    const count = countFieldErrors(errors);
    toast.error(count === 1 ? "1 field needs attention" : `${count} fields need attention`, {
      description: "Fix the highlighted fields, then save again.",
    });
    focusFirstInvalidField();
  }

  /** Focuses the first invalid input once sections with errors have opened. */
  function focusFirstInvalidField() {
    setTimeout(() => {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }, 60);
  }

  function showApiError(error: unknown) {
    if (!(error instanceof ApiError)) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    for (const { path, message } of error.fieldErrors) {
      form.setError(path as FieldPath<InvoiceInput>, { type: "server", message });
    }
    if (error.fieldErrors.length > 0) {
      setView("edit");
      focusFirstInvalidField();
    }
    toast.error(error.message);
  }

  function openSendDialog() {
    const values = form.getValues();
    setSendDialog({
      defaults: composeSendDefaults(values),
      savesFirst: hasUnsavedChanges(),
      replyTo: values.business.email.trim(),
    });
  }

  async function handleSend(input: SendInvoiceInput): Promise<SendOutcome> {
    let invoiceId = saved?.id;
    if (!invoiceId || hasUnsavedChanges()) {
      const invoice = await validateAndSave();
      if (!invoice) {
        setSendDialog(null);
        return { status: "invoice-invalid" };
      }
      invoiceId = invoice.id;
    }

    try {
      const { sentAt, previewUrl } = await invoiceApi.send(invoiceId, input);
      setSaved((current) => current && { ...current, status: "sent", sentAt });
      setSendDialog(null);
      toast.success(`Invoice sent to ${input.to}`, {
        description: previewUrl ? "Delivered to the Ethereal test inbox." : undefined,
        action: previewUrl
          ? {
              label: "View email",
              onClick: () => window.open(previewUrl, "_blank", "noopener,noreferrer"),
            }
          : undefined,
      });
      return { status: "sent" };
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Couldn't send the email. Please try again.";
      return { status: "failed", message };
    }
  }

  async function handleDelete() {
    if (!saved) return;
    try {
      await invoiceApi.remove(saved.id);
      setIsDeleteOpen(false);
      toast.success(`${form.getValues("invoiceNumber")} deleted`);
      router.push("/invoices");
    } catch (error) {
      setIsDeleteOpen(false);
      showApiError(error);
    }
  }

  function handlePrint() {
    const { invoiceNumber, customer } = form.getValues();
    const originalTitle = document.title;
    // The document title becomes the suggested file name in "Save as PDF".
    document.title =
      [invoiceNumber.trim(), customer.name.trim()].filter(Boolean).join(" – ") || "Invoice";
    window.addEventListener("afterprint", () => (document.title = originalTitle), { once: true });
    window.print();
  }

  function changeView(next: EditorView) {
    setView(next);
    window.scrollTo({ top: 0 });
  }

  return (
    <FormProvider {...form}>
      <EditorToolbar
        status={saved?.status ?? "draft"}
        isNew={!saved}
        isSaving={isSaving}
        savedSnapshot={savedSnapshot}
        onSave={() => void handleSave()}
        onPrint={handlePrint}
        onSend={openSendDialog}
        onDelete={saved ? () => setIsDeleteOpen(true) : undefined}
      />
      <ViewSwitch view={view} onChange={changeView} />

      <main
        id="main"
        className="mx-auto grid max-w-[1600px] items-start gap-6 px-4 pt-5 pb-32 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-6 lg:pb-12 xl:grid-cols-[minmax(0,40rem)_minmax(0,1fr)] print:block print:max-w-none print:p-0"
      >
        <form
          ref={formRef}
          noValidate
          aria-label="Invoice details"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
          onKeyDown={preventImplicitSubmit}
          className={cn(
            "@container flex min-w-0 flex-col gap-4 print:hidden",
            view === "preview" && "max-lg:hidden",
          )}
        >
          <PartySection party="business" />
          <PartySection party="customer" />
          <DetailsSection />
          <LineItemsSection />
          <AdjustmentsSection />
          <CustomFieldsSection />
          <NotesSection />
          <StyleSection />
        </form>
        <PreviewPanel className={cn(view === "edit" && "max-lg:hidden")} />
      </main>

      <MobileActionBar isSaving={isSaving} onSave={() => void handleSave()} />

      <SendInvoiceDialog
        open={sendDialog !== null}
        onClose={() => setSendDialog(null)}
        defaults={sendDialog?.defaults ?? { to: "", subject: "", message: "" }}
        replyTo={sendDialog?.replyTo ?? ""}
        savesFirst={sendDialog?.savesFirst ?? false}
        onSend={handleSend}
      />
      {saved && (
        <DeleteInvoiceDialog
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          invoiceNumber={form.getValues("invoiceNumber")}
          onConfirm={handleDelete}
        />
      )}
    </FormProvider>
  );
}

/** Stops Enter in a single-line field from submitting the whole invoice. */
function preventImplicitSubmit(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault();
}
