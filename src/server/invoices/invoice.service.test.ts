import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildInvoiceInput } from "@/test/fixtures";
import { FakeEmailProvider } from "@/test/fake-email-provider";
import { createTestDatabase } from "@/test/test-database";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import { InvoiceRepository } from "./invoice.repository";
import { InvoiceService } from "./invoice.service";

describe("InvoiceService", () => {
  let service: InvoiceService;
  let email: FakeEmailProvider;
  let cleanup: () => void;

  beforeEach(async () => {
    const database = await createTestDatabase();
    cleanup = database.cleanup;
    email = new FakeEmailProvider();
    service = new InvoiceService(new InvoiceRepository(database.db), email);
  });

  afterEach(() => cleanup());

  it("creates an invoice with server-computed totals", async () => {
    const created = await service.create(buildInvoiceInput());

    expect(created.status).toBe("draft");
    expect(created.totals).toEqual({
      subtotalCents: 10000,
      discountCents: 1000,
      taxCents: 900,
      totalCents: 9900,
    });
    expect(created.lineItems).toEqual([
      { description: "Brand workshop", quantity: 2, unitPriceCents: 5000, lineTotalCents: 10000 },
    ]);
  });

  it("round-trips line items and custom fields in order", async () => {
    const input = buildInvoiceInput({
      lineItems: [
        { description: "First", quantity: 1.5, unitPriceCents: 1999 },
        { description: "Second", quantity: 3, unitPriceCents: 250 },
      ],
      discountCents: 0,
      customFields: [
        { label: "PO number", value: "4471", visible: true },
        { label: "Internal ref", value: "ops-12", visible: false },
      ],
    });

    const { id } = await service.create(input);
    const loaded = await service.get(id);

    expect(loaded.lineItems.map((item) => item.description)).toEqual(["First", "Second"]);
    expect(loaded.lineItems[0]?.lineTotalCents).toBe(2999);
    expect(loaded.customFields).toEqual(input.customFields);
  });

  it("rejects a duplicate invoice number regardless of case", async () => {
    await service.create(buildInvoiceInput({ invoiceNumber: "INV-0001" }));

    const duplicate = service.create(buildInvoiceInput({ invoiceNumber: "inv-0001" }));

    await expect(duplicate).rejects.toBeInstanceOf(ConflictError);
    await expect(duplicate).rejects.toMatchObject({
      fieldErrors: [
        { path: "invoiceNumber", message: "inv-0001 is already used by another invoice" },
      ],
    });
  });

  it("updates content while keeping the id, creation date and sent status", async () => {
    const created = await service.create(buildInvoiceInput());
    await service.send(created.id, { to: "client@example.com", subject: "Invoice", message: "" });

    const updated = await service.update(
      created.id,
      buildInvoiceInput({
        lineItems: [{ description: "Revised", quantity: 1, unitPriceCents: 2000 }],
      }),
    );

    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.status).toBe("sent");
    expect(updated.lineItems).toHaveLength(1);
    expect(updated.totals.totalCents).toBe(1100);
  });

  it("throws NotFoundError for unknown invoices", async () => {
    await expect(service.get("missing")).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.update("missing", buildInvoiceInput())).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(service.delete("missing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes an invoice and its children", async () => {
    const { id } = await service.create(buildInvoiceInput());

    await service.delete(id);

    await expect(service.get(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(await service.list()).toEqual([]);
  });

  it("suggests the next free number and carries over business details", async () => {
    expect(await service.getNewInvoiceDefaults()).toEqual({
      invoiceNumber: "INV-0001",
      business: { name: "", email: "", address: "" },
    });

    await service.create(buildInvoiceInput({ invoiceNumber: "INV-0042" }));
    await service.create(buildInvoiceInput({ invoiceNumber: "INV-0040" }));
    const defaults = await service.getNewInvoiceDefaults();

    // The latest invoice is INV-0040, and INV-0041 is free.
    expect(defaults.invoiceNumber).toBe("INV-0041");
    expect(defaults.business.name).toBe("Juniper Studio");
  });

  it("emails only visible fields, escapes user content and marks the invoice sent", async () => {
    const { id } = await service.create(
      buildInvoiceInput({
        customer: { name: "<script>alert(1)</script>", email: "", address: "" },
        customFields: [
          { label: "PO number", value: "4471", visible: true },
          { label: "Internal margin", value: "42%", visible: false },
        ],
      }),
    );

    const result = await service.send(id, {
      to: "client@example.com",
      subject: "Invoice INV-0001",
      message: "Hi!",
    });

    const [sent] = email.sent;
    expect(sent?.to).toBe("client@example.com");
    expect(sent?.replyTo).toBe("billing@juniper.example");
    expect(sent?.html).toContain("&lt;script&gt;");
    expect(sent?.html).not.toContain("<script>");
    expect(sent?.html).toContain("PO number");
    expect(sent?.html).not.toContain("Internal margin");
    expect(sent?.text).toContain("Total: $99.00");
    expect(result.previewUrl).toBe("https://ethereal.email/message/fake");
    expect((await service.get(id)).sentAt).toBe(result.sentAt);
  });
});
