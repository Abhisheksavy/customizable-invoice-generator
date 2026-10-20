import type { ApiErrorCode, ApiErrorDto, FieldErrorDto } from "@/shared/dto/api-error.dto";
import type { InvoiceDto, InvoiceInput } from "@/shared/dto/invoice.dto";
import type { SendInvoiceInput, SendInvoiceResultDto } from "@/shared/dto/send-invoice.dto";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | "NETWORK_ERROR";
  readonly fieldErrors: FieldErrorDto[];

  constructor(
    status: number,
    code: ApiError["code"],
    message: string,
    fieldErrors: FieldErrorDto[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Calls the app's JSON API and turns error responses into ApiError. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { "content-type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Can't reach the server. Check your connection and try again.",
    );
  }

  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (body as Partial<ApiErrorDto> | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "INTERNAL_ERROR",
      error?.message ?? "Something went wrong. Please try again.",
      error?.fieldErrors ?? [],
    );
  }
  return body as T;
}

const withJson = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});
const invoicePath = (id: string) => `/api/invoices/${encodeURIComponent(id)}`;

export const invoiceApi = {
  create: (input: InvoiceInput) => request<InvoiceDto>("/api/invoices", withJson("POST", input)),
  update: (id: string, input: InvoiceInput) =>
    request<InvoiceDto>(invoicePath(id), withJson("PUT", input)),
  remove: (id: string) => request<void>(invoicePath(id), { method: "DELETE" }),
  send: (id: string, input: SendInvoiceInput) =>
    request<SendInvoiceResultDto>(`${invoicePath(id)}/send`, withJson("POST", input)),
};
