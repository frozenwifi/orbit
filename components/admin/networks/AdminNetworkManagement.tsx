"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { OperatorLogo } from "@/components/networks/OperatorLogo";
import { useDomain } from "@/components/providers/DomainProvider";
import { adminSession } from "@/data/admin-session";
import type { Country, NetworkRegion, ResolvedNetwork } from "@/types/domain";
import { downloadExcelTable } from "@/utils/export";
import { countryFlag } from "@/utils/networks";

const regionTabs = ["Default", "Europe", "Asia", "Latin America", "Caribbean", "Middle East", "Balkans", "Caucasus"] as const satisfies readonly NetworkRegion[];
const regionColumns = ["COUNTRY", "ISO3", "ISO2", "APN NAME", "AUTO APN", "WI-FI HOTSPOT"] as const;
const operatorColumns = ["COUNTRY", "ISO3", "NETWORK", "LOGO", "PLMN", "MCCMNC", "3G", "4G LTE", "5G"] as const;
const regionPageSize = 9;
const operatorPageSize = 8;

type AdminNetworkView = "regions" | "operators";

function regionSlug(region: NetworkRegion) {
  return region.toLocaleLowerCase().replaceAll(" ", "-");
}

function figmaCountryName(country: Country) {
  return ({ US: "USA", DE: "German", ES: "Spanish" } as const)[country.code as "US" | "DE" | "ES"] ?? country.name;
}

function CatalogPager({ page, total, pageSize, onChange, label }: { page: number; total: number; pageSize: number; onChange: (page: number) => void; label: string }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? (page === 1 ? 1 : 11) : 0;
  const last = total ? (page === 1 ? Math.min(10, total) : total) : 0;

  return (
    <footer className="admin-table-footer admin-networks-table-footer">
      <span className="admin-entries-label" aria-live="polite">Showing {first} to {last} of {total} entries</span>
      <div className="admin-pager" aria-label={label}>
        <button className="admin-pager-button" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>‹</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={`admin-pager-button${page === number ? " active" : ""}`} type="button" aria-current={page === number ? "page" : undefined} aria-label={`Page ${number}`} key={number} onClick={() => onChange(number)}>{number}</button>)}
        <button className="admin-pager-button" type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onChange(Math.min(pageCount, page + 1))}>›</button>
      </div>
      <span />
    </footer>
  );
}

function GeographicTabs({ value, onChange }: { value: NetworkRegion; onChange: (region: NetworkRegion) => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const currentIndex = regionTabs.indexOf(value);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? regionTabs.length - 1 : event.key === "ArrowRight" ? (currentIndex + 1) % regionTabs.length : (currentIndex - 1 + regionTabs.length) % regionTabs.length;
    event.preventDefault();
    onChange(regionTabs[nextIndex]);
    requestAnimationFrame(() => document.getElementById(`admin-network-region-${nextIndex}`)?.focus());
  };

  return (
    <div className="admin-networks-tabs-scroll">
      <div className="admin-networks-tabs" role="tablist" aria-label="Network regions" onKeyDown={onKeyDown}>
        {regionTabs.map((region, index) => <button id={`admin-network-region-${index}`} className="admin-networks-tab" type="button" role="tab" aria-selected={region === value} tabIndex={region === value ? 0 : -1} key={region} onClick={() => onChange(region)}>{region}</button>)}
      </div>
    </div>
  );
}

function CatalogToolbar({ draftSearch, onDraftSearch, onSearch, onExport, label }: { draftSearch: string; onDraftSearch: (value: string) => void; onSearch: () => void; onExport: () => void; label: string }) {
  return (
    <div className="admin-networks-toolbar">
      <form role="search" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
        <label className="sr-only" htmlFor="admin-networks-search">Search {label}</label>
        <span className="admin-networks-search-field"><span className="admin-networks-search-icon" aria-hidden="true" /><input id="admin-networks-search" type="search" value={draftSearch} onChange={(event) => onDraftSearch(event.currentTarget.value)} placeholder="Search" autoComplete="off" /></span>
        <button className="admin-networks-search-button" type="submit" aria-label={`Search ${label}`}><span className="admin-networks-search-icon" aria-hidden="true" /></button>
      </form>
      <button className="admin-export-button admin-networks-export" type="button" onClick={onExport}><span className="admin-export-icon" aria-hidden="true" />Export excel</button>
    </div>
  );
}

function RegionCatalog({ countries }: { countries: readonly Country[] }) {
  return (
    <div className="admin-networks-table-scroll">
      <table className="admin-networks-table admin-networks-region-table">
        <caption className="sr-only">Orbit Admin network regions</caption>
        <thead><tr>{regionColumns.map((column) => <th scope="col" key={column}>{column}<span className="admin-sort-mark" aria-hidden="true" /></th>)}</tr></thead>
        <tbody>{countries.map((country) => <tr key={country.id}>
          <td data-label="Country"><span className="admin-networks-country"><span className="admin-networks-flag" aria-hidden="true"><span>{countryFlag(country.code)}</span></span>{figmaCountryName(country)}</span></td>
          <td data-label="ISO3">{country.iso3}</td>
          <td data-label="ISO2">{country.code}</td>
          <td data-label="APN name">{country.apnName}</td>
          <td data-label="Auto APN"><span className="admin-networks-pill">{country.autoApn ? "yes" : "no"}</span></td>
          <td data-label="Wi-Fi hotspot"><span className="admin-networks-pill">{country.wifiHotspot ? "yes" : "no"}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function TechnologyPill({ children }: { children: React.ReactNode }) {
  return <span className="admin-networks-pill admin-networks-technology">{children}</span>;
}

function OperatorCatalog({ networks }: { networks: readonly ResolvedNetwork[] }) {
  return (
    <div className="admin-networks-table-scroll">
      <table className="admin-networks-table admin-networks-operator-table">
        <caption className="sr-only">Orbit Admin network operators</caption>
        <thead><tr>{operatorColumns.map((column) => <th scope="col" key={column}>{column}<span className="admin-sort-mark" aria-hidden="true" /></th>)}</tr></thead>
        <tbody>{networks.map((network) => <tr key={network.id}>
          <td data-label="Country"><span className="admin-networks-country"><span className="admin-networks-flag" aria-hidden="true"><span>{countryFlag(network.country.code)}</span></span>{network.country.name}</span></td>
          <td data-label="ISO3">{network.country.iso3}</td>
          <td data-label="Network">{network.operator.name}</td>
          <td data-label="Logo"><OperatorLogo operator={network.operator} /></td>
          <td data-label="PLMN">{network.plmn}</td>
          <td data-label="MCCMNC">{network.mcc}{network.mnc}</td>
          <td data-label="3G">{network.technologies.includes("3G") ? <TechnologyPill>3G</TechnologyPill> : null}</td>
          <td data-label="4G LTE">{network.technologies.includes("4G") || network.technologies.includes("LTE") ? <TechnologyPill>4G LTE</TechnologyPill> : null}</td>
          <td data-label="5G">{network.technologies.includes("5G") ? <TechnologyPill>5G</TechnologyPill> : null}</td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdminNetworkManagement({ view }: { view: AdminNetworkView }) {
  const { repository } = useDomain();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const organizationId = adminSession.organizationId;
  const regions = useMemo(() => repository.getAdminRegionCatalog(organizationId), [organizationId, repository]);
  const operators = useMemo(() => repository.resolveAdminOperatorCatalog(organizationId), [organizationId, repository]);
  const search = searchParams.get("q") ?? "";
  const parsedPage = Number(searchParams.get("page") ?? "1");
  const requestedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const selectedRegion = regionTabs.find((region) => regionSlug(region) === searchParams.get("region")) ?? "Default";
  const [draftSearch, setDraftSearch] = useState(search);

  useEffect(() => setDraftSearch(search), [search]);

  const setParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    router.push(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  };

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredRegions = regions.filter((country) => (selectedRegion === "Default" || country.networkRegion === selectedRegion) && (!normalizedSearch || [country.name, figmaCountryName(country), country.iso3, country.code, country.apnName].some((value) => value.toLocaleLowerCase().includes(normalizedSearch))));
  const filteredOperators = operators.filter((network) => !normalizedSearch || [network.country.name, network.country.iso3, network.operator.name, network.plmn, `${network.mcc}${network.mnc}`].some((value) => value.toLocaleLowerCase().includes(normalizedSearch)));
  const records = view === "regions" ? filteredRegions : filteredOperators;
  const pageSize = view === "regions" ? regionPageSize : operatorPageSize;
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const start = (page - 1) * pageSize;
  const visibleRegions = filteredRegions.slice(start, start + pageSize);
  const visibleOperators = filteredOperators.slice(start, start + pageSize);
  const title = view === "regions" ? "Regions" : "Network operators";
  const label = view === "regions" ? "regions" : "network operators";

  const exportCatalog = () => {
    if (view === "regions") downloadExcelTable("orbit-admin-regions.xls", regionColumns, filteredRegions.map((country) => [figmaCountryName(country), country.iso3, country.code, country.apnName, country.autoApn ? "yes" : "no", country.wifiHotspot ? "yes" : "no"]));
    else downloadExcelTable("orbit-admin-network-operators.xls", operatorColumns, filteredOperators.map((network) => [network.country.name, network.country.iso3, network.operator.name, network.operator.logoAsset ?? network.operator.name, network.plmn, `${network.mcc}${network.mnc}`, network.technologies.includes("3G") ? "3G" : "", network.technologies.includes("4G") || network.technologies.includes("LTE") ? "4G LTE" : "", network.technologies.includes("5G") ? "5G" : ""]));
  };

  return (
    <div className={`admin-networks-page admin-networks-${view}`}>
      <header className="admin-networks-heading"><h1>{title}</h1></header>
      {view === "regions" ? <GeographicTabs value={selectedRegion} onChange={(region) => setParams({ region: region === "Default" ? null : regionSlug(region), page: null })} /> : <div className="admin-networks-tabs-spacer" aria-hidden="true" />}
      <section className="admin-card admin-networks-card" aria-label={`${title} catalog`}>
        <CatalogToolbar draftSearch={draftSearch} onDraftSearch={setDraftSearch} onSearch={() => setParams({ q: draftSearch.trim() || null, page: null })} onExport={exportCatalog} label={label} />
        {view === "regions" ? <RegionCatalog countries={visibleRegions} /> : <OperatorCatalog networks={visibleOperators} />}
        <CatalogPager page={page} total={records.length} pageSize={pageSize} onChange={(nextPage) => setParams({ page: nextPage === 1 ? null : String(nextPage) })} label={`${title} table pages`} />
      </section>
      <AdminFooter />
    </div>
  );
}
