"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ExportIcon } from "@/components/api-keys/ApiKeyIcons";
import { OrbitFooter } from "@/components/dashboard/OrbitFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { SubtenantActionConfirmation, SubtenantFormModal } from "@/components/subtenants/SubtenantModals";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import type { NewSubtenantInput } from "@/types/domain";
import { downloadExcelTable } from "@/utils/export";

const PAGE_SIZE = 5;
const sortGlyph = <span className="subtenant-sort" aria-hidden="true">⌃<i>⌄</i></span>;
const dateLabel = (value: string) => value === "—" ? "2024-04-04 20:03" : `${value} 20:03`;

function DetailTableFooter({ page, total, label, onPageChange }: { page: number; total: number; label: string; onPageChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, total);
  return <footer className="subtenant-detail-table-footer"><span>Showing {start} to {end} of {total} entries</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel={label} /></footer>;
}

export function SubtenantDetailWorkspace({ subtenantId }: { subtenantId: string }) {
  const router = useRouter();
  const { subtenants, customers, influencers, repository, updateSubtenant, setSubtenantStatus, deleteSubtenant } = useDomain();
  const subtenant = subtenants.find((entry) => entry.id === subtenantId);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"block" | "unblock" | "delete" | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const [influencersPage, setInfluencersPage] = useState(1);

  const relatedCustomers = useMemo(() => customers.filter((customer) => customer.subtenantId === subtenantId), [customers, subtenantId]);
  const relatedEsims = useMemo(() => repository.getESimsForSubtenant(subtenantId), [repository, subtenantId]);
  const relatedInfluencers = useMemo(() => influencers.filter((influencer) => influencer.subtenantId === subtenantId), [influencers, subtenantId]);

  if (!subtenant) return <div className="subtenant-page subtenant-missing"><h1>Subtenant not found</h1><Link className="subtenant-view-more" href="/subtenants/brand-vno">Back to Brand-VNO</Link><OrbitFooter /></div>;

  const orderRows = relatedEsims.slice((ordersPage - 1) * PAGE_SIZE, ordersPage * PAGE_SIZE);
  const customerRows = relatedCustomers.slice((customersPage - 1) * PAGE_SIZE, customersPage * PAGE_SIZE);
  const influencerRows = relatedInfluencers.slice((influencersPage - 1) * PAGE_SIZE, influencersPage * PAGE_SIZE);
  const saveEdit = (input: NewSubtenantInput) => { updateSubtenant(subtenant.id, input); setEditOpen(false); };
  const confirm = () => {
    if (confirmAction === "delete") { deleteSubtenant(subtenant.id); router.push("/subtenants/brand-vno"); return; }
    if (confirmAction) setSubtenantStatus(subtenant.id, confirmAction === "block" ? "Blocked" : "Active");
    setConfirmAction(null);
  };
  const exportCustomers = () => downloadExcelTable(`${subtenant.name.toLocaleLowerCase()}-customers.xls`, ["CUSTOMER", "COUNTRY", "ACTIVE ESIMS", "STATUS"], relatedCustomers.map((customer) => [`${customer.firstName} ${customer.lastName}`, customer.country, repository.getESimsForCustomer(customer.id).filter((esim) => esim.status === "Active").length, customer.status]));
  const exportInfluencers = () => downloadExcelTable(`${subtenant.name.toLocaleLowerCase()}-influencers.xls`, ["INFLUENCER NAME", "AFFILIATE LINK", "CLICKS", "CONVERSION", "REGISTRATION FEE", "TOTAL EARNINGS"], relatedInfluencers.map((influencer) => [influencer.name, influencer.affiliateLink, influencer.clicks, `${influencer.conversionRate}%`, `£${influencer.registrationFee}`, `£${influencer.totalEarnings}`]));

  return <div className="subtenant-page subtenant-detail-page">
    <header className="subtenant-brand-header"><span className="vodafone-mark" aria-hidden="true">V</span><h1>{subtenant.name}</h1>{subtenant.status === "Blocked" ? <span className="subtenant-blocked-pill">Blocked</span> : null}</header>
    <div className="subtenant-detail-top-grid">
      <section className="card subtenant-details-card"><header><h2>Subtenant details</h2><button className="subtenant-edit-button" type="button" aria-label={`Edit ${subtenant.name}`} onClick={() => setEditOpen(true)}>✎</button></header><dl><div><dt>Subtenant name</dt><dd>{subtenant.name}</dd></div><div><dt>Balance</dt><dd>£{subtenant.balance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</dd></div><div><dt>Billing address</dt><dd>{subtenant.billingAddress}</dd></div><div><dt>Email</dt><dd>{subtenant.email}</dd></div><div><dt>Tax ID</dt><dd>{subtenant.taxId}</dd></div><div><dt>Subtenant type</dt><dd>{subtenant.type}</dd></div><div><dt>Pricing category</dt><dd>{subtenant.pricingCategory}</dd></div></dl><footer><Button className="subtenant-danger-outline" onClick={() => setConfirmAction(subtenant.status === "Blocked" ? "unblock" : "block")}>{subtenant.status === "Blocked" ? "Unblock subtenant" : "Block subtenant"}</Button><Button className="subtenant-delete-button" variant="danger" onClick={() => setConfirmAction("delete")}>Delete subtenant</Button></footer></section>
      <section className="card subtenant-detail-card recent-orders-card"><header><h2>Recent orders</h2><button className="subtenant-date-button" type="button"><span aria-hidden="true">▣</span> Dec 28, 2024 - Jun 4, 2025 <i aria-hidden="true">⌄</i></button></header><div className="subtenant-table-wrap"><table className="subtenant-detail-table"><thead><tr><th>Date{sortGlyph}</th><th>ICCID{sortGlyph}</th><th>Status{sortGlyph}</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{orderRows.map((esim) => <tr key={esim.id}><td data-label="Date">{dateLabel(esim.activationDate)}</td><td data-label="ICCID"><Link href={`/esims?esim=${esim.id}`}>{esim.iccid}</Link></td><td data-label="Status"><span className={`subtenant-order-status ${esim.status === "Suspended" ? "canceled" : "paid"}`}><i />{esim.status === "Suspended" ? "Canceled" : "Paid"}</span></td><td data-label="Actions"><Link className="subtenant-view-more" href={`/esims?esim=${esim.id}`}>View more</Link></td></tr>)}</tbody></table></div>{!orderRows.length ? <p className="subtenant-inline-empty">No recent orders</p> : <DetailTableFooter page={ordersPage} total={relatedEsims.length} label="Recent order pages" onPageChange={setOrdersPage} />}</section>
    </div>
    <section className="card subtenant-detail-card subtenant-customers-card"><header><h2>Customers</h2><Button className="subtenant-export-button" onClick={exportCustomers}><ExportIcon />Export excel</Button></header><div className="subtenant-table-wrap"><table className="subtenant-detail-table"><thead><tr><th>Customer{sortGlyph}</th><th>Country{sortGlyph}</th><th>Active eSIMs{sortGlyph}</th><th>Status{sortGlyph}</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{customerRows.map((customer) => <tr key={customer.id}><td data-label="Customer"><Link href={`/customers?customer=${customer.id}`}>{customer.firstName} {customer.lastName}</Link></td><td data-label="Country">{customer.country}</td><td data-label="Active eSIMs"><Link href={`/esims?customer=${customer.id}`}>{repository.getESimsForCustomer(customer.id).filter((esim) => esim.status === "Active").length}</Link></td><td data-label="Status"><span className={`subtenant-order-status ${customer.status === "Active" ? "paid" : "canceled"}`}><i />{customer.status}</span></td><td data-label="Actions"><Link className="subtenant-view-more" href={`/customers?customer=${customer.id}`}>View more</Link></td></tr>)}</tbody></table></div>{!customerRows.length ? <p className="subtenant-inline-empty">No customers assigned</p> : <DetailTableFooter page={customersPage} total={relatedCustomers.length} label="Customer pages" onPageChange={setCustomersPage} />}</section>
    <section className="card subtenant-detail-card subtenant-influencers-card"><header><h2>Influencers</h2><Button className="subtenant-export-button" onClick={exportInfluencers}><ExportIcon />Export excel</Button></header><div className="subtenant-table-wrap"><table className="subtenant-detail-table influencer-table"><thead><tr><th>Influencer name{sortGlyph}</th><th>Affiliate link{sortGlyph}</th><th>Clicks{sortGlyph}</th><th>Conversion{sortGlyph}</th><th>Registration fee{sortGlyph}</th><th>Total earnings{sortGlyph}</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{influencerRows.map((influencer) => <tr key={influencer.id}><td data-label="Influencer name">{influencer.name}</td><td data-label="Affiliate link">{influencer.affiliateLink}</td><td data-label="Clicks">{influencer.clicks}</td><td data-label="Conversion">{influencer.conversionRate}%</td><td data-label="Registration fee">£{influencer.registrationFee}</td><td data-label="Total earnings">£{influencer.totalEarnings.toLocaleString("en-GB")}</td><td data-label="Actions"><Link className="subtenant-view-more" href="/subtenants/influencers">View more</Link></td></tr>)}</tbody></table></div>{!influencerRows.length ? <p className="subtenant-inline-empty">No influencers assigned</p> : <DetailTableFooter page={influencersPage} total={relatedInfluencers.length} label="Influencer pages" onPageChange={setInfluencersPage} />}</section>
    <OrbitFooter />
    <SubtenantFormModal open={editOpen} kind="brand-vno" initial={subtenant} onClose={() => setEditOpen(false)} onSave={saveEdit} />
    <SubtenantActionConfirmation open={Boolean(confirmAction)} name={subtenant.name} action={confirmAction ?? "block"} onClose={() => setConfirmAction(null)} onConfirm={confirm} />
  </div>;
}
