import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import type { SendInvoiceInput } from "@/shared/dto/send-invoice.dto";
import { formatCents, formatIsoDate } from "@/shared/format";
import { calculateTotals } from "@/shared/invoice/calculate-totals";
import { toPreviewTotalsInput } from "./invoice-form-values";

/** Pre-fills the email dialog from the invoice: recipient, subject and a short friendly message. */
export function composeSendDefaults(invoice: InvoiceInput): SendInvoiceInput {
  const number = invoice.invoiceNumber.trim();
  const business = invoice.business.name.trim();
  const { totalCents } = calculateTotals(toPreviewTotalsInput(invoice));
  const dueDate = formatIsoDate(invoice.dueDate);

  const summary = [
    `Please find invoice ${number} for ${formatCents(totalCents)}`,
    dueDate && `due ${dueDate}`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    to: invoice.customer.email.trim(),
    subject: business ? `Invoice ${number} from ${business}` : `Invoice ${number}`,
    message: [
      `Hi ${invoice.customer.name.trim() || "there"},`,
      `${summary}.`,
      ["Thank you,", business].filter(Boolean).join("\n"),
    ].join("\n\n"),
  };
}
