export interface OutgoingEmail {
  senderName: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailReceipt {
  messageId: string;
  previewUrl: string | null;
}

/** Port for sending email; concrete adapters live in ./providers. */
export interface EmailProvider {
  send(email: OutgoingEmail): Promise<EmailReceipt>;
}
