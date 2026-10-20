import type { z } from "zod";
import { AppError } from "./app-error";

export class ValidationError extends AppError {
  readonly status = 400;
  readonly code = "VALIDATION_FAILED";

  /** Converts zod issues into field errors keyed by dotted path, e.g. "lineItems.0.quantity". */
  static fromZod(error: z.ZodError): ValidationError {
    return new ValidationError("Some fields need attention.", {
      fieldErrors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
}
