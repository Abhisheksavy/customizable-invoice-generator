import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  readonly status = 404;
  readonly code = "NOT_FOUND";
}
