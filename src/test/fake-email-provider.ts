import type { EmailProvider, EmailReceipt, OutgoingEmail } from "@/server/email/email-provider";
import { EmailDeliveryError } from "@/server/errors/email-delivery-error";

/** Records outgoing email instead of sending it; can be switched to fail like a provider outage. */
export class FakeEmailProvider implements EmailProvider {
  readonly sent: OutgoingEmail[] = [];
  failWith: string | null = null;

  async send(email: OutgoingEmail): Promise<EmailReceipt> {
    if (this.failWith) throw new EmailDeliveryError(this.failWith);
    this.sent.push(email);
    return {
      messageId: `fake-${this.sent.length}`,
      previewUrl: "https://ethereal.email/message/fake",
    };
  }
}
