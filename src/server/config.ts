import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./data/inkwell.db"),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["ethereal", "resend"]).default("ethereal"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.email().default("onboarding@resend.dev"),
});

export interface DatabaseConfig {
  url: string;
  authToken?: string;
}

export type EmailConfig =
  { provider: "ethereal" } | { provider: "resend"; apiKey: string; fromAddress: string };

export interface ServerConfig {
  database: DatabaseConfig;
  email: EmailConfig;
}

let cached: ServerConfig | undefined;

/** Reads server-only environment variables once and fails fast with a readable message. */
export function getServerConfig(): ServerConfig {
  if (cached) return cached;

  const setValues = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== ""),
  );
  const result = envSchema.safeParse(setValues);
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    throw new Error(`Invalid environment configuration — ${problems.join("; ")}`);
  }

  const env = result.data;
  cached = {
    database: { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN },
    email: toEmailConfig(env),
  };
  return cached;
}

function toEmailConfig(env: z.infer<typeof envSchema>): EmailConfig {
  if (env.EMAIL_PROVIDER === "ethereal") return { provider: "ethereal" };
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
  return { provider: "resend", apiKey: env.RESEND_API_KEY, fromAddress: env.EMAIL_FROM_ADDRESS };
}
