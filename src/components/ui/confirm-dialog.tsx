"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isProcessing = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      {children}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isProcessing}>
          {isProcessing ? "Please wait..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
