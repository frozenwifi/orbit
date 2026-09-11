"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExportIcon } from "@/components/api-keys/ApiKeyIcons";
import { OrbitFooter } from "@/components/dashboard/OrbitFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { InfluencerFormModal, SubtenantFormModal, SubtenantSuccessModal } from "@/components/subtenants/SubtenantModals";
import { Button } from "@/components/ui/Button";
import { CatalogToolbar } from "@/components/ui/CatalogToolbar";
import { CollectionState } from "@/components/ui/CollectionState";
import { Pagination } from "@/components/ui/Pagination";
import type { NewInfluencerInput, NewSubtenantInput, SubtenantKind } from "@/types/domain";
import { downloadExcelTable } from "@/utils/export";

type CatalogKind = SubtenantKind | "influencers";
const PAGE_SIZE = 9;

const money = (value: number) => `£${value.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const sortGlyph = <span className="subtenant-sort" aria-hidden="true">⌃<i>⌄</i></span>;

function TableFooter({ page, count, onPageChange }: { page: number; count: number; onPageChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const start = count ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, count);
  return <footer className="subtenant-table-footer"><span>Showing {start} to {end} of {count} entries</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="Subtenant table pages" /></footer>;
}

export function SubtenantCatalog({ kind }: { kind: CatalogKind }) {
  const { subtenants, influencers, repository, createSubtenant, createInfluencer } = useDomain();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 220); return () => window.clearTimeout(timer); }, []);
  useEffect(() => setPage(1), [query, kind]);

  const title = kind === "brand-vno" ? "Brand-VNO" : kind === "business-roaming" ? "Business roaming" : "Influencers";
  const addLabel = kind === "brand-vno" ? "Add subtenant" : kind === "business-roaming" ? "Add business roaming" : "Add influencer";
  const normalized = query.trim().toLocaleLowerCase();
  const filteredSubtenants = useMemo(() => subtenants.filter((subtenant) => subtenant.kind === kind && (!normalized || `${subtenant.name} ${subtenant.type}`.toLocaleLowerCase().includes(normalized))), [kind, normalized, subtenants]);
  const filteredInfluencers = useMemo(() => influencers.filter((influencer) => !normalized || `${influencer.name} ${influencer.email} ${influencer.affiliateLink}`.toLocaleLowerCase().includes(normalized)), [influencers, normalized]);
  const count = kind === "influencers" ? filteredInfluencers.length : filteredSubtenants.length;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(count / PAGE_SIZE)));
  const visibleSubtenants = filteredSubtenants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const visibleInfluencers = filteredInfluencers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportRows = () => {
    if (kind === "brand-vno") downloadExcelTable("orbit-brand-vno.xls", ["BRAND-VNO NAME", "NUMBER OF CLIENTS", "NUMBER OF ESIMS", "% OF SALES TARGET"], filteredSubtenants.map((subtenant) => [subtenant.name, repository.getCustomersForSubtenant(subtenant.id).length, repository.getESimsForSubtenant(subtenant.id).length, `${subtenant.salesTargetPercent}%`]));
    else if (kind === "business-roaming") downloadExcelTable("orbit-business-roaming.xls", ["COMPANY NAME", "COMPANY TYPE", "NUMBER OF ESIMS", "NUMBER OF ACTIVE ESIMS"], filteredSubtenants.map((subtenant) => { const esims = repository.getESimsForSubtenant(subtenant.id); return [subtenant.name, subtenant.type, esims.length, esims.filter((esim) => esim.status === "Active").length]; }));
    else downloadExcelTable("orbit-influencers.xls", ["INFLUENCER NAME", "AFFILIATE LINK", "CLICKS", "CONVERSION", "REGISTRATION FEE", "TOTAL EARNINGS"], filteredInfluencers.map((influencer) => [influencer.name, influencer.affiliateLink, influencer.clicks, `${influencer.conversionRate}%`, money(influencer.registrationFee), money(influencer.totalEarnings)]));
  };

  const saveSubtenant = (input: NewSubtenantInput) => { createSubtenant(input); setFormOpen(false); setQuery(""); setPage(1); setSuccessOpen(true); };
  const saveInfluencer = (input: NewInfluencerInput) => { createInfluencer(input); setFormOpen(false); setQuery(""); setPage(1); setSuccessOpen(true); };

  return <div className="subtenant-page">
    <header className="subtenant-page-header"><h1>{title}</h1><Button className="subtenant-add-button" variant="primary" onClick={() => setFormOpen(true)}>{addLabel}</Button></header>
    <section className="card subtenant-list-card" aria-label={title}>
      <CatalogToolbar className="subtenant-toolbar" query={query} onQueryChange={setQuery} onSearch={() => setPage(1)} onExport={exportRows} entityLabel={title} exportIcon={<ExportIcon className="api-export-icon" />} />
      {loading ? <CollectionState kind="loading" entityLabel={title} /> : count === 0 ? <CollectionState kind="empty" entityLabel={title} title="No matching entries" message="No entries match this search." actionLabel="Clear search" onAction={() => setQuery("")} /> : kind === "brand-vno" ? <>
        <div className="subtenant-table-wrap"><table className="subtenant-table brand-vno-table"><thead><tr><th>Brand-VNO name{sortGlyph}</th><th>Number of clients{sortGlyph}</th><th>Number of eSIMs{sortGlyph}</th><th>% of sales target{sortGlyph}</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleSubtenants.map((subtenant) => {
          const customers = repository.getCustomersForSubtenant(subtenant.id).length;
          const esims = repository.getESimsForSubtenant(subtenant.id).length;
          return <tr key={subtenant.id}><td data-label="Brand-VNO name">{subtenant.name}</td><td data-label="Number of clients"><span>{customers}</span><small className={subtenant.monthlyClientChange < 0 ? "negative" : "positive"}>{subtenant.monthlyClientChange < 0 ? "↘" : "↗"} {Math.abs(subtenant.monthlyClientChange)} clients <i>(monthly)</i></small></td><td data-label="Number of eSIMs"><span>{esims}</span><small className={subtenant.monthlyEsimChange < 0 ? "negative" : "positive"}>↗ {Math.abs(subtenant.monthlyEsimChange)} clients <i>(monthly)</i></small></td><td data-label="% of sales target"><span>{subtenant.salesTargetPercent}%</span><small className="positive">↗ +4% <i>(monthly)</i></small></td><td data-label="Actions"><Link className="subtenant-view-more" href={`/subtenants/brand-vno/${subtenant.id}`}>View more</Link></td></tr>;
        })}</tbody></table></div><TableFooter page={currentPage} count={count} onPageChange={setPage} /></> : kind === "business-roaming" ? <>
        <div className="subtenant-table-wrap"><table className="subtenant-table business-table"><thead><tr><th>Company name{sortGlyph}</th><th>Company type{sortGlyph}</th><th>Number of eSIMs{sortGlyph}</th><th>Number of active eSIMs{sortGlyph}</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleSubtenants.map((subtenant) => { const esims = repository.getESimsForSubtenant(subtenant.id); return <tr key={subtenant.id}><td data-label="Company name">{subtenant.name}</td><td data-label="Company type">{subtenant.type}</td><td data-label="Number of eSIMs">{esims.length}</td><td data-label="Number of active eSIMs">{esims.filter((esim) => esim.status === "Active").length}</td><td data-label="Actions"><button className="subtenant-view-more" type="button" onClick={() => showToast(`${subtenant.name} business roaming details are ready for a future Figma phase.`)}>View more</button></td></tr>; })}</tbody></table></div><TableFooter page={currentPage} count={count} onPageChange={setPage} /></> : <>
        <div className="subtenant-table-wrap"><table className="subtenant-table influencer-table"><thead><tr><th>Influencer name{sortGlyph}</th><th>Affiliate link{sortGlyph}</th><th>Clicks{sortGlyph}</th><th>Conversion{sortGlyph}</th><th>Registration fee{sortGlyph}</th><th>Total earnings{sortGlyph}</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleInfluencers.map((influencer) => <tr key={influencer.id}><td data-label="Influencer name">{influencer.name}</td><td data-label="Affiliate link">{influencer.affiliateLink}</td><td data-label="Clicks">{influencer.clicks}</td><td data-label="Conversion">{influencer.conversionRate}%</td><td data-label="Registration fee">{money(influencer.registrationFee)}</td><td data-label="Total earnings">{money(influencer.totalEarnings)}</td><td data-label="Actions"><button className="subtenant-view-more" type="button" onClick={() => showToast(`${influencer.name} is part of the shared influencer catalog.`)}>View more</button></td></tr>)}</tbody></table></div><TableFooter page={currentPage} count={count} onPageChange={setPage} /></>}
    </section>
    <OrbitFooter />
    {kind === "influencers" ? <InfluencerFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={saveInfluencer} /> : <SubtenantFormModal open={formOpen} kind={kind} onClose={() => setFormOpen(false)} onSave={saveSubtenant} />}
    <SubtenantSuccessModal open={successOpen} title={kind === "influencers" ? "Influencer successfully added!" : "Subtenant successfully added!"} onConfirm={() => setSuccessOpen(false)} />
  </div>;
}
