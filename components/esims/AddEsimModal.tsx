"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Plan, ResolvedCustomer } from "@/types/domain";

export interface NewEsimDraft {
  label: string;
  userName: string;
  userEmail: string;
  customerId?: string | null;
  planId: string;
  destination: string;
  activateNow: boolean;
}

interface AddEsimModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (draft: NewEsimDraft) => void;
  initialAssignee?: { name: string; email: string } | null;
  initialCustomerId?: string | null;
  plans: readonly Plan[];
  customers?: readonly ResolvedCustomer[];
  variant?: "default" | "superadmin";
  onViewProducts?: () => void;
}

const initialDraft = (plans: readonly Plan[], customerId: string | null = null, activateNow = true): NewEsimDraft => ({
  label: "",
  userName: "",
  userEmail: "",
  customerId,
  planId: plans.find((plan) => plan.status === "Active")?.id ?? plans[0]?.id ?? "",
  destination: plans.find((plan) => plan.status === "Active")?.destination ?? plans[0]?.destination ?? "Global",
  activateNow,
});

export function AddEsimModal({ open, onClose, onAdd, initialAssignee, initialCustomerId = null, plans, customers = [], variant = "default", onViewProducts }: AddEsimModalProps) {
  const superadmin = variant === "superadmin";
  const [draft, setDraft] = useState<NewEsimDraft>(() => initialDraft(plans, initialCustomerId, !superadmin));
  const destinations = [...new Set(plans.map((plan) => plan.destination))];

  useEffect(() => {
    if (!open) return;
    setDraft({
      ...initialDraft(plans, initialCustomerId, !superadmin),
      userName: initialAssignee?.name ?? "",
      userEmail: initialAssignee?.email ?? "",
    });
  }, [initialAssignee, initialCustomerId, open, plans, superadmin]);

  const updatePlan = (planId: string) => {
    const selected = plans.find((plan) => plan.id === planId);
    setDraft((current) => ({ ...current, planId, destination: selected?.destination ?? current.destination }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd(draft);
  };

  if (superadmin) {
    return (
      <Modal
        open={open}
        title="New eSIM"
        onClose={onClose}
        panelClassName="superadmin-esim-modal"
        showClose={false}
        footer={(
          <span className="superadmin-esim-modal-actions">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="add-esim-form" variant="primary">Save</Button>
          </span>
        )}
      >
        <form className="superadmin-esim-form" id="add-esim-form" onSubmit={submit}>
          <p>Select one of the available data plans to activate the eSIM by clicking “View products”. If desired, associate the eSIM with a specific customer and add any additional information related to it.</p>
          <div className="superadmin-plan-field">
            <label className="form-field">
              <span>Data plan</span>
              <select required value={draft.planId} onChange={(event) => updatePlan(event.currentTarget.value)}>
                {plans.filter((plan) => plan.status === "Active").map((plan) => <option value={plan.id} key={plan.id}>{plan.name}</option>)}
              </select>
            </label>
            <Button className="view-products-button" type="button" onClick={onViewProducts}>View products</Button>
          </div>
          <label className="form-field">
            <span>Assigned customer</span>
            <select value={draft.customerId ?? ""} onChange={(event) => {
              const customer = customers.find((item) => item.id === event.currentTarget.value);
              setDraft((current) => ({ ...current, customerId: customer?.id ?? null, userName: customer ? `${customer.firstName} ${customer.lastName}` : "", userEmail: customer?.email ?? "" }));
            }}>
              <option value="">Select assigned customer</option>
              {customers.filter((customer) => customer.status !== "Archived").map((customer) => <option value={customer.id} key={customer.id}>{customer.firstName} {customer.lastName} · {customer.id}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>eSIM tag</span>
            <input required autoComplete="off" value={draft.label} onChange={(event) => setDraft((current) => ({ ...current, label: event.currentTarget.value }))} placeholder="Enter eSIM tag" />
          </label>
        </form>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title="Add eSIM"
      onClose={onClose}
      footer={(
        <>
          <span />
          <span className="modal-footer-actions">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="add-esim-form" variant="primary">Add eSIM</Button>
          </span>
        </>
      )}
    >
      <form className="orbit-form" id="add-esim-form" onSubmit={submit}>
        <p className="form-intro">Create an eSIM and optionally assign it to a team member. You can change these details later.</p>
        <label className="form-field"><span>eSIM label</span><input required autoComplete="off" value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.currentTarget.value })} placeholder="e.g. Madrid field team" /></label>
        <div className="form-grid">
          <label className="form-field"><span>Assigned user</span><input autoComplete="name" value={draft.userName} onChange={(event) => setDraft({ ...draft, userName: event.currentTarget.value })} placeholder="Full name" /></label>
          <label className="form-field"><span>User email</span><input type="email" autoComplete="email" value={draft.userEmail} onChange={(event) => setDraft({ ...draft, userEmail: event.currentTarget.value })} placeholder="name@company.com" /></label>
          <label className="form-field"><span>Data plan</span><select value={draft.planId} onChange={(event) => updatePlan(event.currentTarget.value)}>{plans.filter((plan) => plan.status === "Active").map((plan) => <option value={plan.id} key={plan.id}>{plan.name}</option>)}</select></label>
          <label className="form-field"><span>Destination / region</span><select value={draft.destination} onChange={(event) => setDraft({ ...draft, destination: event.currentTarget.value })}>{destinations.map((destination) => <option key={destination}>{destination}</option>)}</select></label>
        </div>
        <label className="orbit-check"><input type="checkbox" checked={draft.activateNow} onChange={(event) => setDraft({ ...draft, activateNow: event.currentTarget.checked })} /><span><strong>Activate immediately</strong><small>The plan cycle starts as soon as the eSIM is added.</small></span></label>
      </form>
    </Modal>
  );
}
