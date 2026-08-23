"use client";

import { useEffect, useMemo, useState } from "react";
import { OperationDetailDrawer } from "@/components/operations/OperationDetailDrawer";
import { OperationSummary } from "@/components/operations/OperationSummary";
import { OperationTable } from "@/components/operations/OperationTable";
import { useDomain } from "@/components/providers/DomainProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { CollectionState } from "@/components/ui/CollectionState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { useEntityDetail } from "@/hooks/useEntityNavigation";
import type { OperationStatus, OperationType } from "@/types/domain";
import type { ResolvedOperation } from "@/types/operations";
import { customerName } from "@/utils/customers";
import { OPERATION_REFERENCE_DATE, operationStatusLabel, operationTypeLabel } from "@/utils/operations";

const PAGE_SIZE = 6;
const operationTypes: readonly OperationType[] = ["esim_activation", "esim_assignment", "plan_assignment", "top_up", "suspension", "reactivation", "esim_created", "customer_created"];
const operationStatuses: readonly OperationStatus[] = ["pending", "processing", "completed", "failed", "cancelled"];
const typeOptions = [{ label: "All operation types", value: "all" }, ...operationTypes.map((value) => ({ label: operationTypeLabel(value), value }))];
const statusOptions = [{ label: "All statuses", value: "all" }, ...operationStatuses.map((value) => ({ label: operationStatusLabel(value), value }))];
const dateOptions = [{ label: "All time", value: "all" }, { label: "Today", value: "today" }, { label: "Last 7 days", value: "7d" }, { label: "Last 30 days", value: "30d" }];
const referenceEnd = Date.parse(`${OPERATION_REFERENCE_DATE}T23:59:59.999Z`);

export function OperationManagement() {
  const { selectedId, openDetail, closeDetail } = useEntityDetail("operation");
  const { operations, resolvedNetworks, retryOperation } = useDomain();
  const { query, setQuery } = useSearch();
  const { showToast } = useToast();
  const [collectionState, setCollectionState] = useState<"loading" | "ready" | "error">("loading");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [networkId, setNetworkId] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setCollectionState("ready"), 460);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedOperation = operations.find((operation) => operation.id === selectedId) ?? null;
  const networkOptions = useMemo(() => {
    const operationNetworkIds = new Set(operations.flatMap((operation) => operation.networkId ? [operation.networkId] : []));
    return [{ label: "All networks", value: "all" }, ...resolvedNetworks.filter((network) => operationNetworkIds.has(network.id)).map((network) => ({ label: `${network.operator.name} · ${network.country.code}`, value: network.id })).sort((a, b) => a.label.localeCompare(b.label))];
  }, [operations, resolvedNetworks]);

  const filteredOperations = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const cutoff = dateRange === "7d" ? referenceEnd - 7 * 86_400_000 : dateRange === "30d" ? referenceEnd - 30 * 86_400_000 : 0;
    return operations.filter((operation) => {
      const values = [operation.id, operationTypeLabel(operation.type), operation.customer ? customerName(operation.customer) : "", operation.customer?.email ?? "", operation.esim?.id ?? "", operation.esim?.iccid ?? "", operation.esim?.label ?? "", operation.plan?.name ?? "", operation.plan?.id ?? "", operation.network?.operator.name ?? "", operation.network?.country.name ?? "", operation.network?.id ?? ""];
      const matchesDate = dateRange === "all" || (dateRange === "today" ? operation.createdAt.startsWith(OPERATION_REFERENCE_DATE) : Date.parse(operation.createdAt) >= cutoff);
      return (!normalized || values.some((value) => value.toLocaleLowerCase().includes(normalized)))
        && (type === "all" || operation.type === type)
        && (status === "all" || operation.status === status)
        && matchesDate
        && (networkId === "all" || operation.networkId === networkId);
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [dateRange, networkId, operations, query, status, type]);

  const pageCount = Math.max(1, Math.ceil(filteredOperations.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleOperations = filteredOperations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const clearFilters = () => { setQuery(""); setType("all"); setStatus("all"); setDateRange("all"); setNetworkId("all"); setPage(1); };
  const refresh = () => {
    setCollectionState("loading");
    window.setTimeout(() => { setCollectionState("ready"); showToast("Operational activity is up to date."); }, 650);
  };
  const handleRetry = (operation: ResolvedOperation) => {
    const retried = retryOperation(operation.id);
    clearFilters();
    openDetail(retried.id);
    showToast(`${operation.id} retry started.`);
    window.setTimeout(() => showToast(`${retried.id} completed successfully.`), 950);
  };

  return <div className="operations-page">
    <header className="operations-page-header"><div><h1>Operations</h1><p>Monitor provisioning and lifecycle activity across customers, eSIMs, plans and networks.</p></div></header>
    <OperationSummary operations={operations} />
    <section className="card operation-management-card" aria-labelledby="operation-management-title">
      <header className="operation-management-header"><div><h2 id="operation-management-title">Operational activity</h2><p>Review normalized events and follow every request through its Orbit lifecycle.</p></div><Button variant="ghost" compact onClick={refresh} aria-label="Refresh operational activity"><span className="refresh-icon" aria-hidden="true">↻</span>Refresh</Button></header>
      <div className="operation-toolbar"><label className="operation-search"><span className="search-icon" aria-hidden="true" /><span className="sr-only">Search operations</span><input type="search" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} placeholder="Search ID, customer, eSIM, plan or network…" />{query ? <button type="button" aria-label="Clear operation search" onClick={() => setQuery("")}>×</button> : null}</label><div className="operation-filters" aria-label="Operation filters"><FilterSelect label="Filter by operation type" value={type} options={typeOptions} onChange={(value) => updateFilter(setType, value)} /><FilterSelect label="Filter by operation status" value={status} options={statusOptions} onChange={(value) => updateFilter(setStatus, value)} /><FilterSelect label="Filter by date" value={dateRange} options={dateOptions} onChange={(value) => updateFilter(setDateRange, value)} /><FilterSelect label="Filter by network" value={networkId} options={networkOptions} onChange={(value) => updateFilter(setNetworkId, value)} /></div></div>
      {collectionState === "loading" ? <CollectionState kind="loading" entityLabel="operations" /> : collectionState === "error" ? <CollectionState kind="error" entityLabel="operations" actionLabel="Try again" onAction={refresh} /> : filteredOperations.length === 0 ? <CollectionState kind="empty" entityLabel="operations" title={operations.length ? "No matching operations" : "No operational activity yet"} message={operations.length ? "No operations match the current search and filters." : "Operational records will appear when Orbit actions are performed."} actionLabel={operations.length ? "Clear filters" : "Refresh"} onAction={operations.length ? clearFilters : refresh} /> : <OperationTable operations={visibleOperations} page={currentPage} pageCount={pageCount} totalCount={filteredOperations.length} pageSize={PAGE_SIZE} onPageChange={setPage} onView={(operation) => openDetail(operation.id)} onRetry={handleRetry} />}
    </section>
    <OperationDetailDrawer operation={selectedOperation} onClose={closeDetail} onRetry={handleRetry} />
  </div>;
}
