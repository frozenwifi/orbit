"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { Modal } from "@/components/ui/Modal";
import { adminSession } from "@/data/admin-session";
import type { AdminEsimDisplayStatus, AdminEsimRow } from "@/types/admin-esims";
import { downloadExcelTable } from "@/utils/export";

const columns = ["ID", "DATE ASSIGNED", "ESIM ICCID", "ESIM STATUS", "TOTAL USAGE", "CUSTOMER", "ESIM TAG"] as const;
const tabs = [
  { id: "summary", label: "Summary", icon: "summary" },
  { id: "activation", label: "Activation", icon: "activation" },
  { id: "usage", label: "eSIM usage logs", icon: "usage" },
] as const;
type DetailTab = (typeof tabs)[number]["id"];

function setQuery(router: ReturnType<typeof useRouter>, current: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(current.toString());
  Object.entries(patch).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value));
  router.push(`/admin/esims${next.size ? `?${next.toString()}` : ""}`);
}

function AdminEsimStatus({ status }: { status: AdminEsimDisplayStatus }) {
  const className = status === "Activated" ? "active" : status === "Deactivated" ? "deactivated" : "pending";
  return <span className={`admin-esim-status ${className}`}><span aria-hidden="true">{status === "Activated" ? "✓" : status === "Deactivated" ? "×" : "!"}</span>{status}</span>;
}

function AdminEsimPager({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / 9));
  const firstEntry = page === 1 ? 1 : (page - 1) * 9 + 1;
  const lastEntry = page === 1 ? Math.min(10, total) : Math.min(page * 9, total);
  return (
    <div className="admin-table-footer admin-esim-table-footer">
      <span className="admin-entries-label">Showing {firstEntry} to {lastEntry} of {total} entries</span>
      <div className="admin-pager" aria-label="eSIM table pages">
        <button className="admin-pager-button" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>‹</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button className={`admin-pager-button${page === pageNumber ? " active" : ""}`} type="button" aria-current={page === pageNumber ? "page" : undefined} key={pageNumber} onClick={() => onChange(pageNumber)}>{pageNumber}</button>)}
        <button className="admin-pager-button" type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onChange(Math.min(pageCount, page + 1))}>›</button>
      </div>
      <span />
    </div>
  );
}

interface NewEsimModalProps {
  open: boolean;
  plans: readonly { id: string; name: string }[];
  customers: readonly { id: string; firstName: string; lastName: string }[];
  onClose: () => void;
  onSave: (input: { planId: string; customerId: string; tag: string }) => void;
}

function NewEsimModal({ open, plans, customers, onClose, onSave }: NewEsimModalProps) {
  const [planId, setPlanId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [tag, setTag] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPlanId("");
    setCustomerId("");
    setTag("");
    setSubmitted(false);
  }, [open]);

  const save = () => {
    setSubmitted(true);
    if (!planId || !customerId || !tag.trim()) return;
    onSave({ planId, customerId, tag });
  };

  return (
    <Modal open={open} title="New eSIM" onClose={onClose} showClose={false} portal panelClassName="admin-esim-modal admin-new-esim-modal" layerClassName="admin-esim-modal-layer" footer={<><button className="admin-esim-modal-button secondary" type="button" onClick={onClose}>Cancel</button><button className="admin-esim-modal-button primary" type="button" onClick={save}>Save</button></>}>
      <p className="admin-esim-modal-copy">Select one of the available data plans to activate the eSIM by clicking “View Products”. {submitted ? "If desired, you can associate the eSIM with a specific customer and add any additional information related to it." : "If needed, you can assign the eSIM with a specific customer and add any additional information related to it."}</p>
      <div className="admin-esim-modal-fields">
        <label className={submitted && !planId ? "invalid" : undefined}><span>Data plan</span><div className="admin-esim-plan-control"><select aria-invalid={submitted && !planId} value={planId} onChange={(event) => setPlanId(event.target.value)}><option value="">Select data plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select><button type="button" onClick={() => document.querySelector<HTMLSelectElement>(".admin-esim-plan-control select")?.focus()}>View products</button></div>{submitted && !planId ? <small>This field can’t be left empty</small> : null}</label>
        <label className={submitted && !customerId ? "invalid" : undefined}><span>Assigned customer</span><select aria-invalid={submitted && !customerId} value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">Select assigned customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName}</option>)}</select>{submitted && !customerId ? <small>This field can’t be left empty</small> : null}</label>
        <label className={submitted && !tag.trim() ? "invalid" : undefined}><span>eSIM tag</span><input aria-invalid={submitted && !tag.trim()} value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Enter eSIM tag" />{submitted && !tag.trim() ? <small>This field can’t be left empty</small> : null}</label>
      </div>
    </Modal>
  );
}

interface ConfirmModalProps {
  kind: "remove" | "activate" | "block" | null;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmModal({ kind, onClose, onConfirm }: ConfirmModalProps) {
  const copy = kind === "remove" ? {
    title: "Are you sure you want to remove this eSIM?",
    body: <>This will IMMEDIATELY terminate the eSIM and block its data connection to the network.<br /><br />This action <strong>CANNOT BE UNDONE.</strong></>,
    confirm: "Confirm",
  } : kind === "activate" ? {
    title: "Are you sure you want to activate this eSIM?",
    body: <>Activating an eSIM will IMMEDIATELY reactivate its access to the network.</>,
    confirm: "Activate",
  } : {
    title: "Are you sure you want to block this eSIM?",
    body: <>Blocking an eSIM will IMMEDIATELY block its access to the network.</>,
    confirm: "Block",
  };
  return <Modal open={kind !== null} title={copy.title} onClose={onClose} showClose={false} portal panelClassName="admin-esim-modal admin-esim-confirm-modal" layerClassName="admin-esim-modal-layer" footer={<><button className="admin-esim-modal-button secondary" type="button" onClick={onClose}>Cancel</button><button className="admin-esim-modal-button primary" type="button" onClick={onConfirm}>{copy.confirm}</button></>}><p className="admin-esim-confirm-copy">{copy.body}</p></Modal>;
}

function AdminNetworkChart() {
  return (
    <svg className="admin-esim-network-chart" viewBox="0 0 850 290" role="img" aria-label="Monthly GiB, calls and SMS network usage">
      <g className="grid">{[34, 90, 146, 202, 258].map((y, index) => <g key={y}><line x1="52" x2="832" y1={y} y2={y} /><text x="8" y={y + 4}>{400 - index * 100}</text></g>)}</g>
      <g className="months">{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jun", "Jul", "Sept", "Oct", "Nov", "Dec"].map((month, index) => <text key={`${month}-${index}`} x={58 + index * 69} y="284">{month}</text>)}</g>
      <path className="gib" d="M56 78 C140 24 245 168 332 181 C420 194 483 75 566 82 C658 89 748 206 826 225" />
      <path className="calls" d="M56 126 C141 74 224 215 309 206 C402 196 472 47 572 55 C668 63 757 172 826 226" />
      <path className="sms" d="M56 112 C142 26 230 72 323 126 C412 178 471 153 559 99 C650 44 741 87 826 146" />
    </svg>
  );
}

function DetailStatus({ blocked }: { blocked: boolean }) {
  return <span className={`admin-esim-detail-pill ${blocked ? "blocked" : "active"}`}>{blocked ? "Blocked" : "Active"}</span>;
}

function AdminEsimSummary({ blocked, tag, editingTag, onEditTag, onSaveTag, onNetworkAction }: { blocked: boolean; tag: string; editingTag: boolean; onEditTag: () => void; onSaveTag: (value: string) => void; onNetworkAction: () => void }) {
  const [draftTag, setDraftTag] = useState(tag);
  useEffect(() => setDraftTag(tag), [tag]);
  const detailRows = [
    ["ORBIT UID", "JXGQ9Y3DUS2H", true],
    ["ICCID", "8910300000016774634", true],
    ["Assigned customer", "Jane Doe", false],
    ["Date assigned", "2024-04-04", false],
  ] as const;
  return (
    <>
      <div className="admin-esim-summary-grid">
        <section className="admin-card admin-esim-details-card" aria-labelledby="admin-esim-details-title">
          <header><h2 id="admin-esim-details-title">eSIMs details</h2><div><button className={`admin-esim-network-action ${blocked ? "reactivate" : "block"}`} type="button" onClick={onNetworkAction}>{blocked ? "Re-activate eSim" : "Block eSIM"}</button><button className="admin-esim-edit-button" type="button" aria-label="Edit eSIM tag" onClick={onEditTag}><span aria-hidden="true">✎</span></button></div></header>
          <dl>{detailRows.map(([term, value, info]) => <div key={term}><dt>{term}{info ? <span className="admin-info-dot" title={`${term} information`} aria-label={`${term} information`}>i</span> : null}</dt><dd className={term === "Assigned customer" ? "link" : undefined}>{value}</dd></div>)}
            <div><dt>eSim status<span className="admin-info-dot" title="eSIM status information" aria-label="eSIM status information">i</span></dt><dd><span className="admin-esim-detail-pill pending"><span aria-hidden="true">!</span>Awaiting activation</span></dd></div>
            <div><dt>Network status<span className="admin-info-dot" title="Network status information" aria-label="Network status information">i</span></dt><dd><DetailStatus blocked={blocked} /></dd></div>
            <div><dt>eSim tag</dt><dd>{editingTag ? <form className="admin-esim-inline-edit" onSubmit={(event) => { event.preventDefault(); onSaveTag(draftTag); }}><input aria-label="eSIM tag" autoFocus value={draftTag} onChange={(event) => setDraftTag(event.target.value)} /><button type="submit">Save</button></form> : tag}</dd></div>
          </dl>
        </section>
        <section className="admin-card admin-esim-network-card" aria-labelledby="admin-esim-network-title">
          <header><h2 id="admin-esim-network-title">Dashboard</h2><div className="admin-esim-network-controls"><span><i className="gib" />GiB</span><span><i className="calls" />Calls</span><span><i className="sms" />SMS</span><select aria-label="Chart year" defaultValue="2024"><option>2024</option></select></div></header>
          <AdminNetworkChart />
        </section>
      </div>
      <section className="admin-card admin-esim-plans-card" aria-labelledby="admin-esim-plans-title">
        <h2 id="admin-esim-plans-title">Data plans</h2>
        <div className="admin-esim-plans-scroll"><table><thead><tr>{["ID", "NAME", "STATUS", "DATA USAGE", "VALIDITY", "CREATED", "EXPIRATION"].map((heading) => <th key={heading}>{heading}<span className="admin-sort-mark" aria-hidden="true" /></th>)}</tr></thead><tbody>{Array.from({ length: 5 }, (_, index) => <tr key={index}><td>N3KTNHD8OCYY</td><td><span className="admin-plan-name">Portugal 3GB - 5 Days <span className="admin-info-dot">i</span></span></td><td><span className="admin-plan-terminated">Terminated</span></td><td><span className="admin-plan-usage">0.53 GB Used / 3 GB<span><i /></span></span></td><td>5 days</td><td>2024-04-04 22:07</td><td>2024-04-10 22:12</td></tr>)}</tbody></table></div>
        <AdminEsimPager page={1} total={12} onChange={() => undefined} />
      </section>
    </>
  );
}

function AdminEsimActivation() {
  return (
    <div className="admin-esim-activation-grid">
      <section className="admin-card admin-esim-qr-card">
        <header><h2>QR Code</h2><button type="button">Send to user</button></header>
        <img src="/assets/admin/esim-qr.png" alt="eSIM activation QR code" />
        <p>If you can’t scan the QR code, manually add a new data plan to your device with the Activation Code below.</p>
        <dl><div><dt>Activation Code</dt><dd>TN202411141105820AC7C9A</dd></div><div><dt>SM-DP Address</dt><dd>consumer.e-sim.global</dd></div></dl>
        <button className="admin-esim-help-button" type="button">Need help?</button>
      </section>
      <div className="admin-esim-instructions-stack">
        <section className="admin-card admin-esim-instructions-card"><header><h2>Activation instructions</h2><button type="button">Send to user</button></header><div className="admin-esim-instruction-list"><div><strong>QR Code Installation:</strong><p>Scan the QR code with the Camera app.</p><p>Follow the prompts on screen to add a new Data Plan.</p></div><div><strong>Apple iOS Devices:</strong><p>Once complete, go to Settings &gt; Cellular (Mobile or Mobile Service).</p><p>Select the new eSIM plan under Cellular Data Plans, and set Data Roaming to ON.</p></div><div><strong>Android Devices:</strong><p>Once complete, go to Settings &gt; Network and Internet.</p><p>Turn on Data Roaming.</p><p>Set the eSIM as the Mobile Data SIM.</p></div></div></section>
        <section className="admin-card admin-esim-tips-card"><h2>Tips &amp; Reminders</h2><ul><li>Set the eSIM plan as your cellular data plan when you arrive at your destination. Find this in Settings &gt; Cellular Data &gt; Cellular Data.</li><li>Turn off Data Roaming on your main SIM card to avoid any unexpected charges.</li><li>Disable iCloud Sync, Google Photos, or any apps that use background data, to conserve your data.</li></ul></section>
      </div>
    </div>
  );
}

function AdminEsimUsageEmpty() {
  return <section className="admin-card admin-esim-usage-empty" role="status"><span className="admin-esim-usage-empty-icon" aria-hidden="true"><i>×</i></span><h2>No data usage yet</h2><p>Any data usage from this eSIM will be displayed here once it starts generating traffic.</p></section>;
}

function AdminEsimDetail({ row, tab, blocked, editingTag, onTab, onBack, onEditTag, onSaveTag, onNetworkAction }: { row: AdminEsimRow; tab: DetailTab; blocked: boolean; editingTag: boolean; onTab: (tab: DetailTab) => void; onBack: () => void; onEditTag: () => void; onSaveTag: (tag: string) => void; onNetworkAction: () => void }) {
  return (
    <div className="admin-esim-detail-page">
      <div className="admin-esim-identity"><button type="button" onClick={onBack} aria-label="Back to eSIM list"><span className="admin-esim-sim-icon" aria-hidden="true" /></button><div><strong>JXGQ9Y3DUS2H</strong><span>8910300000016774634</span></div></div>
      <div className="admin-esim-tabs" role="tablist" aria-label="eSIM details">
        {tabs.map((item) => <button className={tab === item.id ? "active" : undefined} key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => onTab(item.id)}><span className={`admin-esim-tab-icon ${item.icon}`} aria-hidden="true" />{item.label}</button>)}
      </div>
      <div className="admin-esim-tab-panel" role="tabpanel">{tab === "summary" ? <AdminEsimSummary blocked={blocked} tag={row.tag} editingTag={editingTag} onEditTag={onEditTag} onSaveTag={onSaveTag} onNetworkAction={onNetworkAction} /> : tab === "activation" ? <AdminEsimActivation /> : <AdminEsimUsageEmpty />}</div>
      <AdminFooter />
    </div>
  );
}

function AdminEsimLoading() {
  return <div className="admin-esim-loading" role="status" aria-live="polite"><div><span aria-hidden="true" /><strong>Loading..</strong></div><AdminFooter /></div>;
}

export function AdminEsimManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { repository, createEsimForSubtenant, updateEsimStatusForSubtenant, updateEsimTagForSubtenant, removeEsimForSubtenant } = useDomain();
  const organizationId = adminSession.organizationId;
  const rows = useMemo(() => repository.resolveAdminEsimCatalog(organizationId), [repository, organizationId]);
  const plans = useMemo(() => repository.resolvePlansForSubtenant(organizationId), [repository, organizationId]);
  const customers = useMemo(() => repository.resolveCustomersForSubtenant(organizationId), [repository, organizationId]);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<"remove" | "activate" | "block" | null>(null);
  const [target, setTarget] = useState<AdminEsimRow | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingTag, setEditingTag] = useState(false);
  const selectedId = searchParams.get("esim");
  const selectedRow = rows.find((row) => row.esimId === selectedId) ?? null;
  const selectedEntity = selectedRow ? repository.getESimById(selectedRow.esimId) : null;
  const tabValue = searchParams.get("tab");
  const tab: DetailTab = tabValue === "activation" || tabValue === "usage" ? tabValue : "summary";
  const loading = searchParams.get("state") === "loading";

  useEffect(() => { if (selectedId && !selectedRow) setQuery(router, new URLSearchParams(searchParams.toString()), { esim: null, tab: null }); }, [router, searchParams, selectedId, selectedRow]);
  useEffect(() => { if (selectedId) window.scrollTo({ top: 0, behavior: "instant" }); }, [selectedId, tab]);
  useEffect(() => setPage(1), [search]);
  useEffect(() => { if (!success) return; const timeout = window.setTimeout(() => setSuccess(false), 5200); return () => window.clearTimeout(timeout); }, [success]);

  const normalized = search.trim().toLocaleLowerCase();
  const filtered = rows.filter((row) => !normalized || [row.orbitUid, row.iccid, row.customerName, row.tag, row.status].some((value) => value.toLocaleLowerCase().includes(normalized)));
  const visible = filtered.slice((page - 1) * 9, page * 9);

  const confirm = () => {
    const row = target ?? selectedRow;
    if (!row || !confirmKind) return;
    if (confirmKind === "remove") {
      removeEsimForSubtenant(organizationId, row.esimId);
      setSuccess(true);
    } else {
      updateEsimStatusForSubtenant(organizationId, row.esimId, confirmKind === "activate" ? "Active" : "Suspended");
    }
    setConfirmKind(null);
    setTarget(null);
  };

  if (loading) return <AdminEsimLoading />;

  if (selectedRow) return <><AdminEsimDetail row={selectedRow} tab={tab} blocked={selectedEntity?.status === "Suspended"} editingTag={editingTag} onTab={(nextTab) => setQuery(router, new URLSearchParams(searchParams.toString()), { tab: nextTab })} onBack={() => setQuery(router, new URLSearchParams(searchParams.toString()), { esim: null, tab: null })} onEditTag={() => setEditingTag(true)} onSaveTag={(tag) => { updateEsimTagForSubtenant(organizationId, selectedRow.esimId, tag); setEditingTag(false); }} onNetworkAction={() => setConfirmKind(selectedEntity?.status === "Suspended" ? "activate" : "block")} /><ConfirmModal kind={confirmKind} onClose={() => setConfirmKind(null)} onConfirm={confirm} /></>;

  return (
    <div className="admin-esims-page">
      <div className="admin-esims-heading"><h1>eSIMs</h1><button className="admin-esim-add-button" type="button" onClick={() => setNewOpen(true)}>Add eSIM</button></div>
      <section className="admin-card admin-esim-list-card" aria-label="eSIM management">
        <div className="admin-esim-toolbar"><form role="search" onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch); }}><label className="sr-only" htmlFor="admin-esim-search">Search eSIMs</label><input id="admin-esim-search" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search" /><button type="submit" aria-label="Search"><span className="admin-esim-search-icon" aria-hidden="true" /></button></form><button className="admin-export-button" type="button" onClick={() => downloadExcelTable("orbit-admin-esims.xls", columns, filtered.map((row) => [row.orbitUid, row.dateAssigned, row.iccid, row.status, row.totalUsage, row.customerName, row.tag]))}><span className="admin-export-icon" aria-hidden="true" />Export excel</button></div>
        {visible.length ? <><div className="admin-esim-table-scroll"><table className="admin-esim-table"><thead><tr>{columns.map((column) => <th key={column}>{column}<span className="admin-sort-mark" aria-hidden="true" /></th>)}<th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map((row) => <tr key={row.rowId}><td data-label="ID">{row.orbitUid}</td><td data-label="Date assigned">{row.dateAssigned}</td><td data-label="eSIM ICCID"><button className="admin-esim-link" type="button" onClick={() => setQuery(router, new URLSearchParams(searchParams.toString()), { esim: row.esimId, tab: "summary" })}>{row.iccid}</button></td><td data-label="eSIM status"><AdminEsimStatus status={row.status} /></td><td data-label="Total usage">{row.totalUsage}</td><td data-label="Customer"><button className="admin-esim-link" type="button">{row.customerName}</button></td><td data-label="eSIM tag">{row.tag}</td><td data-label="Actions"><button className="admin-esim-remove-button" type="button" aria-label={`Remove eSIM ${row.orbitUid}`} onClick={() => { setTarget(row); setConfirmKind("remove"); }}><span aria-hidden="true" /></button></td></tr>)}</tbody></table></div><AdminEsimPager page={page} total={filtered.length} onChange={setPage} /></> : <div className="admin-esim-no-results" role="status"><span className="admin-esim-usage-empty-icon" aria-hidden="true"><i>×</i></span><h2>No eSIMs found</h2><p>Try a different search term.</p></div>}
      </section>
      <AdminFooter />
      {success ? <div className="admin-esim-success" role="status"><span aria-hidden="true">✓</span><p>eSIM has been successfully deleted. Its data connection to the network is now blocked.</p></div> : null}
      <NewEsimModal open={newOpen} plans={plans} customers={customers} onClose={() => setNewOpen(false)} onSave={(input) => { const plan = plans.find((item) => item.id === input.planId); if (!plan) return; createEsimForSubtenant(organizationId, { label: input.tag, customerId: input.customerId, planId: input.planId, destination: plan.destination, activateNow: false }); setNewOpen(false); }} />
      <ConfirmModal kind={confirmKind} onClose={() => { setConfirmKind(null); setTarget(null); }} onConfirm={confirm} />
    </div>
  );
}
