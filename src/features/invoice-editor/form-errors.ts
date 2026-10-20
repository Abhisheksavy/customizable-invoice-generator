/** Counts field errors inside a react-hook-form errors object, including nested items. */
export function countFieldErrors(error: unknown): number {
  if (!error || typeof error !== "object") return 0;
  if ("message" in error && typeof error.message === "string") return 1;
  return Object.values(error).reduce<number>((count, child) => count + countFieldErrors(child), 0);
}
