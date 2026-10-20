import { getInvoiceService } from "../../container";

/** GET /api/invoices — invoice summaries, newest first. */
export async function listInvoicesHandler(): Promise<Response> {
  return Response.json(await getInvoiceService().list());
}
