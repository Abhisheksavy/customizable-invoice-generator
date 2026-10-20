import { handleRoute } from "@/server/http/handle-route";
import { createInvoiceHandler } from "@/server/invoices/handlers/create-invoice.handler";
import { listInvoicesHandler } from "@/server/invoices/handlers/list-invoices.handler";

export const GET = handleRoute(listInvoicesHandler);
export const POST = handleRoute(createInvoiceHandler);
