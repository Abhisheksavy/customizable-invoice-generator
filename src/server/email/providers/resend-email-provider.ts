import { Resend } from "resend";
import { EmailDeliveryError } from "../../errors/email-delivery-error";
import type { EmailProvider, EmailReceipt, OutgoingEmail } from "../email-provider";
import { formatSender } from "../format-sender";

/** Delivers real email through Resend's HTTP API. */
export class ResendEmailProvider implements EmailProvider {
  private readonly client: Resend;
  private readonly fromAddress: string;

  constructor(apiKey: string, fromAddress: string) {
    this.client = new Resend(apiKey);
    this.fromAddress = fromAddress;
  }

  async send(email: OutgoingEmail): Promise<EmailReceipt> {
    let response: Awaited<ReturnType<Resend["emails"]["send"]>>;
    try {
      response = await this.client.emails.send({
        from: formatSender(email.senderName, this.fromAddress),
        to: email.to,
        replyTo: email.replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } catch (cause) {
      throw new EmailDeliveryError("Couldn't reach Resend. Check your connection and try again.", {
        cause,
      });
    }

    if (response.error || !response.data) {
      const reason = response.error?.message ?? "no message id was returned";
      throw new EmailDeliveryError(`Resend didn't accept the email: ${reason}`, {
        cause: response.error,
      });
    }
    return { messageId: response.data.id, previewUrl: null };
  }
}
