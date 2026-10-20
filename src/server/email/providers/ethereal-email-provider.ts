import nodemailer, { type Transporter } from "nodemailer";
import { EmailDeliveryError } from "../../errors/email-delivery-error";
import type { EmailProvider, EmailReceipt, OutgoingEmail } from "../email-provider";
import { formatSender } from "../format-sender";

interface EtherealInbox {
  transporter: Transporter;
  address: string;
}

/** Sends over SMTP to a throwaway Ethereal inbox: nothing is delivered, every message gets a preview link. */
export class EtherealEmailProvider implements EmailProvider {
  private inbox: Promise<EtherealInbox> | null = null;

  async send(email: OutgoingEmail): Promise<EmailReceipt> {
    try {
      const { transporter, address } = await this.getInbox();
      const info = await transporter.sendMail({
        from: formatSender(email.senderName, address),
        to: email.to,
        replyTo: email.replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      return { messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
    } catch (cause) {
      throw new EmailDeliveryError(
        "Couldn't reach the Ethereal test inbox. Check your connection and try again.",
        { cause },
      );
    }
  }

  /** Creates the test account once and reuses it; a failed attempt is retried on the next send. */
  private getInbox(): Promise<EtherealInbox> {
    if (!this.inbox) {
      this.inbox = createInbox();
      this.inbox.catch(() => (this.inbox = null));
    }
    return this.inbox;
  }
}

async function createInbox(): Promise<EtherealInbox> {
  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
  return { transporter, address: account.user };
}
