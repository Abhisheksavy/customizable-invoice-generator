import { formatCents, formatDecimal, formatIsoDate } from "@/shared/format";
import type { InvoiceDocument } from "@/shared/invoice/invoice-document";
import { html, multiline, type SafeHtml } from "./html";

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const INK = "#1A1915";
const MUTED = "#6B665C";
const LINE = "#E4DED3";
const CANVAS = "#F3EFE7";

export interface RenderedEmail {
  html: string;
  text: string;
}

/** Renders the invoice as table-based HTML for email clients, plus a plain-text alternative. */
export function renderInvoiceEmail(invoice: InvoiceDocument, message: string): RenderedEmail {
  return { html: renderHtml(invoice, message).value, text: renderText(invoice, message) };
}

function renderHtml(invoice: InvoiceDocument, message: string): SafeHtml {
  const { accent, totals } = invoice;
  const dueLine = `${formatCents(totals.totalCents)} due ${formatIsoDate(invoice.dueDate)}`;

  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Invoice ${invoice.invoiceNumber}</title>
      </head>
      <body style="margin:0;padding:0;background:${CANVAS};">
        <div style="display:none;max-height:0;overflow:hidden;">
          Invoice ${invoice.invoiceNumber} · ${dueLine}
        </div>
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="background:${CANVAS};padding:32px 12px;"
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:12px;overflow:hidden;font-family:${FONT};color:${INK};"
              >
                <tr>
                  <td style="height:6px;background:${accent.hex};font-size:0;line-height:0;">
                    &nbsp;
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 0;">
                    <p
                      style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};"
                    >
                      Invoice ${invoice.invoiceNumber}
                    </p>
                    <h1 style="margin:6px 0 0;font-size:22px;line-height:1.3;">
                      ${invoice.business.name}
                    </h1>
                  </td>
                </tr>
                ${
                  message.trim()
                    ? html`<tr>
                        <td style="padding:20px 32px 0;font-size:15px;line-height:1.6;">
                          ${multiline(message.trim())}
                        </td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:24px 32px 0;">
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="background:${accent.tint};border-radius:10px;"
                    >
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="margin:0;font-size:13px;font-weight:600;color:${accent.hex};">
                            Total due
                          </p>
                          <p style="margin:4px 0 0;font-size:30px;font-weight:700;">
                            ${formatCents(totals.totalCents)}
                          </p>
                          <p style="margin:4px 0 0;font-size:14px;color:${MUTED};">
                            Due ${formatIsoDate(invoice.dueDate)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 0;">
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="font-size:14px;line-height:1.5;"
                    >
                      ${detailRow("Billed to", html`<strong>${invoice.customer.name}</strong>${invoice.customer.address ? html`<br />${multiline(invoice.customer.address)}` : ""}`)}
                      ${detailRow("Issued", formatIsoDate(invoice.issueDate))}
                      ${detailRow("Due", formatIsoDate(invoice.dueDate))}
                      ${invoice.customFields.map((field) => detailRow(field.label, field.value))}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 0;">
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="font-size:14px;line-height:1.5;border-collapse:collapse;"
                    >
                      <tr>
                        <th
                          align="left"
                          style="padding:0 0 8px;font-size:12px;font-weight:600;color:${MUTED};border-bottom:2px solid ${accent.hex};"
                        >
                          Description
                        </th>
                        <th
                          align="right"
                          style="padding:0 0 8px 12px;font-size:12px;font-weight:600;color:${MUTED};border-bottom:2px solid ${accent.hex};"
                        >
                          Qty
                        </th>
                        <th
                          align="right"
                          style="padding:0 0 8px 12px;font-size:12px;font-weight:600;color:${MUTED};border-bottom:2px solid ${accent.hex};"
                        >
                          Price
                        </th>
                        <th
                          align="right"
                          style="padding:0 0 8px 12px;font-size:12px;font-weight:600;color:${MUTED};border-bottom:2px solid ${accent.hex};"
                        >
                          Amount
                        </th>
                      </tr>
                      ${invoice.lineItems.map(
                        (item) =>
                          html`<tr>
                            <td style="padding:10px 0;border-bottom:1px solid ${LINE};">
                              ${item.description}
                            </td>
                            <td
                              align="right"
                              style="padding:10px 0 10px 12px;border-bottom:1px solid ${LINE};white-space:nowrap;"
                            >
                              ${formatDecimal(item.quantity)}
                            </td>
                            <td
                              align="right"
                              style="padding:10px 0 10px 12px;border-bottom:1px solid ${LINE};white-space:nowrap;"
                            >
                              ${formatCents(item.unitPriceCents)}
                            </td>
                            <td
                              align="right"
                              style="padding:10px 0 10px 12px;border-bottom:1px solid ${LINE};white-space:nowrap;"
                            >
                              ${formatCents(item.lineTotalCents)}
                            </td>
                          </tr>`,
                      )}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 32px 0;">
                    <table
                      role="presentation"
                      align="right"
                      cellpadding="0"
                      cellspacing="0"
                      style="font-size:14px;line-height:1.5;"
                    >
                      ${totalRow("Subtotal", formatCents(totals.subtotalCents))}
                      ${totals.discountCents > 0 ? totalRow("Discount", `−${formatCents(totals.discountCents)}`) : ""}
                      ${invoice.taxRatePercent > 0 ? totalRow(`Tax (${formatDecimal(invoice.taxRatePercent)}%)`, formatCents(totals.taxCents)) : ""}
                      <tr>
                        <td
                          style="padding:10px 24px 0 0;border-top:1px solid ${LINE};font-weight:700;"
                        >
                          Total
                        </td>
                        <td
                          align="right"
                          style="padding:10px 0 0;border-top:1px solid ${LINE};font-weight:700;white-space:nowrap;"
                        >
                          ${formatCents(totals.totalCents)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${
                  invoice.notes.trim()
                    ? html`<tr>
                        <td style="padding:28px 32px 0;font-size:14px;line-height:1.6;">
                          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:${MUTED};">
                            Notes
                          </p>
                          ${multiline(invoice.notes.trim())}
                        </td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:28px 32px 32px;font-size:13px;line-height:1.5;color:${MUTED};">
                    Questions about this invoice? Reply to this email to reach
                    ${invoice.business.name}.
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;color:${MUTED};">
                Sent with Inkwell
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
}

function detailRow(label: string, value: string | SafeHtml): SafeHtml {
  return html`<tr>
    <td valign="top" style="padding:4px 16px 4px 0;width:120px;color:${MUTED};">${label}</td>
    <td valign="top" style="padding:4px 0;">${value}</td>
  </tr>`;
}

function totalRow(label: string, value: string): SafeHtml {
  return html`<tr>
    <td style="padding:4px 24px 4px 0;color:${MUTED};">${label}</td>
    <td align="right" style="padding:4px 0;white-space:nowrap;">${value}</td>
  </tr>`;
}

function renderText(invoice: InvoiceDocument, message: string): string {
  const { totals } = invoice;
  const lines = [
    `Invoice ${invoice.invoiceNumber} from ${invoice.business.name}`,
    "",
    ...(message.trim() ? [message.trim(), ""] : []),
    `Total due: ${formatCents(totals.totalCents)} (due ${formatIsoDate(invoice.dueDate)})`,
    `Billed to: ${invoice.customer.name}`,
    `Issued: ${formatIsoDate(invoice.issueDate)}`,
    ...invoice.customFields.map((field) => `${field.label}: ${field.value}`),
    "",
    ...invoice.lineItems.map(
      (item) =>
        `- ${item.description}: ${formatDecimal(item.quantity)} × ${formatCents(item.unitPriceCents)} = ${formatCents(item.lineTotalCents)}`,
    ),
    "",
    `Subtotal: ${formatCents(totals.subtotalCents)}`,
    ...(totals.discountCents > 0 ? [`Discount: −${formatCents(totals.discountCents)}`] : []),
    ...(invoice.taxRatePercent > 0
      ? [`Tax (${formatDecimal(invoice.taxRatePercent)}%): ${formatCents(totals.taxCents)}`]
      : []),
    `Total: ${formatCents(totals.totalCents)}`,
    ...(invoice.notes.trim() ? ["", "Notes:", invoice.notes.trim()] : []),
    "",
    `Questions? Reply to this email to reach ${invoice.business.name}.`,
  ];
  return lines.join("\n");
}
