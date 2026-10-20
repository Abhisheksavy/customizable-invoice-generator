import { getInvoiceService } from "../../container";
import type { InvoiceRouteContext } from "./invoice-route-context";

/** DELETE /api/invoices/:id — removes the invoice and its line items. */
export async function deleteInvoiceHandler(
  _request: Request,
  { params }: InvoiceRouteContext,
): Promise<Response> {
  const { id } = await params;
  await getInvoiceService().delete(id);
  return new Response(null, { status: 204 });
}
