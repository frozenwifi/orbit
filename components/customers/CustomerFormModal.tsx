"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Country, ResolvedCustomer } from "@/types/domain";
import type { Esim } from "@/types/esim";

export interface CustomerDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryId: string;
  esimId: string;
}

interface CustomerFormModalProps {
  open: boolean;
  customer?: ResolvedCustomer | null;
  countries: readonly Country[];
  availableEsims: readonly Esim[];
  onClose: () => void;
  onSubmit: (draft: CustomerDraft) => void;
}

const emptyDraft: CustomerDraft = { firstName: "", lastName: "", email: "", phone: "", countryId: "CTY-PT", esimId: "" };

export function CustomerFormModal({ open, customer, countries, availableEsims, onClose, onSubmit }: CustomerFormModalProps) {
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft);
  const isEdit = Boolean(customer);

  useEffect(() => {
    if (!open) return;
    setDraft(customer ? {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      countryId: customer.countryId,
      esimId: "",
    } : emptyDraft);
  }, [customer, open]);

  return (
    <Modal open={open} title={isEdit ? "Edit customer" : "Add customer"} onClose={onClose} footer={(
      <>
        <span />
        <span className="modal-footer-actions">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="customer-form" variant="primary">{isEdit ? "Save changes" : "Add customer"}</Button>
        </span>
      </>
    )}>
      <form className="orbit-form" id="customer-form" onSubmit={(event) => { event.preventDefault(); onSubmit(draft); }}>
        <p className="form-intro">{isEdit ? "Update contact and market details for this Orbit customer." : "Create a customer profile and optionally assign an available eSIM."}</p>
        <div className="form-grid">
          <label className="form-field"><span>First name</span><input required autoComplete="given-name" value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.currentTarget.value })} placeholder="First name" /></label>
          <label className="form-field"><span>Last name</span><input required autoComplete="family-name" value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.currentTarget.value })} placeholder="Last name" /></label>
          <label className="form-field"><span>Email</span><input required type="email" autoComplete="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.currentTarget.value })} placeholder="name@company.com" /></label>
          <label className="form-field"><span>Phone</span><input required type="tel" autoComplete="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.currentTarget.value })} placeholder="+351 912 345 678" /></label>
          <label className="form-field"><span>Country</span><select value={draft.countryId} onChange={(event) => setDraft({ ...draft, countryId: event.currentTarget.value })}>{countries.map((country) => <option value={country.id} key={country.id}>{country.name}</option>)}</select></label>
          {!isEdit ? <label className="form-field"><span>Optional eSIM assignment</span><select value={draft.esimId} onChange={(event) => setDraft({ ...draft, esimId: event.currentTarget.value })}><option value="">No eSIM for now</option>{availableEsims.map((esim) => <option value={esim.id} key={esim.id}>{esim.label} · {esim.id}</option>)}</select></label> : null}
        </div>
      </form>
    </Modal>
  );
}
