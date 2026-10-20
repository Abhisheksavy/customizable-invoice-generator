import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { todayIsoDate } from "@/shared/dates";
import { getInvoiceService } from "./container";
import { NotFoundError } from "./errors/not-found-error";

/** Invoice summaries for the list page, always read at request time. */
export async function loadInvoiceSummaries() {
  await connection();
  return getInvoiceService().list();
}

/** One invoice for the editor, or null if it doesn't exist; deduplicated per request. */
export const loadInvoice = cache(async (id: string) => {
  await connection();
  try {
    return await getInvoiceService().get(id);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});

/** Defaults for a new invoice, plus the server's date to render the first paint with. */
export async function loadNewInvoiceDefaults() {
  await connection();
  return { defaults: await getInvoiceService().getNewInvoiceDefaults(), today: todayIsoDate() };
}
