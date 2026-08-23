"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { AllowanceUnit, CurrencyCode, NewPlanInput, Plan, PlanStatus, ValidityUnit } from "@/types/domain";
import { formatPlanMoney } from "@/utils/plans";

export type PlanFormMode = "add" | "edit" | "duplicate";
export type PlanDraft = NewPlanInput;

interface PlanFormModalProps {
  open: boolean;
  mode: PlanFormMode;
  plan?: Plan | null;
  destinations: readonly string[];
  onClose: () => void;
  onSubmit: (draft: PlanDraft) => void;
}

const emptyDraft: PlanDraft = {
  name: "",
  allowanceValue: 10,
  allowanceUnit: "GB",
  validity: 30,
  validityUnit: "Days",
  destination: "Europe",
  wholesaleCost: 5,
  retailPrice: 12.99,
  currency: "GBP",
  hotspotAllowed: true,
  status: "Active",
};

function draftFromPlan(plan: Plan, duplicate: boolean): PlanDraft {
  return {
    name: duplicate ? `${plan.name} Copy` : plan.name,
    allowanceValue: plan.allowanceUnit === "MB" ? plan.allowanceGb * 1024 : plan.allowanceGb,
    allowanceUnit: plan.allowanceUnit,
    validity: plan.validity,
    validityUnit: plan.validityUnit,
    destination: plan.destination,
    wholesaleCost: plan.wholesaleCost,
    retailPrice: plan.retailPrice,
    currency: plan.currency,
    hotspotAllowed: plan.hotspotAllowed,
    status: duplicate || plan.status === "Archived" ? "Inactive" : plan.status,
    coverage: plan.coverage,
  };
}

export function PlanFormModal({ open, mode, plan, destinations, onClose, onSubmit }: PlanFormModalProps) {
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft);
  useEffect(() => {
    if (!open) return;
    setDraft(plan ? draftFromPlan(plan, mode === "duplicate") : { ...emptyDraft, destination: destinations[0] ?? emptyDraft.destination });
  }, [destinations, mode, open, plan]);

  const profit = draft.retailPrice - draft.wholesaleCost;
  const margin = draft.retailPrice > 0 ? (profit / draft.retailPrice) * 100 : 0;
  const title = mode === "edit" ? "Edit data plan" : mode === "duplicate" ? "Duplicate data plan" : "Add data plan";
  const submitLabel = mode === "edit" ? "Save changes" : mode === "duplicate" ? "Create duplicate" : "Add data plan";
  const coverageCount = useMemo(() => plan?.coverage.length ?? 0, [plan]);

  return (
    <Modal open={open} title={title} onClose={onClose} footer={(
      <><span /><span className="modal-footer-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" form="plan-form" variant="primary">{submitLabel}</Button></span></>
    )}>
      <form className="orbit-form plan-form" id="plan-form" onSubmit={(event) => { event.preventDefault(); onSubmit(draft); }}>
        <p className="form-intro">{mode === "edit" ? "Update the commercial and coverage settings for this shared plan." : mode === "duplicate" ? "Use this plan as a starting point. A separate plan ID will be generated." : "Create a reusable data plan for assignment across Orbit eSIM inventory."}</p>
        <label className="form-field"><span>Plan name</span><input required autoComplete="off" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })} placeholder="e.g. Europe Business 25 GB" /></label>
        <div className="form-grid">
          <label className="form-field"><span>Data allowance</span><span className="compound-input"><input required min="1" step="0.1" type="number" value={draft.allowanceValue} onChange={(event) => setDraft({ ...draft, allowanceValue: Number(event.currentTarget.value) })} /><select aria-label="Allowance unit" value={draft.allowanceUnit} onChange={(event) => setDraft({ ...draft, allowanceUnit: event.currentTarget.value as AllowanceUnit })}><option>GB</option><option>MB</option></select></span></label>
          <label className="form-field"><span>Validity</span><span className="compound-input"><input required min="1" step="1" type="number" value={draft.validity} onChange={(event) => setDraft({ ...draft, validity: Number(event.currentTarget.value) })} /><select aria-label="Validity unit" value={draft.validityUnit} onChange={(event) => setDraft({ ...draft, validityUnit: event.currentTarget.value as ValidityUnit })}><option>Days</option><option>Months</option></select></span></label>
          <label className="form-field"><span>Coverage / destination</span><select value={draft.destination} onChange={(event) => setDraft({ ...draft, destination: event.currentTarget.value, coverage: undefined })}>{destinations.map((destination) => <option key={destination}>{destination}</option>)}</select>{mode === "edit" && coverageCount ? <small>{coverageCount} current coverage markets</small> : null}</label>
          <label className="form-field"><span>Plan status</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.currentTarget.value as PlanStatus })}><option>Active</option><option>Inactive</option></select></label>
          <label className="form-field"><span>Wholesale cost</span><input required min="0" step="0.01" type="number" value={draft.wholesaleCost} onChange={(event) => setDraft({ ...draft, wholesaleCost: Number(event.currentTarget.value) })} /></label>
          <label className="form-field"><span>Retail price</span><input required min="0" step="0.01" type="number" value={draft.retailPrice} onChange={(event) => setDraft({ ...draft, retailPrice: Number(event.currentTarget.value) })} /></label>
          <label className="form-field"><span>Currency</span><select value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.currentTarget.value as CurrencyCode })}><option value="GBP">GBP — British pound</option><option value="EUR">EUR — Euro</option><option value="USD">USD — US dollar</option></select></label>
        </div>
        <label className="orbit-check"><input type="checkbox" checked={draft.hotspotAllowed} onChange={(event) => setDraft({ ...draft, hotspotAllowed: event.currentTarget.checked })} /><span><strong>Allow personal hotspot</strong><small>Customers can share this plan&apos;s connection with nearby devices.</small></span></label>
        <section className="plan-pricing-preview" aria-label="Calculated pricing summary">
          <div><span>Retail price</span><strong>{formatPlanMoney(draft.retailPrice, draft.currency)}</strong></div>
          <div><span>Wholesale cost</span><strong>{formatPlanMoney(draft.wholesaleCost, draft.currency)}</strong></div>
          <div><span>Gross profit</span><strong className={profit < 0 ? "negative" : ""}>{formatPlanMoney(profit, draft.currency)}</strong></div>
          <div><span>Margin</span><strong className={margin < 0 ? "negative" : ""}>{margin.toFixed(1)}%</strong></div>
        </section>
      </form>
    </Modal>
  );
}
