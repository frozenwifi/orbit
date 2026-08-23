"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ResolvedCustomer, ResolvedPlan, UpdateEsimAssignmentInput } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { customerName } from "@/utils/customers";

interface EsimAssignmentModalProps {
  open: boolean;
  esim: Esim | null;
  customers: readonly ResolvedCustomer[];
  plans: readonly ResolvedPlan[];
  onClose: () => void;
  onSave: (input: UpdateEsimAssignmentInput) => void;
}

export function EsimAssignmentModal({ open, esim, customers, plans, onClose, onSave }: EsimAssignmentModalProps) {
  const [customerId, setCustomerId] = useState("");
  const [planId, setPlanId] = useState("");
  const assignableCustomers = useMemo(() => customers.filter((customer) => customer.status !== "Archived"), [customers]);
  const assignablePlans = useMemo(() => plans.filter((plan) => plan.status === "Active"), [plans]);

  useEffect(() => {
    if (!open || !esim) return;
    setCustomerId(esim.customerId ?? "");
    setPlanId(assignablePlans.some((plan) => plan.id === esim.planId) ? esim.planId : assignablePlans[0]?.id ?? "");
  }, [assignablePlans, esim, open]);

  return <Modal open={open} title="Change assignment" onClose={onClose} footer={<><span /><span className="modal-footer-actions"><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!planId} onClick={() => onSave({ customerId: customerId || null, planId })}>Save changes</Button></span></>}>
    <div className="orbit-form">
      <p className="form-intro">Update the customer and active data plan for {esim?.label ?? "this eSIM"}. The shared Orbit inventory updates everywhere immediately.</p>
      <div className="form-grid">
        <label className="form-field"><span>Assigned customer</span><select value={customerId} onChange={(event) => setCustomerId(event.currentTarget.value)}><option value="">Unassigned</option>{assignableCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)} · {customer.id}</option>)}</select></label>
        <label className="form-field"><span>Data plan</span><select value={planId} onChange={(event) => setPlanId(event.currentTarget.value)}>{assignablePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
      </div>
    </div>
  </Modal>;
}
