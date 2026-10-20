import "server-only";
import { getServerConfig, type DatabaseConfig } from "./config";
import { createDatabase, type Database } from "./db/client";
import { createEmailProvider } from "./email/create-email-provider";
import { InvoiceRepository } from "./invoices/invoice.repository";
import { InvoiceService } from "./invoices/invoice.service";

const globalCache = globalThis as typeof globalThis & { inkwellDatabase?: Database };

let invoiceService: InvoiceService | undefined;

/** Lazily wires the invoice service so config and database are only touched on the first request. */
export function getInvoiceService(): InvoiceService {
  if (!invoiceService) {
    const config = getServerConfig();
    invoiceService = new InvoiceService(
      new InvoiceRepository(getDatabase(config.database)),
      createEmailProvider(config.email),
    );
  }
  return invoiceService;
}

/** Reuses one database client across dev hot reloads. */
function getDatabase(config: DatabaseConfig): Database {
  globalCache.inkwellDatabase ??= createDatabase(config);
  return globalCache.inkwellDatabase;
}
