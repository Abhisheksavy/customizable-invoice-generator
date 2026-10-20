"use client";

import { useWatch } from "react-hook-form";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { INVOICE_LIMITS as LIMITS } from "@/shared/invoice/limits";
import { TextAreaField } from "../form-fields";
import { SectionCard } from "../section-card";

export function NotesSection() {
  const notes = useWatch<InvoiceInput, "notes">({ name: "notes" });

  return (
    <SectionCard
      title="Notes"
      description="Payment instructions or a thank-you, shown at the bottom of the invoice."
    >
      <TextAreaField
        name="notes"
        label="Notes"
        hideLabel
        optional
        rows={4}
        maxLength={LIMITS.notesLength}
        placeholder="e.g. Please pay by bank transfer within 14 days. Thank you!"
        hint={`${notes.length} / ${LIMITS.notesLength} characters`}
      />
    </SectionCard>
  );
}
