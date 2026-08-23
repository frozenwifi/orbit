"use client";

import { OperatorLogo } from "@/components/networks/OperatorLogo";
import { Pagination } from "@/components/ui/Pagination";
import { TechnologyBadge } from "@/components/ui/TechnologyBadge";
import type { ResolvedNetwork } from "@/types/domain";
import { countryFlag } from "@/utils/networks";

interface NetworkTableProps {
  networks: readonly ResolvedNetwork[];
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (network: ResolvedNetwork) => void;
}

export function NetworkTable({ networks, page, pageCount, totalCount, pageSize, onPageChange, onView }: NetworkTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);
  return <>
    <div className="network-catalog-table-wrap"><table className="network-catalog-table network-operator-table">
      <thead><tr><th scope="col">Country<span aria-hidden="true">⌃</span></th><th scope="col">ISO3<span aria-hidden="true">⌃</span></th><th scope="col">Network<span aria-hidden="true">⌃</span></th><th scope="col">Logo<span aria-hidden="true">⌃</span></th><th scope="col">PLMN<span aria-hidden="true">⌃</span></th><th scope="col">MCCMNC<span aria-hidden="true">⌃</span></th><th scope="col">3G<span aria-hidden="true">⌃</span></th><th scope="col">4G LTE<span aria-hidden="true">⌃</span></th><th scope="col">5G<span aria-hidden="true">⌃</span></th></tr></thead>
      <tbody>{networks.map((network) => <tr key={network.id}>
        <td data-label="Country"><span className="network-country"><span className="network-country-flag" aria-hidden="true">{countryFlag(network.country.code)}</span>{network.country.name}</span></td>
        <td data-label="ISO3">{network.country.iso3}</td>
        <td data-label="Network"><button className="network-name-link" type="button" onClick={() => onView(network)} aria-label={`Open details for ${network.operator.name} in ${network.country.name}`}>{network.operator.name}</button></td>
        <td data-label="Logo"><OperatorLogo operator={network.operator} /></td>
        <td data-label="PLMN">{network.plmn}</td><td data-label="MCCMNC">{network.mcc}{network.mnc}</td>
        <td data-label="3G">{network.technologies.includes("3G") ? <TechnologyBadge technology="3G" /> : null}</td>
        <td data-label="4G LTE">{network.technologies.includes("4G") || network.technologies.includes("LTE") ? <TechnologyBadge technology="4G" label="4G LTE" /> : null}</td>
        <td data-label="5G">{network.technologies.includes("5G") ? <TechnologyBadge technology="5G" /> : null}</td>
      </tr>)}</tbody>
    </table></div>
    <footer className="network-catalog-footer"><span>Showing {start} to {end} of {totalCount} entries</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="Network operator table pages" /></footer>
  </>;
}
