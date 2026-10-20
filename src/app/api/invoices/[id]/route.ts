import { handleRoute } from "@/server/http/handle-route";
import { deleteInvoiceHandler } from "@/server/invoices/handlers/delete-invoice.handler";
import { getInvoiceHandler } from "@/server/invoices/handlers/get-invoice.handler";
import { updateInvoiceHandler } from "@/server/invoices/handlers/update-invoice.handler";

export const GET = handleRoute(getInvoiceHandler);
export const PUT = handleRoute(updateInvoiceHandler);
export const DELETE = handleRoute(deleteInvoiceHandler);
