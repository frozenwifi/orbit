"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ApiApplication } from "@/types/domain";

interface RemoveApiKeyModalProps {
  application: ApiApplication | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveApiKeyModal({ application, onClose, onConfirm }: RemoveApiKeyModalProps) {
  return <Modal open={Boolean(application)} title="Are you sure you want to remove this API Key?" onClose={onClose} showClose={false} portal layerClassName="api-figma-modal-layer" panelClassName="api-figma-modal api-remove-modal" footer={<div className="api-modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="button" variant="primary" onClick={onConfirm}>Confirm</Button></div>}>
    <p>This will <strong>IMMEDIATELY</strong> and <strong>PERMANENTLY</strong> block access to the Connectivity API with this API Key. You must create a new API Key to re-enable access.</p>
    {application ? <p className="api-confirm-reference"><span>API key</span><code>{application.apiKey}</code></p> : null}
  </Modal>;
}
