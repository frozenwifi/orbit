"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { Modal } from "@/components/ui/Modal";
import { adminSession } from "@/data/admin-session";
import type { AdminCustomerEsimRow, AdminCustomerInput, AdminCustomerRow, AdminExpensePoint } from "@/types/admin-customers";
import type { Country } from "@/types/domain";
import { downloadExcelTable } from "@/utils/export";

const listColumns = ["ID", "CUSTOMER", "PHONE NUMBER", "NOTES", "COUNTRY", "ACTIVE ESIMS"] as const;
const esimColumns = ["ID", "ESIM ICCID", "ESIM STATUS", "TOTAL USAGE", "ESIM TAG"] as const;

function setCustomerQuery(router: ReturnType<typeof useRouter>, current: URLSearchParams, customerId: string | null) {
  const next = new URLSearchParams(current.toString());
  if (customerId) next.set("customer", customerId); else next.delete("customer");
  router.push(`/admin/customers${next.size ? `?${next.toString()}` : ""}`);
}

function ActionButton({ kind, label, onClick }: { kind: "edit" | "delete"; label: string; onClick: () => void }) {
  return <button className={`admin-customer-action ${kind}`} type="button" aria-label={label} onClick={onClick}><span aria-hidden="true" /></button>;
}

function CustomerPager({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / 9));
  const first = total ? (page - 1) * 9 + 1 : 0;
  const last = page === 1 ? Math.min(10, total) : Math.min(page * 9, total);
  return (
    <div className="admin-table-footer admin-customer-table-footer">
      <span className="admin-entries-label">Showing {first} to {last} of {total} entries</span>
      <div className="admin-pager" aria-label="Customer table pages">
        <button className="admin-pager-button" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>‹</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={`admin-pager-button${page === number ? " active" : ""}`} type="button" aria-current={page === number ? "page" : undefined} key={number} onClick={() => onChange(number)}>{number}</button>)}
        <button className="admin-pager-button" type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onChange(Math.min(pageCount, page + 1))}>›</button>
      </div>
      <span />
    </div>
  );
}

interface CustomerFormModalProps {
  open: boolean;
  customer: AdminCustomerRow | null;
  countries: readonly Country[];
  onClose: () => void;
  onSave: (input: AdminCustomerInput) => void;
}

function CustomerFormModal({ open, customer, countries, onClose, onSave }: CustomerFormModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryId, setCountryId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(customer?.name ?? "");
    setPhone(customer?.phone ?? "");
    setCountryId(customer ? countries.find((country) => country.name === customer.country)?.id ?? "" : "");
    setNotes(customer?.notes === "—" ? "" : customer?.notes ?? "");
    setSubmitted(false);
  }, [countries, customer, open]);

  const save = () => {
    setSubmitted(true);
    if (!name.trim() || !phone.trim() || !countryId) return;
    onSave({ name, phone, countryId, notes });
  };

  return (
    <Modal open={open} title={customer ? "Edit customer" : "New customer"} onClose={onClose} showClose={false} portal initialFocus="panel" panelClassName="admin-customer-modal admin-customer-form-modal" layerClassName="admin-customer-modal-layer" footer={<><button className="admin-customer-modal-button secondary" type="button" onClick={onClose}>Cancel</button><button className="admin-customer-modal-button primary" type="button" onClick={save}>Save</button></>}>
      <div className="admin-customer-modal-fields">
        <label className={submitted && !name.trim() ? "invalid" : undefined}><span>Name</span><input autoComplete="name" aria-invalid={submitted && !name.trim()} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter customer's name" />{submitted && !name.trim() ? <small>This field can’t be left empty</small> : null}</label>
        <label className={submitted && !phone.trim() ? "invalid" : undefined}><span>Phone number</span><input autoComplete="tel" aria-invalid={submitted && !phone.trim()} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter customer's phone number" />{submitted && !phone.trim() ? <small>This field can’t be left empty</small> : null}</label>
        <label className={submitted && !countryId ? "invalid" : undefined}><span>Country</span><select aria-invalid={submitted && !countryId} value={countryId} onChange={(event) => setCountryId(event.target.value)}><option value="">Select customer's country</option>{countries.map((country) => <option value={country.id} key={country.id}>{country.name}</option>)}</select>{submitted && !countryId ? <small>This field can’t be left empty</small> : null}</label>
        <label><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Enter your notes here" /></label>
      </div>
    </Modal>
  );
}

function DeleteCustomerModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} title="Are you sure you want to delete this Customer?" onClose={onClose} showClose={false} portal initialFocus="panel" panelClassName="admin-customer-modal admin-customer-delete-modal" layerClassName="admin-customer-modal-layer" footer={<><button className="admin-customer-modal-button secondary" type="button" onClick={onClose}>Cancel</button><button className="admin-customer-modal-button primary" type="button" onClick={onConfirm}>Confirm</button></>}>
      <p className="admin-customer-delete-copy">This will <strong>PERMANENTLY DELETE</strong> the customer data from your Orbit database. Any resources assigned to the customer will be reassigned to the root account.</p>
    </Modal>
  );
}

function CustomerNotice() {
  return (
    <section className="admin-card admin-customer-notice" aria-label="Customer data information">
      <span className="admin-customer-notice-icon" aria-hidden="true"><i>✓</i></span>
      <div><strong>This feature is intended for your convenience only. When you add a Customer to Orbit, please note:</strong><ul><li>It is for record-keeping only. The customer will <b>not have access</b> to your account.</li><li>We will <b>never</b> contact the Customer, neither directly nor on your behalf, and they cannot log in to the Orbit Platform.</li><li>Customer data is associated with <b>your Orbit instance only.</b></li></ul></div>
    </section>
  );
}

function EsimStatus({ status }: { status: AdminCustomerEsimRow["status"] }) {
  const tone = status === "Activated" ? "active" : status === "Deactivated" ? "deactivated" : "pending";
  return <span className={`admin-customer-esim-status ${tone}`}><span aria-hidden="true">{status === "Activated" ? "✓" : status === "Deactivated" ? "×" : "!"}</span>{status}</span>;
}

function ExpenseChart({ points }: { points: readonly AdminExpensePoint[] }) {
  const width = 1300;
  const height = 270;
  const left = 48;
  const top = 22;
  const bottom = 38;
  const chartHeight = height - top - bottom;
  const step = (width - left - 15) / (points.length - 1);
  const coordinates = points.map((point, index) => ({ x: left + index * step, y: top + (5000 - point.value) / 3000 * chartHeight }));
  const line = coordinates.reduce((path, point, index) => {
    if (!index) return `M${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    const previous = coordinates[index - 1];
    const before = coordinates[index - 2] ?? previous;
    const after = coordinates[index + 1] ?? point;
    const controlOne = { x: previous.x + (point.x - before.x) / 6, y: previous.y + (point.y - before.y) / 6 };
    const controlTwo = { x: point.x - (after.x - previous.x) / 6, y: point.y - (after.y - previous.y) / 6 };
    return `${path} C${controlOne.x.toFixed(1)},${controlOne.y.toFixed(1)} ${controlTwo.x.toFixed(1)},${controlTwo.y.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }, "");
  const area = `${line} L${coordinates.at(-1)?.x ?? left},${height - bottom} L${left},${height - bottom} Z`;
  return (
    <svg className="admin-customer-expense-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Customer expenses from December 29 to January 9">
      <defs><linearGradient id="admin-customer-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".44" /><stop offset="1" stopColor="currentColor" stopOpacity=".02" /></linearGradient></defs>
      {[2000, 3000, 4000, 5000].map((tick) => { const y = top + (5000 - tick) / 3000 * chartHeight; return <g className="grid" key={tick}><text x="0" y={y + 4}>{tick}</text><line x1={left} x2={width} y1={y} y2={y} /></g>; })}
      <path className="area" d={area} /><path className="line" d={line} />
      {coordinates.map((point, index) => <g className="point" key={points[index].label}>{index === 4 ? <line className="marker-line" x1={point.x} x2={point.x} y1={point.y + 8} y2={height - bottom} /> : null}<circle cx={point.x} cy={point.y} r={index === 4 ? 6 : 0} /><text x={point.x} y={height - 7} textAnchor="middle">{points[index].label}</text></g>)}
    </svg>
  );
}

interface CustomerDetailProps {
  row: AdminCustomerRow;
  esims: readonly AdminCustomerEsimRow[];
  expenses: readonly AdminExpensePoint[];
  onEdit: () => void;
  onDelete: () => void;
  onOpenEsim: (id: string) => void;
  onRemoveEsim: (id: string) => void;
}

function CustomerDetail({ row, esims, expenses, onEdit, onDelete, onOpenEsim, onRemoveEsim }: CustomerDetailProps) {
  const details = [["ID", row.displayId], ["Customer", row.name], ["Phone number", row.phone], ["Country", row.country], ["Active eSIMs", String(esims.length)], ["Notes", row.notes]] as const;
  return (
    <div className="admin-customer-detail-page">
      <h1>{row.name}</h1>
      <div className="admin-customer-detail-grid">
        <section className="admin-card admin-customer-details-card">
          <header><h2>Customer details</h2><div><ActionButton kind="edit" label={`Edit ${row.name}`} onClick={onEdit} /><ActionButton kind="delete" label={`Delete ${row.name}`} onClick={onDelete} /></div></header>
          <dl>{details.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
        </section>
        <section className="admin-card admin-customer-esims-card">
          <header><h2>Customer&apos;s eSIMs</h2><button className="admin-export-button" type="button" onClick={() => downloadExcelTable("orbit-admin-customer-esims.xls", esimColumns, esims.map((esim) => [esim.orbitUid, esim.iccid, esim.status, esim.totalUsage, esim.tag]))}><span className="admin-export-icon" aria-hidden="true" />Export excel</button></header>
          {esims.length ? <div className="admin-customer-esims-scroll"><table><thead><tr>{esimColumns.map((column) => <th key={column}>{column}<span className="admin-sort-mark" aria-hidden="true" /></th>)}<th><span className="sr-only">Actions</span></th></tr></thead><tbody>{esims.map((esim) => <tr key={esim.rowId}><td>{esim.orbitUid}</td><td><button className="admin-customer-link" type="button" onClick={() => onOpenEsim(esim.esimId)}>{esim.iccid}</button></td><td><EsimStatus status={esim.status} /></td><td>{esim.totalUsage}</td><td>{esim.tag}</td><td><button className="admin-customer-esim-remove" type="button" aria-label={`Remove eSIM ${esim.orbitUid} from customer`} onClick={() => onRemoveEsim(esim.esimId)}><span aria-hidden="true" /></button></td></tr>)}</tbody></table></div> : <div className="admin-customer-detail-empty" role="status">No eSIMs assigned to this customer.</div>}
        </section>
      </div>
      <section className="admin-card admin-customer-expenses-card">
        <header><h2>User&apos;s expenses</h2><div><label className="admin-customer-date-button"><span className="admin-calendar-icon" aria-hidden="true" /><select aria-label="Expenses date range" defaultValue="week"><option value="week">Dec 29, 2024 - Jan 4, 2025</option></select><span className="admin-down-chevron" aria-hidden="true" /></label><button className="admin-export-button" type="button" onClick={() => downloadExcelTable("orbit-admin-customer-expenses.xls", ["DATE", "EXPENSE"], expenses.map((point) => [point.label, point.value]))}><span className="admin-export-icon" aria-hidden="true" />Export excel</button></div></header>
        <ExpenseChart points={expenses} />
      </section>
      <AdminFooter />
    </div>
  );
}

export function AdminCustomerManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { repository, countries, createCustomerForSubtenant, updateCustomerForSubtenant, deleteCustomerForSubtenant, removeEsimForSubtenant } = useDomain();
  const organizationId = adminSession.organizationId;
  const rows = useMemo(() => repository.resolveAdminCustomerCatalog(organizationId), [repository, organizationId]);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCustomerRow | null>(null);
  const [deleting, setDeleting] = useState<AdminCustomerRow | null>(null);
  const [success, setSuccess] = useState(false);
  const selectedId = searchParams.get("customer");
  const selectedRow = selectedId ? rows.find((row) => row.customerId === selectedId) ?? null : null;
  const detailEsims = useMemo(() => selectedRow ? repository.resolveAdminCustomerEsims(organizationId, selectedRow.customerId) : [], [organizationId, repository, selectedRow]);
  const expenses = useMemo(() => selectedRow ? repository.resolveAdminCustomerExpenses(organizationId, selectedRow.customerId) : [], [organizationId, repository, selectedRow]);

  useEffect(() => { if (selectedId && !selectedRow) setCustomerQuery(router, new URLSearchParams(searchParams.toString()), null); }, [router, searchParams, selectedId, selectedRow]);
  useEffect(() => { if (selectedId) window.scrollTo({ top: 0, behavior: "instant" }); }, [selectedId]);
  useEffect(() => setPage(1), [search]);
  useEffect(() => { if (!success) return; const timeout = window.setTimeout(() => setSuccess(false), 5200); return () => window.clearTimeout(timeout); }, [success]);

  const normalized = search.trim().toLocaleLowerCase();
  const filtered = rows.filter((row) => !normalized || [row.displayId, row.name, row.phone, row.notes, row.country, String(row.activeEsims)].some((value) => value.toLocaleLowerCase().includes(normalized)));
  const visible = filtered.slice((page - 1) * 9, page * 9);

  const openEdit = (row: AdminCustomerRow) => { setEditing(row); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const save = (input: AdminCustomerInput) => {
    if (editing) updateCustomerForSubtenant(organizationId, editing.customerId, input); else createCustomerForSubtenant(organizationId, input);
    closeForm();
  };
  const confirmDelete = () => {
    if (!deleting) return;
    const wasSelected = selectedId === deleting.customerId;
    deleteCustomerForSubtenant(organizationId, deleting.customerId);
    setDeleting(null);
    setSuccess(true);
    if (wasSelected) setCustomerQuery(router, new URLSearchParams(searchParams.toString()), null);
  };

  if (selectedRow) return <><CustomerDetail row={selectedRow} esims={detailEsims} expenses={expenses} onEdit={() => openEdit(selectedRow)} onDelete={() => setDeleting(selectedRow)} onOpenEsim={(id) => router.push(`/admin/esims?esim=${encodeURIComponent(id)}&tab=summary`)} onRemoveEsim={(id) => removeEsimForSubtenant(organizationId, id)} /><CustomerFormModal open={formOpen} customer={editing} countries={countries} onClose={closeForm} onSave={save} /><DeleteCustomerModal open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={confirmDelete} /></>;

  return (
    <div className="admin-customers-page">
      <div className="admin-customers-heading"><h1>Customers</h1><button className="admin-customer-add-button" type="button" onClick={() => { setEditing(null); setFormOpen(true); }}>Add customer</button></div>
      <CustomerNotice />
      <section className="admin-card admin-customer-list-card" aria-label="Customer management">
        <div className="admin-customer-toolbar"><form role="search" onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch); }}><label className="sr-only" htmlFor="admin-customer-search">Search customers</label><input id="admin-customer-search" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search" /><button type="submit" aria-label="Search"><span className="admin-customer-search-icon" aria-hidden="true" /></button></form><button className="admin-export-button" type="button" onClick={() => downloadExcelTable("orbit-admin-customers.xls", listColumns, filtered.map((row) => [row.displayId, row.name, row.phone, row.notes, row.country, row.activeEsims]))}><span className="admin-export-icon" aria-hidden="true" />Export excel</button></div>
        {visible.length ? <><div className="admin-customer-table-scroll"><table className="admin-customer-table"><thead><tr>{listColumns.map((column) => <th key={column}>{column}<span className="admin-sort-mark" aria-hidden="true" /></th>)}<th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map((row) => <tr key={row.rowId}><td>{row.displayId}</td><td><button className="admin-customer-link" type="button" onClick={() => setCustomerQuery(router, new URLSearchParams(searchParams.toString()), row.customerId)}>{row.name}</button></td><td>{row.phone}</td><td title={row.notes}>{row.notes}</td><td>{row.country}</td><td>{row.activeEsims}</td><td><div className="admin-customer-row-actions"><ActionButton kind="edit" label={`Edit ${row.name}`} onClick={() => openEdit(row)} /><ActionButton kind="delete" label={`Delete ${row.name}`} onClick={() => setDeleting(row)} /></div></td></tr>)}</tbody></table></div><CustomerPager page={page} total={filtered.length} onChange={setPage} /></> : <div className="admin-customer-no-results" role="status"><h2>No customers found</h2><p>Try a different search term.</p></div>}
      </section>
      <AdminFooter />
      {success ? <div className="admin-customer-success" role="status"><span aria-hidden="true">✓</span><p>The customer has been successfully deleted.</p></div> : null}
      <CustomerFormModal open={formOpen} customer={editing} countries={countries} onClose={closeForm} onSave={save} />
      <DeleteCustomerModal open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
    </div>
  );
}
