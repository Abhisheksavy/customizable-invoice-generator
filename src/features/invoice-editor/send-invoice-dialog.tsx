"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, LoaderCircle, Reply, Save, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendInvoiceSchema, type SendInvoiceInput } from "@/shared/dto/send-invoice.dto";

export type SendOutcome =
  { status: "sent" } | { status: "invoice-invalid" } | { status: "failed"; message: string };

interface SendInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  defaults: SendInvoiceInput;
  replyTo: string;
  savesFirst: boolean;
  onSend: (input: SendInvoiceInput) => Promise<SendOutcome>;
}

export function SendInvoiceDialog({
  open,
  onClose,
  defaults,
  replyTo,
  savesFirst,
  onSend,
}: SendInvoiceDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const send = async (input: SendInvoiceInput) => {
    setIsSending(true);
    try {
      return await onSend(input);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!isSending}
      title="Email this invoice"
      description="Your client receives the full invoice in the body of the email."
    >
      {open && (
        <SendInvoiceForm
          defaults={defaults}
          replyTo={replyTo}
          savesFirst={savesFirst}
          onCancel={onClose}
          onSend={send}
        />
      )}
    </Dialog>
  );
}

interface SendInvoiceFormProps extends Pick<
  SendInvoiceDialogProps,
  "defaults" | "replyTo" | "savesFirst" | "onSend"
> {
  onCancel: () => void;
}

function SendInvoiceForm({
  defaults,
  replyTo,
  savesFirst,
  onSend,
  onCancel,
}: SendInvoiceFormProps) {
  const form = useForm<SendInvoiceInput>({
    resolver: zodResolver(sendInvoiceSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const { errors, isSubmitting } = form.formState;
  const [failure, setFailure] = useState<string | null>(null);

  const submit = form.handleSubmit(async (input) => {
    setFailure(null);
    const outcome = await onSend(input);
    if (outcome.status === "failed") setFailure(outcome.message);
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="To" error={errors.to?.message}>
        {(control) => (
          <Input
            {...control}
            {...form.register("to")}
            type="email"
            inputMode="email"
            autoComplete="email"
            data-autofocus
          />
        )}
      </Field>
      <Field label="Subject" error={errors.subject?.message}>
        {(control) => <Input {...control} {...form.register("subject")} maxLength={150} />}
      </Field>
      <Field label="Message" optional error={errors.message?.message}>
        {(control) => (
          <Textarea {...control} {...form.register("message")} rows={6} maxLength={2000} />
        )}
      </Field>

      <ul className="flex flex-col gap-1.5 text-xs text-ink-muted">
        <li className="flex items-start gap-1.5">
          <Reply aria-hidden className="mt-px size-3.5 shrink-0" />
          {replyTo ? (
            <span>
              Replies go to <span className="font-medium text-ink-soft">{replyTo}</span>.
            </span>
          ) : (
            "Add a business email under “From” so clients can reply."
          )}
        </li>
        {savesFirst && (
          <li className="flex items-start gap-1.5">
            <Save aria-hidden className="mt-px size-3.5 shrink-0" />
            Your latest changes are saved before the email goes out.
          </li>
        )}
      </ul>

      {failure && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-danger-tint p-3 text-sm text-danger"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {failure}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle aria-hidden className="animate-spin" />
          ) : (
            <Send aria-hidden />
          )}
          {isSubmitting ? "Sending…" : "Send invoice"}
        </Button>
      </div>
    </form>
  );
}
