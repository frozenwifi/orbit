"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OrbitFooter } from "@/components/dashboard/OrbitFooter";
import { NetworkCatalogToolbar } from "@/components/networks/NetworkCatalogToolbar";
import { NetworkDetailDrawer } from "@/components/networks/NetworkDetailDrawer";
import { NetworkFormModal } from "@/components/networks/NetworkFormModal";
import { NetworkRegionTabs, networkRegionTabs } from "@/components/networks/NetworkRegionTabs";
import { NetworkTable } from "@/components/networks/NetworkTable";
import { RegionTable } from "@/components/networks/RegionTable";
import { useDomain } from "@/components/providers/DomainProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { CollectionState } from "@/components/ui/CollectionState";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useEntityDetail } from "@/hooks/useEntityNavigation";
import type { Country, NetworkRegion, NetworkStatus, NewNetworkInput, ResolvedNetwork } from "@/types/domain";

const REGION_PAGE_SIZE = 9;
const OPERATOR_PAGE_SIZE = 8;
const regionSlug = (region: NetworkRegion) => region.toLocaleLowerCase().replaceAll(" ", "-");

interface NetworkManagementProps {
  view?: "regions" | "operators";
}

function downloadExcel(fileName: string, headings: readonly string[], rows: readonly (readonly (string | number | boolean)[])[]) {
  const content = [headings, ...rows].map((row) => row.map((cell) => String(cell).replaceAll("\t", " ")).join("\t")).join("\n");
  const url = URL.createObjectURL(new Blob([`\ufeff${content}`], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function NetworkManagement({ view = "regions" }: NetworkManagementProps) {
  const { selectedId, openDetail, closeDetail } = useEntityDetail("network");
  const { repository, countries, operators, resolvedNetworks: networks, plans, resolvedEsims: esims, networkActivities, updateNetwork, setNetworkStatus } = useDomain();
  const { query, setQuery } = useSearch();
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collectionState, setCollectionState] = useState<"loading" | "ready" | "error">("loading");
  const [page, setPage] = useState(1);
  const [formNetworkId, setFormNetworkId] = useState<string | null>(null);
  const [disableNetworkId, setDisableNetworkId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCollectionState("ready"), 360);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedRegion = networkRegionTabs.find((region) => regionSlug(region) === searchParams.get("region")) ?? "Default";
  const regionCatalog = useMemo(() => repository.getSuperadminRegionCatalog(), [repository]);
  const operatorCatalog = useMemo(() => repository.resolveSuperadminOperatorCatalog(), [repository]);
  const selectedNetwork = networks.find((network) => network.id === selectedId) ?? null;
  const formNetwork = networks.find((network) => network.id === formNetworkId) ?? null;
  const disableNetwork = networks.find((network) => network.id === disableNetworkId) ?? null;

  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return regionCatalog.filter((country) => (selectedRegion === "Default" || country.networkRegion === selectedRegion) && (!normalized || [country.name, country.code, country.iso3, country.apnName].some((value) => value.toLocaleLowerCase().includes(normalized))));
  }, [query, regionCatalog, selectedRegion]);

  const filteredNetworks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return operatorCatalog.filter((network) => (selectedRegion === "Default" || network.country.networkRegion === selectedRegion) && (!normalized || [network.country.name, network.country.code, network.country.iso3, network.operator.name, network.plmn, network.mcc, network.mnc, `${network.mcc}${network.mnc}`].some((value) => value.toLocaleLowerCase().includes(normalized))));
  }, [operatorCatalog, query, selectedRegion]);

  useEffect(() => setPage(1), [query, selectedRegion, view]);

  const records = view === "regions" ? filteredCountries : filteredNetworks;
  const pageSize = view === "regions" ? REGION_PAGE_SIZE : OPERATOR_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleCountries = filteredCountries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleNetworks = filteredNetworks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const title = view === "regions" ? "Regions" : "Network operators";
  const entityLabel = view === "regions" ? "regions" : "network operators";

  const selectRegion = (region: NetworkRegion) => {
    const params = new URLSearchParams(searchParams.toString());
    if (region === "Default") params.delete("region"); else params.set("region", regionSlug(region));
    const suffix = params.toString();
    router.push(`${pathname}${suffix ? `?${suffix}` : ""}`, { scroll: false });
  };

  const exportCatalog = () => {
    if (view === "regions") {
      downloadExcel("orbit-regions.xls", ["COUNTRY", "ISO3", "ISO2", "APN NAME", "AUTO APN", "WI-FI HOTSPOT"], filteredCountries.map((country) => [country.name, country.iso3, country.code, country.apnName, country.autoApn ? "yes" : "no", country.wifiHotspot ? "yes" : "no"]));
    } else {
      downloadExcel("orbit-network-operators.xls", ["COUNTRY", "ISO3", "NETWORK", "LOGO", "PLMN", "MCCMNC", "3G", "4G LTE", "5G"], filteredNetworks.map((network) => [network.country.name, network.country.iso3, network.operator.name, network.operator.logoAsset ?? network.operator.name, network.plmn, `${network.mcc}${network.mnc}`, network.technologies.includes("3G") ? "3G" : "", network.technologies.includes("4G") || network.technologies.includes("LTE") ? "4G LTE" : "", network.technologies.includes("5G") ? "5G" : ""]));
    }
    showToast(`${records.length} ${entityLabel} exported for Excel.`);
  };

  const openEdit = (network: ResolvedNetwork) => {
    if (selectedId !== network.id) openDetail(network.id);
    setFormNetworkId(network.id);
  };

  const handleSubmit = (input: NewNetworkInput) => {
    if (!formNetwork) return;
    updateNetwork(formNetwork.id, input);
    openDetail(formNetwork.id);
    showToast(`${formNetwork.operator.name} configuration was updated.`);
    setFormNetworkId(null);
  };

  const requestToggleStatus = (network: ResolvedNetwork) => {
    if (network.status === "Disabled") {
      setNetworkStatus(network.id, "Active");
      showToast(`${network.operator.name} in ${network.country.name} was enabled.`);
    } else setDisableNetworkId(network.id);
  };

  const confirmDisable = () => {
    if (!disableNetwork) return;
    setNetworkStatus(disableNetwork.id, "Disabled" as NetworkStatus);
    showToast(`${disableNetwork.operator.name} in ${disableNetwork.country.name} was disabled for new assignments.`);
    setDisableNetworkId(null);
  };

  return <div className="networks-page network-superadmin-page">
    <header className="network-superadmin-header"><h1>{title}</h1></header>
    <NetworkRegionTabs value={selectedRegion} onChange={selectRegion} />
    <section className="card network-catalog-card" aria-label={`${title} catalog`}>
      <NetworkCatalogToolbar query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} onSearch={() => setPage(1)} onExport={exportCatalog} entityLabel={entityLabel} />
      {collectionState === "loading" ? <CollectionState kind="loading" entityLabel={entityLabel} /> : collectionState === "error" ? <CollectionState kind="error" entityLabel={entityLabel} actionLabel="Try again" onAction={() => setCollectionState("ready")} /> : records.length === 0 ? <CollectionState kind="empty" entityLabel={entityLabel} title={`No matching ${entityLabel}`} message={`No ${entityLabel} match the current region and search.`} actionLabel="Clear search" onAction={() => setQuery("")} /> : view === "regions" ? <RegionTable countries={visibleCountries} page={currentPage} pageCount={pageCount} totalCount={filteredCountries.length} pageSize={pageSize} onPageChange={setPage} /> : <NetworkTable networks={visibleNetworks} page={currentPage} pageCount={pageCount} totalCount={filteredNetworks.length} pageSize={pageSize} onPageChange={setPage} onView={(network) => router.push(`/networks?network=${encodeURIComponent(network.id)}`)} />}
    </section>
    <OrbitFooter />
    {view === "regions" ? <><NetworkDetailDrawer network={selectedNetwork} plans={plans} esims={esims} activities={networkActivities} onClose={closeDetail} onEdit={openEdit} onToggleStatus={requestToggleStatus} /><NetworkFormModal open={Boolean(formNetwork)} network={formNetwork} countries={countries} operators={operators} networks={networks} onClose={() => setFormNetworkId(null)} onSubmit={handleSubmit} /><ConfirmationModal open={Boolean(disableNetwork)} title="Disable network?" warningTitle="This action affects new network assignments" message={disableNetwork ? `${disableNetwork.operator.name} in ${disableNetwork.country.name} will be disabled in the Orbit catalog. Existing Plan and eSIM relationships remain available for operational continuity.` : ""} confirmLabel="Disable network" onClose={() => setDisableNetworkId(null)} onConfirm={confirmDisable} /></> : null}
  </div>;
}
