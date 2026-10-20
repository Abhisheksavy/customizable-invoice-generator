import type { DeepPartialSkipArrayKey } from "react-hook-form";
import { addDays } from "@/shared/dates";
import type {
  InvoiceDto,
  InvoiceInput,
  NewInvoiceDefaultsDto,
  PartyInput,
} from "@/shared/dto/invoice.dto";
import { ACCENT_COLORS, DEFAULT_ACCENT_COLOR } from "@/shared/invoice/accent-colors";
import type { TotalsInput } from "@/shared/invoice/calculate-totals";

export type WatchedInvoice = DeepPartialSkipArrayKey<InvoiceInput>;

export const DEFAULT_PAYMENT_TERMS_DAYS = 14;
export const PAYMENT_TERM_OPTIONS = [7, 14, 30] as const;

/** A blank line item; the price starts empty so it has to be entered. */
export function emptyLineItem(): InvoiceInput["lineItems"][number] {
  return { description: "", quantity: 1, unitPriceCents: Number.NaN };
}

/** Starting values for a new invoice: suggested number, carried-over business details, due in 14 days. */
export function createNewInvoiceValues(
  defaults: NewInvoiceDefaultsDto,
  today: string,
): InvoiceInput {
  return {
    invoiceNumber: defaults.invoiceNumber,
    issueDate: today,
    dueDate: addDays(today, DEFAULT_PAYMENT_TERMS_DAYS),
    business: defaults.business,
    customer: { name: "", email: "", address: "" },
    lineItems: [emptyLineItem()],
    discountCents: 0,
    taxRatePercent: 0,
    customFields: [],
    notes: "",
    accentColor: DEFAULT_ACCENT_COLOR,
  };
}

/** The editable part of a saved invoice. */
export function toInvoiceInput(invoice: InvoiceDto): InvoiceInput {
  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    business: invoice.business,
    customer: invoice.customer,
    lineItems: invoice.lineItems.map(({ description, quantity, unitPriceCents }) => ({
      description,
      quantity,
      unitPriceCents,
    })),
    discountCents: invoice.discountCents,
    taxRatePercent: invoice.taxRatePercent,
    customFields: invoice.customFields,
    notes: invoice.notes,
    accentColor: invoice.accentColor,
  };
}

/** Treats blank, negative or half-typed amounts as zero so live totals can always be computed. */
export function toPreviewTotalsInput(
  values: Pick<WatchedInvoice, "lineItems" | "discountCents" | "taxRatePercent">,
): TotalsInput {
  return {
    lineItems: (values.lineItems ?? []).map((item) => ({
      quantity: positiveOrZero(item?.quantity),
      unitPriceCents: Math.round(positiveOrZero(item?.unitPriceCents)),
    })),
    discountCents: Math.round(positiveOrZero(values.discountCents)),
    taxRatePercent: Math.min(positiveOrZero(values.taxRatePercent), 100),
  };
}

/** Fills gaps in half-edited form values so the live preview can always render. */
export function toPreviewInput(values: WatchedInvoice): InvoiceInput {
  const amounts = toPreviewTotalsInput(values);

  return {
    ...amounts,
    invoiceNumber: values.invoiceNumber ?? "",
    issueDate: values.issueDate ?? "",
    dueDate: values.dueDate ?? "",
    business: toParty(values.business),
    customer: toParty(values.customer),
    lineItems: amounts.lineItems.map((item, index) => ({
      ...item,
      description: values.lineItems?.[index]?.description ?? "",
    })),
    customFields: (values.customFields ?? []).map((field) => ({
      label: field?.label ?? "",
      value: field?.value ?? "",
      visible: field?.visible ?? true,
    })),
    notes: values.notes ?? "",
    accentColor:
      values.accentColor && values.accentColor in ACCENT_COLORS
        ? values.accentColor
        : DEFAULT_ACCENT_COLOR,
  };
}

/** Serialises form values so they can be compared with the last saved state. */
export function snapshotOf(values: unknown): string {
  return JSON.stringify(values);
}

function positiveOrZero(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function toParty(party: Partial<PartyInput> | undefined): PartyInput {
  return { name: party?.name ?? "", email: party?.email ?? "", address: party?.address ?? "" };
}
