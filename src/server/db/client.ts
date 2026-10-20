import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { DatabaseConfig } from "../config";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

/** Opens the libSQL database: a local file by default, Turso when the URL is remote. */
export function createDatabase({ url, authToken }: DatabaseConfig) {
  if (url.startsWith("file:")) mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
  return drizzle({ client: createClient({ url, authToken }), schema });
}
