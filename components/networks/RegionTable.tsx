import { Pagination } from "@/components/ui/Pagination";
import type { Country } from "@/types/domain";
import { countryFlag } from "@/utils/networks";

interface RegionTableProps {
  countries: readonly Country[];
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const figmaCountryLabel = (country: Country) => ({ US: "USA", DE: "German", ES: "Spanish" }[country.code] ?? country.name);

export function RegionTable({ countries, page, pageCount, totalCount, pageSize, onPageChange }: RegionTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);
  return <>
    <div className="network-catalog-table-wrap"><table className="network-catalog-table network-region-table">
      <thead><tr><th scope="col">Country<span aria-hidden="true">⌃</span></th><th scope="col">ISO3<span aria-hidden="true">⌃</span></th><th scope="col">ISO2<span aria-hidden="true">⌃</span></th><th scope="col">APN Name<span aria-hidden="true">⌃</span></th><th scope="col">Auto APN<span aria-hidden="true">⌃</span></th><th scope="col">Wi-Fi Hotspot<span aria-hidden="true">⌃</span></th></tr></thead>
      <tbody>{countries.map((country) => <tr key={country.id}><td data-label="Country"><span className="network-country"><span className="network-country-flag" aria-hidden="true">{countryFlag(country.code)}</span>{figmaCountryLabel(country)}</span></td><td data-label="ISO3">{country.iso3}</td><td data-label="ISO2">{country.code}</td><td data-label="APN Name">{country.apnName}</td><td data-label="Auto APN"><span className="network-neutral-pill">{country.autoApn ? "yes" : "no"}</span></td><td data-label="Wi-Fi Hotspot"><span className="network-neutral-pill">{country.wifiHotspot ? "yes" : "no"}</span></td></tr>)}</tbody>
    </table></div>
    <footer className="network-catalog-footer"><span>Showing {start} to {end} of {totalCount} entries</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="Region table pages" /></footer>
  </>;
}
