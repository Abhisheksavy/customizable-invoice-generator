import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as invoiceRoute from "@/app/api/invoices/[id]/route";
import * as sendRoute from "@/app/api/invoices/[id]/send/route";
import * as invoicesRoute from "@/app/api/invoices/route";
import type { ApiErrorDto } from "@/shared/dto/api-error.dto";
import type { InvoiceDto } from "@/shared/dto/invoice.dto";
import { buildInvoiceInput } from "@/test/fixtures";
import { FakeEmailProvider } from "@/test/fake-email-provider";
import { createTestDatabase } from "@/test/test-database";
import { InvoiceRepository } from "./invoice.repository";
import { InvoiceService } from "./invoice.service";

const state = vi.hoisted(() => ({ service: undefined as unknown }));

vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/server/container", () => ({ getInvoiceService: () => state.service }));

const email = new FakeEmailProvider();
let cleanup: () => void;

beforeAll(async () => {
  const database = await createTestDatabase();
  cleanup = database.cleanup;
  state.service = new InvoiceService(new InvoiceRepository(database.db), email);
});

afterAll(() => cleanup());

const jsonRequest = (method: string, body: unknown) =>
  new Request("http://localhost/api/invoices", {
    method,
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const withId = (id: string) => ({ params: Promise.resolve({ id }) });

async function createInvoice(overrides = {}): Promise<InvoiceDto> {
  const response = await invoicesRoute.POST(
    jsonRequest("POST", buildInvoiceInput(overrides)),
    undefined,
  );
  return response.json();
}

describe("invoice API routes", () => {
  it("creates, lists and fetches an invoice", async () => {
    const response = await invoicesRoute.POST(jsonRequest("POST", buildInvoiceInput()), undefined);
    const created: InvoiceDto = await response.json();

    expect(response.status).toBe(201);
    expect(created.totals.totalCents).toBe(9900);

    const list = await (await invoicesRoute.GET(new Request("http://localhost"), undefined)).json();
    expect(list).toContainEqual(
      expect.objectContaining({ id: created.id, totalCents: 9900, status: "draft" }),
    );

    const fetched = await invoiceRoute.GET(new Request("http://localhost"), withId(created.id));
    expect(fetched.status).toBe(200);
  });

  it("returns field errors for invalid input", async () => {
    const input = buildInvoiceInput({
      invoiceNumber: "INV-0100",
      lineItems: [{ description: "Design", quantity: -1, unitPriceCents: 5000 }],
    });

    const response = await invoicesRoute.POST(jsonRequest("POST", input), undefined);
    const body: ApiErrorDto = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.fieldErrors).toContainEqual({
      path: "lineItems.0.quantity",
      message: "Quantity can't be negative",
    });
  });

  it("rejects a body that isn't JSON", async () => {
    const response = await invoicesRoute.POST(jsonRequest("POST", "{not json"), undefined);

    expect(response.status).toBe(400);
    expect((await response.json()).error.message).toBe("The request body must be valid JSON.");
  });

  it("returns 409 when renaming to a number that is taken", async () => {
    await createInvoice({ invoiceNumber: "INV-0200" });
    const other = await createInvoice({ invoiceNumber: "INV-0201" });

    const response = await invoiceRoute.PUT(
      jsonRequest("PUT", buildInvoiceInput({ invoiceNumber: "INV-0200" })),
      withId(other.id),
    );
    const body: ApiErrorDto = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.fieldErrors[0]?.path).toBe("invoiceNumber");
  });

  it("returns a 404 error body for unknown invoices", async () => {
    const response = await invoiceRoute.GET(new Request("http://localhost"), withId("missing"));
    const body: ApiErrorDto = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toEqual({
      code: "NOT_FOUND",
      message: "This invoice doesn't exist or was deleted.",
      fieldErrors: [],
    });
  });

  it("sends an invoice and validates the recipient", async () => {
    const invoice = await createInvoice({ invoiceNumber: "INV-0300" });

    const invalid = await sendRoute.POST(
      jsonRequest("POST", { to: "not-an-email", subject: "Invoice", message: "" }),
      withId(invoice.id),
    );
    expect(invalid.status).toBe(400);

    const sent = await sendRoute.POST(
      jsonRequest("POST", {
        to: "client@example.com",
        subject: "Invoice INV-0300",
        message: "Thanks!",
      }),
      withId(invoice.id),
    );
    expect(sent.status).toBe(200);
    expect((await sent.json()).sentAt).toEqual(expect.any(String));
  });

  it("reports email provider failures as 502 without losing the invoice", async () => {
    const invoice = await createInvoice({ invoiceNumber: "INV-0400" });
    email.failWith = "Resend didn't accept the email: domain not verified";

    const response = await sendRoute.POST(
      jsonRequest("POST", { to: "client@example.com", subject: "Invoice", message: "" }),
      withId(invoice.id),
    );
    email.failWith = null;

    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("EMAIL_DELIVERY_FAILED");
    expect(
      (await invoiceRoute.GET(new Request("http://localhost"), withId(invoice.id))).status,
    ).toBe(200);
  });

  it("deletes an invoice", async () => {
    const invoice = await createInvoice({ invoiceNumber: "INV-0500" });

    const response = await invoiceRoute.DELETE(new Request("http://localhost"), withId(invoice.id));

    expect(response.status).toBe(204);
    expect(
      (await invoiceRoute.GET(new Request("http://localhost"), withId(invoice.id))).status,
    ).toBe(404);
  });
});
