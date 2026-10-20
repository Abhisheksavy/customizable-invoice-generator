import { AppError } from "./app-error";

export class EmailDeliveryError extends AppError {
  readonly status = 502;
  readonly code = "EMAIL_DELIVERY_FAILED";
}
