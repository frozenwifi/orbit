"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AddEsimModal, type NewEsimDraft } from "@/components/esims/AddEsimModal";
import { OrbitFooter } from "@/components/dashboard/OrbitFooter";
import { EsimAssignmentModal } from "@/components/esims/EsimAssignmentModal";
import { EsimDetailWorkspace, type EsimWorkspaceTab } from "@/components/esims/EsimDetailWorkspace";
import { EsimTable } from "@/components/esims/EsimTable";
import { useDomain } from "@/components/providers/DomainProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { CollectionState } from "@/components/ui/CollectionState";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useEntityDetail } from "@/hooks/useEntityNavigation";
import type { Esim, EsimCollectionState, EsimStatus } from "@/types/esim";

const PAGE_SIZE = 10;
const workspaceTabs = new Set<EsimWorkspaceTab>(["summary", "activation", "usage"]);

export function EsimManagement() {
  const [collectionState, setCollectionState] = useState<EsimCollectionState>("loading");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [assignmentEsimId, setAssignmentEsimId] = useState<string | null>(null);
  const [removeEsimId, setRemoveEsimId] = useState<string | null>(null);
  const [statusEsimId, setStatusEsimId] = useState<string | null>(null);
  const { selectedId, openDetail, closeDetail } = useEntityDetail("esim");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, plans, resolvedEsims: esims, createEsim, updateEsimAssignment, updateEsimStatus, removeEsim: removeEsimEntity } = useDomain();
  const { query, setQuery } = useSearch();
  const { showToast } = useToast();

  useEffect(() => {
    const timer = window.setTimeout(() => setCollectionState("ready"), 360);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedEsim = esims.find((esim) => esim.id === selectedId) ?? null;
  const assignmentEsim = esims.find((esim) => esim.id === assignmentEsimId) ?? null;
  const removeTarget = esims.find((esim) => esim.id === removeEsimId) ?? null;
  const statusTarget = esims.find((esim) => esim.id === statusEsimId) ?? null;
  const rawTab = searchParams.get("tab") as EsimWorkspaceTab | null;
  const workspaceTab: EsimWorkspaceTab = rawTab && workspaceTabs.has(rawTab) ? rawTab : "summary";

  const filteredEsims = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return esims;
    return esims.filter((esim) => [esim.id, esim.iccid, esim.label, esim.status, esim.user?.name ?? "", esim.customer?.id ?? ""].some((value) => value.toLocaleLowerCase().includes(normalized)));
  }, [esims, query]);

  const pageCount = Math.max(1, Math.ceil(filteredEsims.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleEsims = filteredEsims.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const saveAssignment = (input: { customerId: string | null; planId: string }) => {
    if (!assignmentEsim) return;
    updateEsimAssignment(assignmentEsim.id, input);
    showToast(`${assignmentEsim.label} assignment was updated.`);
    setAssignmentEsimId(null);
  };

  const addEsim = (draft: NewEsimDraft) => {
    const selectedPlan = plans.find((item) => item.id === draft.planId) ?? plans[0];
    const customerId = draft.customerId && customers.some((customer) => customer.id === draft.customerId) ? draft.customerId : null;
    const created = createEsim({ label: draft.label, customerId, planId: selectedPlan.id, destination: selectedPlan.destination, activateNow: draft.activateNow });
    setQuery("");
    setPage(1);
    setAddOpen(false);
    openDetail(created.id);
    showToast(`${created.label} was added successfully.`);
  };

  const exportExcel = () => {
    const headings = ["ID", "Date Assigned", "eSIM ICCID", "eSIM Status", "Subtenant", "eSIM Tag"];
    const rows = filteredEsims.map((esim) => [esim.id, esim.activationDate, esim.iccid, esim.status === "Pending" ? "Awaiting activation" : esim.status, esim.user?.name ?? "Unassigned", esim.label]);
    const content = [headings, ...rows].map((row) => row.map((cell) => String(cell).replaceAll("\t", " ")).join("\t")).join("\n");
    const url = URL.createObjectURL(new Blob([`\ufeff${content}`], { type: "application/vnd.ms-excel;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "orbit-esims.xls";
    link.click();
    URL.revokeObjectURL(url);
    showToast(`${filteredEsims.length} eSIM records exported for Excel.`);
  };

  const setWorkspaceTab = (tab: EsimWorkspaceTab) => {
    if (!selectedEsim) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("esim", selectedEsim.id);
    if (tab === "summary") params.delete("tab"); else params.set("tab", tab);
    router.push(`/esims?${params.toString()}`, { scroll: false });
  };

  const confirmStatusChange = () => {
    if (!statusTarget) return;
    const nextStatus: EsimStatus = statusTarget.status === "Active" ? "Suspended" : "Active";
    updateEsimStatus(statusTarget.id, nextStatus);
    showToast(`${statusTarget.id} is now ${nextStatus.toLocaleLowerCase()}.`);
    setStatusEsimId(null);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    removeEsimEntity(removeTarget.id);
    if (selectedId === removeTarget.id) closeDetail();
    showToast(`${removeTarget.id} was removed from the mock inventory.`);
    setRemoveEsimId(null);
  };

  if (selectedEsim) {
    return (
      <div className="esims-page esim-workspace-page">
        <EsimDetailWorkspace
          esim={selectedEsim}
          tab={workspaceTab}
          onTabChange={setWorkspaceTab}
          onClose={closeDetail}
          onToggleStatus={(esim) => setStatusEsimId(esim.id)}
          onReassign={(esim) => setAssignmentEsimId(esim.id)}
          onNotify={showToast}
        />
        <OrbitFooter />
        <EsimAssignmentModal open={Boolean(assignmentEsim)} esim={assignmentEsim} customers={customers} plans={plans} onClose={() => setAssignmentEsimId(null)} onSave={saveAssignment} />
        <ConfirmationModal
          open={Boolean(statusTarget)}
          title={statusTarget?.status === "Active" ? "Are you sure you want to block this eSIM?" : "Are you sure you want to activate this eSIM?"}
          message={statusTarget?.status === "Active" ? "This will immediately block the eSIM data connection to the network." : "Activating an eSIM will immediately reactivate its access to the network."}
          warningTitle={statusTarget?.status === "Active" ? "This eSIM will lose network access" : "This eSIM will regain network access"}
          confirmLabel={statusTarget?.status === "Active" ? "Block eSIM" : "Activate"}
          confirmVariant={statusTarget?.status === "Active" ? "danger" : "primary"}
          onClose={() => setStatusEsimId(null)}
          onConfirm={confirmStatusChange}
        />
      </div>
    );
  }

  return (
    <div className="esims-page">
      <header className="esims-page-header">
        <h1>eSIMs</h1>
        <Button variant="primary" className="add-esim-button" onClick={() => setAddOpen(true)}>Add eSIM</Button>
      </header>

      <section className="card esim-management-card" aria-label="eSIM inventory">
        <div className="esim-toolbar">
          <label className="esim-search">
            <span className="search-icon" aria-hidden="true" />
            <span className="sr-only">Search eSIMs</span>
            <input type="search" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} placeholder="Search" />
            {query ? <button type="button" aria-label="Clear eSIM search" onClick={() => setQuery("")}>×</button> : null}
          </label>
          <Button className="esim-search-submit" variant="primary" aria-label="Search eSIM inventory" onClick={() => setPage(1)}><span className="search-icon" aria-hidden="true" /></Button>
          <Button className="esim-export-button" onClick={exportExcel}><span className="esim-export-icon" aria-hidden="true">⇧</span>Export excel</Button>
        </div>

        {collectionState === "loading" ? <CollectionState kind="loading" /> : collectionState === "error" ? (
          <CollectionState kind="error" actionLabel="Try again" onAction={() => setCollectionState("ready")} />
        ) : filteredEsims.length === 0 ? (
          <CollectionState kind="empty" title="No matching eSIMs" message="No eSIMs match the current search." actionLabel="Clear search" onAction={() => setQuery("")} />
        ) : (
          <EsimTable esims={visibleEsims} page={currentPage} pageCount={pageCount} totalCount={filteredEsims.length} pageSize={PAGE_SIZE} onPageChange={setPage} onView={(esim) => openDetail(esim.id)} onRemove={(esim) => setRemoveEsimId(esim.id)} />
        )}
      </section>

      <OrbitFooter />

      <AddEsimModal open={addOpen} plans={plans} customers={customers} variant="superadmin" onClose={() => setAddOpen(false)} onAdd={addEsim} onViewProducts={() => { setAddOpen(false); router.push("/data-plans"); }} />
      <ConfirmationModal open={Boolean(removeTarget)} title="Are you sure you want to remove this eSIM?" message="This will immediately terminate the eSIM and block its data connection to the network. This action cannot be undone." warningTitle="This action cannot be undone" confirmLabel="Confirm" onClose={() => setRemoveEsimId(null)} onConfirm={confirmRemove} />
    </div>
  );
}
