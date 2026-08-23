"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Country, NetworkStatus, NetworkTechnology, NewNetworkInput, Operator, ResolvedNetwork } from "@/types/domain";
import { formatMccMnc } from "@/utils/networks";

interface NetworkFormModalProps {
  open: boolean;
  network: ResolvedNetwork | null;
  countries: readonly Country[];
  operators: readonly Operator[];
  networks: readonly ResolvedNetwork[];
  onClose: () => void;
  onSubmit: (input: NewNetworkInput) => void;
}

const technologies: readonly NetworkTechnology[] = ["2G", "3G", "4G", "LTE", "5G"];

function createDraft(countries: readonly Country[], operators: readonly Operator[]): NewNetworkInput {
  const countryId = countries[0]?.id ?? "";
  return { countryId, operatorId: operators.find((operator) => operator.countryIds.includes(countryId))?.id ?? operators[0]?.id ?? "", mcc: "", mnc: "", technologies: ["4G", "5G"], status: "Active" };
}

export function NetworkFormModal({ open, network, countries, operators, networks, onClose, onSubmit }: NetworkFormModalProps) {
  const [draft, setDraft] = useState<NewNetworkInput>(() => createDraft(countries, operators));
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setDraft(network ? { countryId: network.countryId, operatorId: network.operatorId, mcc: network.mcc, mnc: network.mnc, technologies: [...network.technologies], status: network.status } : createDraft(countries, operators));
  }, [countries, network, open, operators]);
  const countryOperators = useMemo(() => operators.filter((operator) => operator.countryIds.includes(draft.countryId)), [draft.countryId, operators]);
  const duplicate = networks.some((item) => item.id !== network?.id && item.mcc === draft.mcc.trim() && item.mnc === draft.mnc.trim() && draft.mcc.length === 3 && draft.mnc.length >= 2);
  const noTechnology = draft.technologies.length === 0;
  const error = submitted && duplicate ? `${formatMccMnc(draft.mcc, draft.mnc)} is already configured in Orbit.` : submitted && noTechnology ? "Select at least one supported technology." : "";
  const updateCountry = (countryId: string) => setDraft({ ...draft, countryId, operatorId: operators.find((operator) => operator.countryIds.includes(countryId))?.id ?? "" });
  const toggleTechnology = (technology: NetworkTechnology) => setDraft({ ...draft, technologies: draft.technologies.includes(technology) ? draft.technologies.filter((item) => item !== technology) : [...draft.technologies, technology] });

  return (
    <Modal open={open} title={network ? "Edit network configuration" : "Add network"} onClose={onClose} footer={<><span /><span className="modal-footer-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" form="network-form" variant="primary">{network ? "Save changes" : "Add network"}</Button></span></>}>
      <form className="orbit-form network-form" id="network-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); if (duplicate || noTechnology) return; onSubmit(draft); }}>
        <p className="form-intro">{network ? "Update Orbit's internal network catalog configuration." : "Add an operator network to the internal Orbit coverage catalog. Live carrier controls are not affected."}</p>
        <div className="form-grid">
          <label className="form-field"><span>Country</span><select value={draft.countryId} onChange={(event) => updateCountry(event.currentTarget.value)}>{countries.map((country) => <option value={country.id} key={country.id}>{country.name}</option>)}</select></label>
          <label className="form-field"><span>Operator</span><select required value={draft.operatorId} onChange={(event) => setDraft({ ...draft, operatorId: event.currentTarget.value })}>{countryOperators.map((operator) => <option value={operator.id} key={operator.id}>{operator.name}</option>)}</select></label>
          <label className="form-field"><span>MCC</span><input required inputMode="numeric" pattern="[0-9]{3}" maxLength={3} value={draft.mcc} onChange={(event) => setDraft({ ...draft, mcc: event.currentTarget.value.replace(/\D/g, "").slice(0, 3) })} placeholder="268" /></label>
          <label className="form-field"><span>MNC</span><input required inputMode="numeric" pattern="[0-9]{2,3}" maxLength={3} value={draft.mnc} onChange={(event) => setDraft({ ...draft, mnc: event.currentTarget.value.replace(/\D/g, "").slice(0, 3) })} placeholder="06" /></label>
          <label className="form-field"><span>Network status</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.currentTarget.value as NetworkStatus })}><option>Active</option><option>Degraded</option><option>Unavailable</option>{network?.status === "Disabled" ? <option>Disabled</option> : null}</select></label>
        </div>
        <fieldset className="technology-selector"><legend>Supported technologies</legend><div>{technologies.map((technology) => <label key={technology}><input type="checkbox" checked={draft.technologies.includes(technology)} onChange={() => toggleTechnology(technology)} /><span>{technology}</span></label>)}</div></fieldset>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <section className="network-form-note"><strong>Operational metrics</strong><span>New networks start with realistic typed mock availability, activation success, latency and connection values until a future telemetry source replaces them.</span></section>
      </form>
    </Modal>
  );
}
