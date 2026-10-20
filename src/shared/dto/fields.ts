import { z } from "zod";

/** Trimmed text that must not be empty. */
export const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

/** Trimmed text that may be empty. */
export const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

/** Trimmed email address that may be left empty. */
export const optionalEmail = z
  .string()
  .trim()
  .max(254, "Email must be 254 characters or fewer")
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address",
  );

/** Trimmed email address that must be present. */
export const requiredEmail = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email({ error: "Enter a valid email address" }));
