"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Influencer, InfluencerPlatform, NewInfluencerInput, NewSubtenantInput, Subtenant, SubtenantKind } from "@/types/domain";

interface SubtenantFormModalProps {
  open: boolean;
  kind: SubtenantKind;
  initial?: Subtenant | null;
  onClose: () => void;
  onSave: (input: NewSubtenantInput) => void;
}

export function SubtenantFormModal({ open, kind, initial, onClose, onSave }: SubtenantFormModalProps) {
  const formId = useId();
  const [name, setName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [type, setType] = useState("");
  const [pricingCategory, setPricingCategory] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setBillingAddress(initial?.billingAddress ?? "");
    setEmail(initial?.email ?? "");
    setTaxId(initial?.taxId ?? "");
    setType(initial?.type ?? "");
    setPricingCategory(initial?.pricingCategory ?? "");
    setDiscountPercent(initial?.discountPercent?.toString() ?? "");
    setError("");
  }, [initial, open]);

  const submit = () => {
    if (!name.trim() || !billingAddress.trim() || !email.trim() || !taxId.trim() || !type || (kind === "brand-vno" && !pricingCategory)) {
      setError("Complete all required fields.");
      return;
    }
    onSave({ name, kind, billingAddress, email, taxId, type, pricingCategory: kind === "brand-vno" ? pricingCategory : `${discountPercent || 0}`, discountPercent: kind === "business-roaming" ? Number(discountPercent || 0) : undefined });
  };

  const isBusiness = kind === "business-roaming";
  const title = initial ? `Edit ${initial.name}` : isBusiness ? "Business roaming" : "New subtenant";

  return <Modal open={open} title={title} onClose={onClose} showClose={false} portal layerClassName="subtenant-modal-layer" panelClassName="subtenant-figma-modal subtenant-form-modal" footer={<div className="subtenant-modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="button" variant="primary" onClick={submit}>Save</Button></div>}>
    <form id={formId} onSubmit={(event) => { event.preventDefault(); submit(); }} noValidate>
      <label><span>{isBusiness ? "Company name" : "Subtenant name"}</span><input autoFocus value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder={isBusiness ? "Enter company name" : "Enter subtenant name"} /></label>
      <label><span>Billing address</span><input value={billingAddress} onChange={(event) => setBillingAddress(event.currentTarget.value)} placeholder="Enter billing address" /></label>
      <div className="subtenant-form-row">
        <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} placeholder="Enter email" /></label>
        <label><span>Tax ID</span><input value={taxId} onChange={(event) => setTaxId(event.currentTarget.value)} placeholder="Enter Tax ID" /></label>
      </div>
      <div className="subtenant-form-row">
        <label><span>{isBusiness ? "Company type" : "Subtenant type"}</span><select value={type} onChange={(event) => setType(event.currentTarget.value)}><option value="">Select {isBusiness ? "company" : "subtenant"} type</option>{(isBusiness ? ["Travel Agency", "Tour operator", "Corporate travel"] : ["Corporate client", "Wholesale partner", "Retail partner"]).map((option) => <option key={option}>{option}</option>)}</select></label>
        {isBusiness ? <label><span>% of the discount</span><input inputMode="decimal" value={discountPercent} onChange={(event) => setDiscountPercent(event.currentTarget.value.replace(/[^0-9.]/g, ""))} placeholder="Enter % of the discount" /></label> : <label><span>Pricing category</span><select value={pricingCategory} onChange={(event) => setPricingCategory(event.currentTarget.value)}><option value="">Select pricing category</option><option>Enterprise plan</option><option>Growth plan</option><option>Standard plan</option></select></label>}
      </div>
      {error ? <p className="subtenant-form-error" role="alert">{error}</p> : null}
      <button className="sr-only" type="submit" tabIndex={-1} aria-hidden="true">Save</button>
    </form>
  </Modal>;
}

interface InfluencerFormModalProps {
  open: boolean;
  initial?: Influencer | null;
  defaultSubtenantId?: string;
  onClose: () => void;
  onSave: (input: NewInfluencerInput) => void;
}

export function InfluencerFormModal({ open, initial, defaultSubtenantId, onClose, onSave }: InfluencerFormModalProps) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<InfluencerPlatform | "">("");
  const [email, setEmail] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [clickRate, setClickRate] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setPlatform(initial?.platform ?? "");
    setEmail(initial?.email ?? "");
    setRegistrationFee(initial?.registrationFee.toString() ?? "");
    setClickRate(initial?.conversionRate.toString() ?? "");
    setError("");
  }, [initial, open]);
  const submit = () => {
    if (!name.trim() || !platform || !email.trim()) { setError("Complete all required fields."); return; }
    onSave({ name, platform, email, registrationFee: Number(registrationFee || 0), clickRate: Number(clickRate || 0), subtenantId: defaultSubtenantId });
  };
  return <Modal open={open} title="Add influencer" onClose={onClose} showClose={false} portal layerClassName="subtenant-modal-layer" panelClassName="subtenant-figma-modal influencer-form-modal" footer={<div className="subtenant-modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="button" variant="primary" onClick={submit}>Save</Button></div>}>
    <form onSubmit={(event) => { event.preventDefault(); submit(); }} noValidate>
      <label><span>Influencer name</span><input autoFocus value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder="Enter influencer name" /></label>
      <label><span>Influencer platform</span><select value={platform} onChange={(event) => setPlatform(event.currentTarget.value as InfluencerPlatform)}><option value="">Select influencer platform</option><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>X</option></select></label>
      <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} placeholder="Enter email" /></label>
      <div className="subtenant-form-row"><label><span>Referral one off fee (£)</span><input inputMode="decimal" value={registrationFee} onChange={(event) => setRegistrationFee(event.currentTarget.value.replace(/[^0-9.]/g, ""))} placeholder="Enter rate" /></label><label><span>Click rate</span><input inputMode="decimal" value={clickRate} onChange={(event) => setClickRate(event.currentTarget.value.replace(/[^0-9.]/g, ""))} placeholder="Enter click rate" /></label></div>
      {error ? <p className="subtenant-form-error" role="alert">{error}</p> : null}
      <button className="sr-only" type="submit" tabIndex={-1} aria-hidden="true">Save</button>
    </form>
  </Modal>;
}

export function SubtenantSuccessModal({ open, title = "Subtenant successfully added!", onConfirm }: { open: boolean; title?: string; onConfirm: () => void }) {
  return <Modal open={open} title={title} onClose={onConfirm} showClose={false} portal layerClassName="subtenant-modal-layer" panelClassName="subtenant-figma-modal subtenant-success-modal">
    <div className="subtenant-success-content"><span className="subtenant-success-check" aria-hidden="true">✓</span><h2>{title}</h2><p>The new subtenant has been added to the system and is ready for use. You can manage its settings in the subtenant&apos;s section.</p><Button variant="primary" onClick={onConfirm}>Confirm</Button></div>
  </Modal>;
}

interface ActionConfirmationProps {
  open: boolean;
  name: string;
  action: "block" | "unblock" | "delete";
  onClose: () => void;
  onConfirm: () => void;
}

export function SubtenantActionConfirmation({ open, name, action, onClose, onConfirm }: ActionConfirmationProps) {
  const title = `Are you sure you want to ${action} ${name}?`;
  const copy = action === "delete" ? "This will permanently remove the subtenant from the system." : `It will ${action === "block" ? "block" : "restore"} its connectivity on the eSIM.`;
  return <Modal open={open} title={title} onClose={onClose} showClose={false} portal layerClassName="subtenant-modal-layer" panelClassName="subtenant-figma-modal subtenant-confirm-modal" footer={<div className="subtenant-modal-actions"><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={onConfirm}>Confirm</Button></div>}><p>{copy}</p></Modal>;
}
