export type ApiErrorCode =
  "VALIDATION_FAILED" | "NOT_FOUND" | "CONFLICT" | "EMAIL_DELIVERY_FAILED" | "INTERNAL_ERROR";

export interface FieldErrorDto {
  path: string;
  message: string;
}

export interface ApiErrorDto {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors: FieldErrorDto[];
  };
}
