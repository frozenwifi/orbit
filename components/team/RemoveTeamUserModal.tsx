"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { TeamUser } from "@/types/domain";

interface RemoveTeamUserModalProps {
  user: TeamUser | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveTeamUserModal({ user, onClose, onConfirm }: RemoveTeamUserModalProps) {
  return <Modal open={Boolean(user)} title="Are you sure you want to remove this user?" onClose={onClose} showClose={false} portal initialFocus="panel" layerClassName="team-modal-layer" panelClassName="team-remove-modal" footer={<div className="team-modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="button" variant="primary" onClick={onConfirm}>Confirm</Button></div>}>
    <p>This will <strong>IMMEDIATELY</strong> and <strong>PERMANENTLY</strong> revoke their access to the system. To restore access, you will need to create a new user account.</p>
  </Modal>;
}
