import { sendInvoiceSchema } from "@/shared/dto/send-invoice.dto";
import { getInvoiceService } from "../../container";
import { readJson } from "../../http/read-json";
import type { InvoiceRouteContext } from "./invoice-route-context";

/** POST /api/invoices/:id/send — emails the saved invoice through the configured provider. */
export async function sendInvoiceHandler(
  request: Request,
  { params }: InvoiceRouteContext,
): Promise<Response> {
  const { id } = await params;
  const input = await readJson(request, sendInvoiceSchema);
  return Response.json(await getInvoiceService().send(id, input));
}
