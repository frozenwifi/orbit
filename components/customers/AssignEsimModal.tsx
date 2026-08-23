"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ResolvedCustomer } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { customerName } from "@/utils/customers";

interface AssignEsimModalProps {
  open: boolean;
  customer: ResolvedCustomer | null;
  availableEsims: readonly Esim[];
  onClose: () => void;
  onAssign: (esimId: string) => void;
}

export function AssignEsimModal({ open, customer, availableEsims, onClose, onAssign }: AssignEsimModalProps) {
  const [esimId, setEsimId] = useState("");
  useEffect(() => { if (open) setEsimId(availableEsims[0]?.id ?? ""); }, [availableEsims, open]);

  return (
    <Modal open={open} title="Assign eSIM" onClose={onClose} footer={(
      <>
        <span />
        <span className="modal-footer-actions"><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!esimId} onClick={() => onAssign(esimId)}>Assign eSIM</Button></span>
      </>
    )}>
      <div className="orbit-form">
        <p className="form-intro">Choose an unassigned eSIM for {customer ? customerName(customer) : "this customer"}. The shared inventory will update immediately.</p>
        {availableEsims.length ? (
          <label className="form-field"><span>Available eSIM</span><select value={esimId} onChange={(event) => setEsimId(event.currentTarget.value)}>{availableEsims.map((esim) => <option key={esim.id} value={esim.id}>{esim.label} · {esim.id} · {esim.plan.name}</option>)}</select></label>
        ) : <div className="inline-empty"><strong>No unassigned eSIMs</strong><span>Add a new eSIM to expand inventory.</span></div>}
      </div>
    </Modal>
  );
}
