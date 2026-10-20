"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Chip } from "@/components/ui/chip";
import { addDays, daysBetween } from "@/shared/dates";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { INVOICE_LIMITS as LIMITS } from "@/shared/invoice/limits";
import { TextField } from "../form-fields";
import { PAYMENT_TERM_OPTIONS } from "../invoice-form-values";
import { SectionCard } from "../section-card";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function DetailsSection() {
  return (
    <SectionCard title="Invoice details">
      <div className="grid gap-4 @lg:grid-cols-3">
        <TextField
          name="invoiceNumber"
          label="Invoice number"
          hint="Unique across your invoices."
          maxLength={LIMITS.invoiceNumberLength}
          autoComplete="off"
          spellCheck={false}
        />
        <TextField name="issueDate" label="Issue date" type="date" deps={["dueDate"]} />
        <TextField name="dueDate" label="Due date" type="date" />
      </div>
      <PaymentTerms />
    </SectionCard>
  );
}

/** Quick picks that set the due date a fixed number of days after the issue date. */
function PaymentTerms() {
  const { control, setValue } = useFormContext<InvoiceInput>();
  const [issueDate, dueDate] = useWatch({ control, name: ["issueDate", "dueDate"] });
  const hasIssueDate = ISO_DATE.test(issueDate);
  const currentTerm =
    hasIssueDate && ISO_DATE.test(dueDate) ? daysBetween(issueDate, dueDate) : null;

  return (
    <div role="group" aria-label="Payment terms" className="mt-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-ink-muted">Due in</span>
      {PAYMENT_TERM_OPTIONS.map((days) => (
        <Chip
          key={days}
          active={currentTerm === days}
          aria-pressed={currentTerm === days}
          disabled={!hasIssueDate}
          onClick={() =>
            setValue("dueDate", addDays(issueDate, days), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          {days} days
        </Chip>
      ))}
    </div>
  );
}
