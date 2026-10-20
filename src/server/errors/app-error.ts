import type { ApiErrorCode, FieldErrorDto } from "@/shared/dto/api-error.dto";

export interface AppErrorOptions {
  fieldErrors?: FieldErrorDto[];
  cause?: unknown;
}

/** Base for expected failures; each subclass maps to one HTTP status and a stable error code. */
export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly code: ApiErrorCode;
  readonly fieldErrors: FieldErrorDto[];

  constructor(message: string, { fieldErrors = [], cause }: AppErrorOptions = {}) {
    super(message, { cause });
    this.name = new.target.name;
    this.fieldErrors = fieldErrors;
  }
}
