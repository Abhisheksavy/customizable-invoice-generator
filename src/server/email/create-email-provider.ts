import type { EmailConfig } from "../config";
import type { EmailProvider } from "./email-provider";
import { EtherealEmailProvider } from "./providers/ethereal-email-provider";
import { ResendEmailProvider } from "./providers/resend-email-provider";

/** Picks the email adapter selected by EMAIL_PROVIDER. */
export function createEmailProvider(config: EmailConfig): EmailProvider {
  return config.provider === "resend"
    ? new ResendEmailProvider(config.apiKey, config.fromAddress)
    : new EtherealEmailProvider();
}
