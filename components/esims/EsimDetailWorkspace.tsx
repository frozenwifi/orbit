"use client";

import { Button } from "@/components/ui/Button";
import { EntityReference } from "@/components/ui/EntityReference";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { EsimQrCode } from "@/components/esims/EsimQrCode";
import type { Esim } from "@/types/esim";
import { formatOrbitDate, statusTone } from "@/utils/esims";

export type EsimWorkspaceTab = "summary" | "activation" | "usage";

interface EsimDetailWorkspaceProps {
  esim: Esim;
  tab: EsimWorkspaceTab;
  onTabChange: (tab: EsimWorkspaceTab) => void;
  onClose: () => void;
  onToggleStatus: (esim: Esim) => void;
  onReassign: (esim: Esim) => void;
  onNotify: (message: string) => void;
}

function displayStatus(esim: Esim) {
  return esim.status === "Pending" ? "Awaiting activation" : esim.status;
}

function networkState(esim: Esim): { label: string; tone: StatusBadgeTone } {
  if (esim.status === "Active" && esim.network?.status === "Active") return { label: "Active", tone: "success" };
  if (esim.status === "Suspended" || esim.status === "Pending") return { label: "Blocked", tone: "danger" };
  return { label: "Disconnected", tone: "neutral" };
}

function EsimNetworkChart({ esim }: { esim: Esim }) {
  const modifier = Math.max(0.72, Math.min(1.18, esim.dataUsedGb / Math.max(esim.plan.allowanceGb, 1) + 0.58));
  return (
    <div className="esim-network-chart">
      <div className="esim-network-y-axis" aria-hidden="true"><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span></div>
      <div className="esim-network-plot">
        <svg viewBox="0 0 920 278" role="img" aria-label={`Monthly network usage for ${esim.id}`} preserveAspectRatio="none">
          <title>Monthly network usage: data, calls and SMS</title>
          <g className="esim-chart-grid"><line x1="0" y1="18" x2="920" y2="18" /><line x1="0" y1="78" x2="920" y2="78" /><line x1="0" y1="138" x2="920" y2="138" /><line x1="0" y1="198" x2="920" y2="198" /><line x1="0" y1="258" x2="920" y2="258" /></g>
          <path className="esim-chart-line data" d={`M0 ${92 * modifier} C80 25, 144 112, 250 154 S410 104, 514 74 S690 20, 920 208`} />
          <path className="esim-chart-line calls" d="M0 116 C74 62, 160 184, 258 212 S420 112, 532 54 S720 28, 920 208" />
          <path className="esim-chart-line sms" d="M0 104 C70 12, 160 44, 250 108 S420 164, 540 112 S720 34, 920 152" />
        </svg>
        <div className="esim-network-x-axis" aria-hidden="true">{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => <span key={month}>{month}</span>)}</div>
      </div>
    </div>
  );
}

function SummaryPanel({ esim, onToggleStatus, onReassign }: Pick<EsimDetailWorkspaceProps, "esim" | "onToggleStatus" | "onReassign">) {
  const network = networkState(esim);
  const actionLabel = esim.status === "Active" ? "Block eSIM" : esim.status === "Suspended" ? "Re-activate eSIM" : "Activate eSIM";
  const planStatusTone: StatusBadgeTone = esim.plan.status === "Active" ? "success" : esim.plan.status === "Inactive" ? "warning" : "danger";

  return (
    <div className="esim-summary-workspace">
      <div className="esim-summary-top-grid">
        <section className="card esim-details-card" aria-labelledby="esim-details-heading">
          <header>
            <h2 id="esim-details-heading">eSIM details</h2>
            <span className="esim-card-actions">
              <Button compact variant={esim.status === "Active" ? "danger" : "primary"} onClick={() => onToggleStatus(esim)}>{actionLabel}</Button>
              <button className="esim-edit-button" type="button" onClick={() => onReassign(esim)} aria-label="Edit eSIM assignment and plan">✎</button>
            </span>
          </header>
          <dl className="esim-details-list">
            <div><dt>Orbit UID <span title="Orbit internal identifier" aria-label="Orbit internal identifier">ⓘ</span></dt><dd>{esim.id}</dd></div>
            <div><dt>ICCID <span title="Integrated circuit card identifier" aria-label="Integrated circuit card identifier">ⓘ</span></dt><dd>{esim.iccid}</dd></div>
            <div><dt>Assigned customer</dt><dd>{esim.customer ? <EntityReference className="esim-workspace-link" entityType="customer" entityId={esim.customer.id}>{esim.user?.name}</EntityReference> : "Unassigned"}</dd></div>
            <div><dt>Date assigned</dt><dd>{formatOrbitDate(esim.activationDate)}</dd></div>
            <div><dt>eSIM status <span title="Provisioning status" aria-label="Provisioning status">ⓘ</span></dt><dd><StatusBadge label={displayStatus(esim)} tone={statusTone(esim.status)} /></dd></div>
            <div><dt>Network status <span title="Current connectivity status" aria-label="Current connectivity status">ⓘ</span></dt><dd><StatusBadge label={network.label} tone={network.tone} /></dd></div>
            <div><dt>eSIM tag</dt><dd>{esim.label}</dd></div>
          </dl>
        </section>

        <section className="card esim-network-card" aria-labelledby="esim-network-heading">
          <header>
            <h2 id="esim-network-heading">Network</h2>
            <span className="esim-network-legend" aria-label="Chart legend"><i className="data" />GiB<i className="calls" />Calls<i className="sms" />SMS</span>
            <button className="esim-year-select" type="button" aria-label="Network chart year, 2026"><span aria-hidden="true">▣</span>2026<span aria-hidden="true">⌄</span></button>
          </header>
          <EsimNetworkChart esim={esim} />
        </section>
      </div>

      <section className="card esim-data-plans-card" aria-labelledby="esim-data-plans-heading">
        <header>
          <h2 id="esim-data-plans-heading">Data plans</h2>
          <Button compact variant="primary" onClick={() => onReassign(esim)}>Add data plan</Button>
        </header>
        <div className="esim-plan-table-wrap">
          <table className="esim-plan-table">
            <thead><tr><th scope="col">ID</th><th scope="col">Name</th><th scope="col">Status</th><th scope="col">Data usage</th><th scope="col">Validity</th><th scope="col">Created</th><th scope="col">Expiration</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody><tr>
              <td data-label="ID">{esim.plan.id}</td>
              <td data-label="Name"><EntityReference className="esim-plan-name-link" entityType="plan" entityId={esim.plan.id}>{esim.plan.name}</EntityReference></td>
              <td data-label="Status"><StatusBadge label={esim.plan.status} tone={planStatusTone} /></td>
              <td data-label="Data usage"><span className="esim-plan-usage"><span>{esim.dataUsedGb.toFixed(2)} GB used / {esim.plan.allowanceGb} GB</span><ProgressBar compact value={esim.dataUsedGb} max={esim.plan.allowanceGb} label={`Data usage for ${esim.plan.name}`} /></span></td>
              <td data-label="Validity">{esim.plan.validity} {esim.plan.validityUnit.toLocaleLowerCase()}</td>
              <td data-label="Created">{formatOrbitDate(esim.plan.createdDate)}</td>
              <td data-label="Expiration">{formatOrbitDate(esim.expiryDate)}</td>
              <td data-label="Actions"><button className="esim-delete-button" type="button" onClick={() => onReassign(esim)} aria-label="Replace assigned data plan" title="Replace assigned data plan"><span className="esim-delete-glyph" aria-hidden="true" /></button></td>
            </tr></tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ActivationPanel({ esim, onNotify }: Pick<EsimDetailWorkspaceProps, "esim" | "onNotify">) {
  const activationCode = `LPA:1$consumer.e-sim.global$${esim.iccid.slice(-12).toLocaleUpperCase()}`;
  const copyActivationCode = async () => {
    try { await navigator.clipboard.writeText(activationCode); } catch { /* Clipboard can be unavailable in a local preview. */ }
    onNotify("Activation code copied to clipboard.");
  };

  return (
    <div className="esim-activation-grid">
      <section className="card esim-qr-card" aria-labelledby="esim-qr-heading">
        <header><h2 id="esim-qr-heading">QR Code</h2><Button compact variant="primary" onClick={() => onNotify(`Activation instructions sent to ${esim.user?.email ?? "the assigned user"}.`)}>Send to user</Button></header>
        <EsimQrCode value={activationCode} />
        <p>If you can’t scan the QR code, manually add a new data plan to your device with the Activation Code below.</p>
        <dl className="esim-activation-values">
          <div><dt>Activation Code</dt><dd><button type="button" onClick={copyActivationCode}>{activationCode.replace("LPA:1$consumer.e-sim.global$", "")}</button></dd></div>
          <div><dt>SM-DP Address</dt><dd>consumer.e-sim.global</dd></div>
        </dl>
        <Button className="esim-help-button" onClick={() => onNotify("Orbit support has been notified.")}>Need help?</Button>
      </section>

      <div className="esim-activation-copy">
        <section className="card esim-instructions-card" aria-labelledby="esim-instructions-heading">
          <header><h2 id="esim-instructions-heading">Activation instructions</h2><Button compact variant="primary" onClick={() => onNotify(`Activation instructions sent to ${esim.user?.email ?? "the assigned user"}.`)}>Send to user</Button></header>
          <div className="esim-instruction-block"><h3>QR Code Installation</h3><ul><li>Scan the QR code with the Camera app.</li><li>Follow the prompts on screen to add a new Data Plan.</li></ul></div>
          <div className="esim-instruction-block"><h3>Apple iOS Devices</h3><ul><li>Once complete, go to Settings &gt; Cellular (Mobile or Mobile Service).</li><li>Select the new eSIM plan under Cellular Data Plans, and set Data Roaming to ON.</li></ul></div>
          <div className="esim-instruction-block"><h3>Android Devices</h3><ul><li>Once complete, go to Settings &gt; Network and Internet.</li><li>Turn on Data Roaming.</li><li>Set the eSIM as the Mobile Data SIM.</li></ul></div>
        </section>
        <section className="card esim-tips-card" aria-labelledby="esim-tips-heading"><h2 id="esim-tips-heading">Tips &amp; Reminders</h2><ul><li>Set the eSIM plan as your cellular data plan when you arrive at your destination.</li><li>Turn off Data Roaming on your main SIM card to avoid unexpected charges.</li><li>Disable background sync to conserve your data.</li></ul></section>
      </div>
    </div>
  );
}

function UsagePanel({ esim }: { esim: Esim }) {
  if (esim.dataUsedGb === 0) {
    return (
      <section className="card esim-usage-empty" role="status">
        <span className="esim-usage-empty-icon" aria-hidden="true"><i /><b>×</b></span>
        <h2>No data usage yet</h2>
        <p>Any data usage from this eSIM will be displayed here once it starts generating traffic.</p>
      </section>
    );
  }

  const portions = [0.24, 0.21, 0.19, 0.18, 0.12, 0.06];
  return (
    <section className="card esim-usage-log-card" aria-labelledby="esim-usage-log-heading">
      <header><div><h2 id="esim-usage-log-heading">eSIM usage logs</h2><p>{esim.dataUsedGb.toFixed(2)} GB recorded on the current data plan.</p></div><StatusBadge label={displayStatus(esim)} tone={statusTone(esim.status)} /></header>
      <div className="esim-usage-overview"><span><strong>{esim.dataUsedGb.toFixed(2)} GB</strong> used of {esim.plan.allowanceGb} GB</span><ProgressBar value={esim.dataUsedGb} max={esim.plan.allowanceGb} label={`Aggregate usage for ${esim.id}`} /></div>
      <div className="esim-usage-table-wrap"><table className="esim-usage-table"><thead><tr><th scope="col">Date</th><th scope="col">Network</th><th scope="col">Country</th><th scope="col">Usage type</th><th scope="col">Volume</th></tr></thead><tbody>{portions.map((portion, index) => <tr key={index}><td data-label="Date">2026-08-{String(22 - index).padStart(2, "0")} {String(10 + index).padStart(2, "0")}:24</td><td data-label="Network">{esim.network?.operator.name ?? "Orbit partner"}</td><td data-label="Country">{esim.network?.country.name ?? esim.destination}</td><td data-label="Usage type">Mobile data</td><td data-label="Volume">{(esim.dataUsedGb * portion).toFixed(2)} GB</td></tr>)}</tbody></table></div>
    </section>
  );
}

export function EsimDetailWorkspace({ esim, tab, onTabChange, onClose, onToggleStatus, onReassign, onNotify }: EsimDetailWorkspaceProps) {
  return (
    <div className="esim-detail-workspace">
      <button className="esim-workspace-identity" type="button" onClick={onClose} aria-label="Back to eSIM inventory">
        <span className="esim-workspace-sim-icon" aria-hidden="true"><i /><i /><i /></span>
        <span><strong>{esim.id}</strong><b>{esim.iccid}</b>{esim.customer ? <em>{esim.user?.name}</em> : null}</span>
      </button>
      <Tabs ariaLabel="eSIM detail workspace" value={tab} onValueChange={(value) => onTabChange(value as EsimWorkspaceTab)} items={[
        { id: "summary", label: "Summary", icon: "▤", content: <SummaryPanel esim={esim} onToggleStatus={onToggleStatus} onReassign={onReassign} /> },
        { id: "activation", label: "Activation", icon: "⌗", content: <ActivationPanel esim={esim} onNotify={onNotify} /> },
        { id: "usage", label: "eSIM usage logs", icon: "◴", content: <UsagePanel esim={esim} /> },
      ]} />
    </div>
  );
}
