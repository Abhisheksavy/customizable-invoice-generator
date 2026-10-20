import { Check } from "lucide-react";
import type { InvoiceStatus } from "@/shared/dto/invoice.dto";
import { Badge } from "./ui/badge";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return status === "sent" ? (
    <Badge tone="success">
      <Check aria-hidden className="size-3" strokeWidth={3} />
      Sent
    </Badge>
  ) : (
    <Badge>
      <span aria-hidden className="size-1.5 rounded-full bg-ink-muted" />
      Draft
    </Badge>
  );
}
