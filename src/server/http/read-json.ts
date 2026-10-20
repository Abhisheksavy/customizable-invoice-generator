import type { z } from "zod";
import { ValidationError } from "../errors/validation-error";

/** Parses the request body and validates it against a request DTO schema. */
export async function readJson<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): Promise<z.output<Schema>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("The request body must be valid JSON.");
  }

  const result = schema.safeParse(body);
  if (!result.success) throw ValidationError.fromZod(result.error);
  return result.data;
}
