"use client";

import { INVOICE_LIMITS as LIMITS } from "@/shared/invoice/limits";
import { TextAreaField, TextField } from "../form-fields";
import { SectionCard } from "../section-card";

const COPY = {
  business: {
    title: "From",
    description: "Your business details. New invoices copy them from your latest one.",
    nameLabel: "Business name",
    namePlaceholder: "e.g. Juniper Studio",
    emailPlaceholder: "billing@yourstudio.com",
    emailHint: "Client replies to emailed invoices go here.",
  },
  customer: {
    title: "Bill to",
    description: "Who this invoice is for.",
    nameLabel: "Client name",
    namePlaceholder: "e.g. Harbor Coffee Co.",
    emailPlaceholder: "accounts@client.com",
    emailHint: "Pre-filled as the recipient when you email the invoice.",
  },
};

export function PartySection({ party }: { party: keyof typeof COPY }) {
  const copy = COPY[party];

  return (
    <SectionCard title={copy.title} description={copy.description}>
      <div className="grid gap-4 @lg:grid-cols-2">
        <TextField
          name={`${party}.name`}
          label={copy.nameLabel}
          placeholder={copy.namePlaceholder}
          maxLength={LIMITS.nameLength}
          autoComplete={party === "business" ? "organization" : "off"}
        />
        <TextField
          name={`${party}.email`}
          label="Email"
          optional
          type="email"
          inputMode="email"
          placeholder={copy.emailPlaceholder}
          hint={copy.emailHint}
          maxLength={LIMITS.emailLength}
          autoComplete={party === "business" ? "email" : "off"}
        />
        <TextAreaField
          name={`${party}.address`}
          label="Address"
          optional
          rows={2}
          placeholder="Street, city, postal code"
          maxLength={LIMITS.addressLength}
          className="@lg:col-span-2"
        />
      </div>
    </SectionCard>
  );
}
