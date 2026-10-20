import { AppError } from "./app-error";

export class ConflictError extends AppError {
  readonly status = 409;
  readonly code = "CONFLICT";
}
