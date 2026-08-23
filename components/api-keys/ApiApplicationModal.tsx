"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { NewApiApplicationInput } from "@/types/domain";

interface ApiApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewApiApplicationInput) => void;
}

export function ApiApplicationModal({ open, onClose, onCreate }: ApiApplicationModalProps) {
  const fieldId = useId();
  const errorId = useId();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setError("");
  }, [open]);

  const submit = () => {
    if (!name.trim()) {
      setError("Enter an application name.");
      return;
    }
    onCreate({ name });
  };

  return <Modal open={open} title="New API Application" onClose={onClose} showClose={false} portal layerClassName="api-figma-modal-layer" panelClassName="api-figma-modal api-create-modal" footer={<div className="api-modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="button" variant="primary" onClick={submit}>Create App</Button></div>}>
    <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <label htmlFor={fieldId}>Name</label>
      <input id={fieldId} type="text" value={name} placeholder="Enter App name" autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => { setName(event.currentTarget.value); if (error) setError(""); }} />
      {error ? <span className="api-modal-error" id={errorId} role="alert">{error}</span> : null}
    </form>
  </Modal>;
}
