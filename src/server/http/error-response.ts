import type { ApiErrorDto } from "@/shared/dto/api-error.dto";
import { AppError } from "../errors/app-error";

/** Maps a thrown value to a JSON error response; unexpected errors are logged and never leaked. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    if (error.status >= 500) console.error(error);
    return json(
      { code: error.code, message: error.message, fieldErrors: error.fieldErrors },
      error.status,
    );
  }

  console.error(error);
  return json(
    {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our side. Please try again.",
      fieldErrors: [],
    },
    500,
  );
}

function json(error: ApiErrorDto["error"], status: number): Response {
  return Response.json({ error } satisfies ApiErrorDto, { status });
}
