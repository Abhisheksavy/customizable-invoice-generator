import { invoiceInputSchema } from "@/shared/dto/invoice.dto";
import { getInvoiceService } from "../../container";
import { readJson } from "../../http/read-json";
import type { InvoiceRouteContext } from "./invoice-route-context";

/** PUT /api/invoices/:id — validates the body and replaces the invoice. */
export async function updateInvoiceHandler(
  request: Request,
  { params }: InvoiceRouteContext,
): Promise<Response> {
  const { id } = await params;
  const input = await readJson(request, invoiceInputSchema);
  return Response.json(await getInvoiceService().update(id, input));
}
