import { handleRoute } from "@/server/http/handle-route";
import { sendInvoiceHandler } from "@/server/invoices/handlers/send-invoice.handler";

export const POST = handleRoute(sendInvoiceHandler);
