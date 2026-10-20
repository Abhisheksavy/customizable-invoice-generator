import { connection } from "next/server";
import { toErrorResponse } from "./error-response";

type RouteHandler<Context> = (request: Request, context: Context) => Promise<Response>;

/** Adapts a handler to a Next.js route: always runs per request and turns thrown errors into JSON. */
export function handleRoute<Context>(handler: RouteHandler<Context>): RouteHandler<Context> {
  return async (request, context) => {
    await connection();
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
