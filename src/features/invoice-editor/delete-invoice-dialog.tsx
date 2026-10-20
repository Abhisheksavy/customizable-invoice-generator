"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface DeleteInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  onConfirm: () => Promise<void>;
}

export function DeleteInvoiceDialog({
  open,
  onClose,
  invoiceNumber,
  onConfirm,
}: DeleteInvoiceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const confirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!isDeleting}
      title={`Delete ${invoiceNumber.trim() || "this invoice"}?`}
      description="The invoice and its line items are removed permanently. This can't be undone."
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirm} disabled={isDeleting}>
          {isDeleting ? (
            <LoaderCircle aria-hidden className="animate-spin" />
          ) : (
            <Trash2 aria-hidden />
          )}
          Delete invoice
        </Button>
      </div>
    </Dialog>
  );
}
