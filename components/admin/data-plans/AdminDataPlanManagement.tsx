"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { adminSession } from "@/data/admin-session";
import type { AdminDataPlanRow } from "@/types/admin-data-plans";
import { downloadExcelTable } from "@/utils/export";

const columns = ["REGION", "ID", "NAME", "WSP", "RRP", "DATA (GB)", "VALIDITY (DAYS)", "WI-FI HOTSPOT", "COVERAGE"] as const;
const pageSize = 10;

function DataPlanToolbar({ draftSearch, onDraftSearch, onSearch, onExport }: { draftSearch: string; onDraftSearch: (value: string) => void; onSearch: () => void; onExport: () => void }) {
  return (
    <div className="admin-data-plans-toolbar">
      <form role="search" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
        <label className="sr-only" htmlFor="admin-data-plans-search">Search data plans</label>
        <span className="admin-data-plans-search-field">
          <span className="admin-data-plans-search-icon" aria-hidden="true" />
          <input id="admin-data-plans-search" type="search" value={draftSearch} onChange={(event) => onDraftSearch(event.currentTarget.value)} placeholder="Search" autoComplete="off" />
        </span>
        <button className="admin-data-plans-search-button" type="submit" aria-label="Search data plans"><span className="admin-data-plans-search-icon" aria-hidden="true" /></button>
      </form>
      <button className="admin-export-button admin-data-plans-export" type="button" onClick={onExport}><span className="admin-export-icon" aria-hidden="true" />Export excel</button>
    </div>
  );
}

function DataPlanTable({ rows }: { rows: readonly AdminDataPlanRow[] }) {
  return (
    <div className="admin-data-plans-table-scroll">
      <table className="admin-data-plans-table">
        <caption className="sr-only">Orbit Admin data plans</caption>
        <thead><tr>{columns.map((column) => <th scope="col" key={column}>{column}<span className="admin-sort-mark" aria-hidden="true" /></th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row.rowId}>
          <td data-label="Region">{row.region}</td>
          <td data-label="ID">{row.displayId}</td>
          <td data-label="Name">{row.name}</td>
          <td data-label="WSP">${row.wsp.toFixed(2)}</td>
          <td data-label="RRP">${row.rrp.toFixed(2)}</td>
          <td data-label="Data (GB)"><span className="admin-data-plans-pill">{row.dataGb}</span></td>
          <td data-label="Validity (days)"><span className="admin-data-plans-pill">{row.validityDays}</span></td>
          <td data-label="Wi-Fi hotspot"><span className="admin-data-plans-pill admin-data-plans-hotspot">{row.wifiHotspot ? "Yes" : "No"}</span></td>
          <td data-label="Coverage">{row.coverageCountries} countries</td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function DataPlanPager({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = total ? Math.min(page * pageSize, total) : 0;
  return (
    <footer className="admin-table-footer admin-data-plans-table-footer">
      <span className="admin-entries-label" aria-live="polite">Showing {first} to {last} of {total} entries</span>
      <div className="admin-pager" aria-label="Data plans table pages">
        <button className="admin-pager-button" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>‹</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={`admin-pager-button${page === number ? " active" : ""}`} type="button" aria-current={page === number ? "page" : undefined} aria-label={`Page ${number}`} key={number} onClick={() => onChange(number)}>{number}</button>)}
        <button className="admin-pager-button" type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => onChange(Math.min(pageCount, page + 1))}>›</button>
      </div>
      <span />
    </footer>
  );
}

export function AdminDataPlanManagement() {
  const { repository } = useDomain();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rows = useMemo(() => repository.resolveAdminDataPlanCatalog(adminSession.organizationId), [repository]);
  const search = searchParams.get("q") ?? "";
  const parsedPage = Number(searchParams.get("page") ?? "1");
  const requestedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [draftSearch, setDraftSearch] = useState(search);

  useEffect(() => setDraftSearch(search), [search]);

  const setParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    router.push(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  };

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredRows = rows.filter((row) => !normalizedSearch || [row.region, row.displayId, row.name, `$${row.wsp.toFixed(2)}`, `$${row.rrp.toFixed(2)}`, `${row.dataGb}`, `${row.validityDays}`, row.wifiHotspot ? "yes" : "no", `${row.coverageCountries} countries`].some((value) => value.toLocaleLowerCase().includes(normalizedSearch)));
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const exportPlans = () => downloadExcelTable("orbit-admin-data-plans.xls", columns, filteredRows.map((row) => [row.region, row.displayId, row.name, `$${row.wsp.toFixed(2)}`, `$${row.rrp.toFixed(2)}`, row.dataGb, row.validityDays, row.wifiHotspot ? "Yes" : "No", `${row.coverageCountries} countries`]));

  return (
    <div className="admin-data-plans-page">
      <header className="admin-data-plans-heading"><h1>Data plans</h1></header>
      <section className="admin-card admin-data-plans-card" aria-label="Data plans catalog">
        <DataPlanToolbar draftSearch={draftSearch} onDraftSearch={setDraftSearch} onSearch={() => setParams({ q: draftSearch.trim() || null, page: null })} onExport={exportPlans} />
        <DataPlanTable rows={visibleRows} />
        <DataPlanPager page={page} total={filteredRows.length} onChange={(nextPage) => setParams({ page: nextPage === 1 ? null : String(nextPage) })} />
      </section>
      <AdminFooter />
    </div>
  );
}
