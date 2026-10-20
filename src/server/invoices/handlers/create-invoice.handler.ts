import { invoiceInputSchema } from "@/shared/dto/invoice.dto";
import { getInvoiceService } from "../../container";
import { readJson } from "../../http/read-json";

/** POST /api/invoices — validates the body and creates an invoice. */
export async function createInvoiceHandler(request: Request): Promise<Response> {
  const input = await readJson(request, invoiceInputSchema);
  const invoice = await getInvoiceService().create(input);
  return Response.json(invoice, { status: 201 });
}
