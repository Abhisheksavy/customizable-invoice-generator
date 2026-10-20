import { z } from "zod";
import { optionalText, requiredEmail, requiredText } from "./fields";

export const sendInvoiceSchema = z.object({
  to: requiredEmail,
  subject: requiredText("Subject", 150),
  message: optionalText("Message", 2000),
});

export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>;

export interface SendInvoiceResultDto {
  sentAt: string;
  previewUrl: string | null;
}
