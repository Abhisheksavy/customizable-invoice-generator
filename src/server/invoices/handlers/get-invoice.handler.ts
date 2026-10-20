import { getInvoiceService } from "../../container";
import type { InvoiceRouteContext } from "./invoice-route-context";

/** GET /api/invoices/:id — one invoice with line items and custom fields. */
export async function getInvoiceHandler(
  _request: Request,
  { params }: InvoiceRouteContext,
): Promise<Response> {
  const { id } = await params;
  return Response.json(await getInvoiceService().get(id));
}
