import { todayIsoDate } from "@/shared/dates";
import { sampleInvoices } from "@/shared/invoice/sample-invoices";
import { getServerConfig } from "../config";
import { createEmailProvider } from "../email/create-email-provider";
import { InvoiceRepository } from "../invoices/invoice.repository";
import { InvoiceService } from "../invoices/invoice.service";
import { createDatabase } from "./client";

/** Adds the fictional sample invoices to an empty database; does nothing if invoices already exist. */
async function seed() {
  const config = getServerConfig();
  const repository = new InvoiceRepository(createDatabase(config.database));
  const service = new InvoiceService(repository, createEmailProvider(config.email));

  if ((await service.list()).length > 0) {
    console.log("The database already has invoices, so nothing was seeded.");
    return;
  }

  const samples = sampleInvoices(todayIsoDate());
  for (const input of samples) {
    const invoice = await service.create(input);
    // Mark the oldest sample as sent so both statuses show up in the list.
    if (input === samples.at(-1))
      await repository.markSent(invoice.id, `${invoice.issueDate}T16:00:00.000Z`);
  }
  console.log(`Seeded ${samples.length} sample invoices.`);
}

await seed();
