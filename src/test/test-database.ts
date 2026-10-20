import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDatabase } from "@/server/db/client";

/** Creates a migrated SQLite file in a temp directory, removed again by cleanup(). */
export async function createTestDatabase() {
  const directory = mkdtempSync(join(tmpdir(), "inkwell-test-"));
  const db = createDatabase({ url: `file:${join(directory, "test.db")}` });
  await migrate(db, { migrationsFolder: "drizzle" });

  const cleanup = () => {
    db.$client.close();
    rmSync(directory, { recursive: true, force: true });
  };
  return { db, cleanup };
}
