/** True when a database error (or any error in its cause chain) is a UNIQUE constraint violation. */
export function isUniqueConstraintError(error: unknown): boolean {
  for (let current = error; current instanceof Error; current = current.cause) {
    const code =
      (current as { extendedCode?: unknown; code?: unknown }).extendedCode ??
      (current as { code?: unknown }).code;
    if (
      code === "SQLITE_CONSTRAINT_UNIQUE" ||
      current.message.includes("UNIQUE constraint failed")
    ) {
      return true;
    }
  }
  return false;
}
