"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  warningTitle?: string;
  confirmVariant?: "danger" | "primary";
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmationModal({ open, title, message, confirmLabel, warningTitle = "This action affects the customer record", confirmVariant = "danger", onClose, onConfirm }: ConfirmationModalProps) {
  return (
    <Modal open={open} title={title} onClose={onClose} footer={(
      <>
        <span />
        <span className="modal-footer-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </span>
      </>
    )}>
      <div className="confirmation-content">
        <span className="confirmation-icon" aria-hidden="true">!</span>
        <div><strong>{warningTitle}</strong><p>{message}</p></div>
      </div>
    </Modal>
  );
}
