"use client";

import { useEffect, useMemo, useState } from "react";
import { PlanDetailDrawer } from "@/components/plans/PlanDetailDrawer";
import { PlanFormModal, type PlanDraft, type PlanFormMode } from "@/components/plans/PlanFormModal";
import { PlanSummary } from "@/components/plans/PlanSummary";
import { PlanTable } from "@/components/plans/PlanTable";
import { useDomain } from "@/components/providers/DomainProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { CollectionState } from "@/components/ui/CollectionState";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { useEntityDetail } from "@/hooks/useEntityNavigation";
import type { Plan, PlanStatus } from "@/types/domain";

const PAGE_SIZE = 6;
const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "Archived", value: "Archived" },
];
const allowanceOptions = [
  { label: "Any allowance", value: "all" },
  { label: "Up to 5 GB", value: "small" },
  { label: "6–15 GB", value: "medium" },
  { label: "More than 15 GB", value: "large" },
];
const validityOptions = [
  { label: "Any validity", value: "all" },
  { label: "Up to 15 days", value: "short" },
  { label: "30 days", value: "standard" },
  { label: "60+ days", value: "extended" },
];

export function PlanManagement() {
  const { selectedId, openDetail, closeDetail } = useEntityDetail("plan");
  const { plans, resolvedEsims: esims, planActivities, createPlan, updatePlan, setPlanStatus } = useDomain();
  const { query, setQuery } = useSearch();
  const { showToast } = useToast();
  const [collectionState, setCollectionState] = useState<"loading" | "ready" | "error">("loading");
  const [status, setStatus] = useState("all");
  const [coverage, setCoverage] = useState("all");
  const [allowance, setAllowance] = useState("all");
  const [validity, setValidity] = useState("all");
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<PlanFormMode | null>(null);
  const [formPlanId, setFormPlanId] = useState<string | null>(null);
  const [archivePlanId, setArchivePlanId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCollectionState("ready"), 460);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === selectedId) ?? null;
  const formPlan = plans.find((plan) => plan.id === formPlanId) ?? null;
  const archivePlan = plans.find((plan) => plan.id === archivePlanId) ?? null;
  const destinations = useMemo(() => [...new Set(plans.map((plan) => plan.destination))].sort(), [plans]);
  const coverageOptions = useMemo(() => {
    const values = [...new Set(plans.flatMap((plan) => [plan.destination, ...plan.coverage.flatMap((entry) => [entry.country, entry.region])]))].sort();
    return [{ label: "All coverage", value: "all" }, ...values.map((value) => ({ label: value, value }))];
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return plans.filter((plan) => {
      const coverageValues = plan.coverage.flatMap((entry) => [entry.country, entry.region, entry.operator ?? ""]);
      const searchValues = [plan.name, plan.id, plan.destination, ...coverageValues];
      const validityDays = plan.validityUnit === "Months" ? plan.validity * 30 : plan.validity;
      const matchesAllowance = allowance === "all" || (allowance === "small" ? plan.allowanceGb <= 5 : allowance === "medium" ? plan.allowanceGb > 5 && plan.allowanceGb <= 15 : plan.allowanceGb > 15);
      const matchesValidity = validity === "all" || (validity === "short" ? validityDays <= 15 : validity === "standard" ? validityDays === 30 : validityDays >= 60);
      const matchesCoverage = coverage === "all" || plan.destination === coverage || plan.coverage.some((entry) => entry.country === coverage || entry.region === coverage);
      return (!normalized || searchValues.some((value) => value.toLocaleLowerCase().includes(normalized)))
        && (status === "all" || plan.status === status)
        && matchesCoverage
        && matchesAllowance
        && matchesValidity;
    });
  }, [allowance, coverage, plans, query, status, validity]);

  const pageCount = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visiblePlans = filteredPlans.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const clearFilters = () => { setQuery(""); setStatus("all"); setCoverage("all"); setAllowance("all"); setValidity("all"); setPage(1); };
  const openForm = (mode: PlanFormMode, plan?: Plan) => { setFormMode(mode); setFormPlanId(plan?.id ?? null); if (plan && selectedId !== plan.id) openDetail(plan.id); };

  const handleSubmit = (draft: PlanDraft) => {
    if (formMode === "edit" && formPlan) {
      updatePlan(formPlan.id, draft);
      openDetail(formPlan.id);
      showToast(`${draft.name} was updated.`);
    } else {
      const created = createPlan(draft);
      clearFilters();
      openDetail(created.id);
      showToast(formMode === "duplicate" ? `${created.name} was created as a separate plan.` : `${created.name} was added successfully.`);
    }
    setFormMode(null);
    setFormPlanId(null);
  };

  const toggleStatus = (plan: Plan) => {
    const nextStatus: PlanStatus = plan.status === "Active" ? "Inactive" : "Active";
    setPlanStatus(plan.id, nextStatus);
    showToast(`${plan.name} is now ${nextStatus.toLocaleLowerCase()}.`);
  };

  const confirmArchive = () => {
    if (!archivePlan) return;
    setPlanStatus(archivePlan.id, "Archived");
    showToast(`${archivePlan.name} was archived.`);
    setArchivePlanId(null);
    closeDetail();
  };

  const refresh = () => {
    setCollectionState("loading");
    window.setTimeout(() => { setCollectionState("ready"); showToast("Data plan catalog is up to date."); }, 650);
  };

  return (
    <div className="plans-page">
      <header className="plans-page-header"><div><h1>Data Plans</h1><p>Manage coverage, pricing and connectivity products across your catalog.</p></div><Button variant="primary" className="add-plan-button" onClick={() => openForm("add")}><span aria-hidden="true">＋</span>Add data plan</Button></header>
      <PlanSummary plans={plans} />
      <section className="card plan-management-card" aria-labelledby="plan-management-title">
        <header className="plan-management-header"><div><h2 id="plan-management-title">Data plan management</h2><p>Configure every reusable plan available to Orbit eSIM inventory.</p></div><Button variant="ghost" compact onClick={refresh} aria-label="Refresh data plan catalog"><span className="refresh-icon" aria-hidden="true">↻</span>Refresh</Button></header>
        <div className="plan-toolbar"><label className="plan-search"><span className="search-icon" aria-hidden="true" /><span className="sr-only">Search data plans</span><input type="search" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} placeholder="Search plan, region or ID…" />{query ? <button type="button" aria-label="Clear data plan search" onClick={() => setQuery("")}>×</button> : null}</label><div className="plan-filters" aria-label="Data plan filters"><FilterSelect label="Filter by status" value={status} options={statusOptions} onChange={(value) => updateFilter(setStatus, value)} /><FilterSelect label="Filter by country or region" value={coverage} options={coverageOptions} onChange={(value) => updateFilter(setCoverage, value)} /><FilterSelect label="Filter by allowance" value={allowance} options={allowanceOptions} onChange={(value) => updateFilter(setAllowance, value)} /><FilterSelect label="Filter by validity" value={validity} options={validityOptions} onChange={(value) => updateFilter(setValidity, value)} /></div></div>
        {collectionState === "loading" ? <CollectionState kind="loading" entityLabel="data plans" /> : collectionState === "error" ? <CollectionState kind="error" entityLabel="data plans" actionLabel="Try again" onAction={refresh} /> : filteredPlans.length === 0 ? <CollectionState kind="empty" entityLabel="data plans" title={plans.length ? "No matching data plans" : "No data plans yet"} message={plans.length ? "No plans match the current search and filters." : "Add your first data plan to begin building the Orbit catalog."} actionLabel={plans.length ? "Clear filters" : "Add data plan"} onAction={plans.length ? clearFilters : () => openForm("add")} /> : <PlanTable plans={visiblePlans} esims={esims} page={currentPage} pageCount={pageCount} totalCount={filteredPlans.length} pageSize={PAGE_SIZE} onPageChange={setPage} onView={(plan) => openDetail(plan.id)} onEdit={(plan) => openForm("edit", plan)} onDuplicate={(plan) => openForm("duplicate", plan)} onToggleStatus={toggleStatus} onArchive={(plan) => setArchivePlanId(plan.id)} />}
      </section>

      <PlanDetailDrawer plan={selectedPlan} esims={esims} activities={planActivities} onClose={closeDetail} onEdit={(plan) => openForm("edit", plan)} onDuplicate={(plan) => openForm("duplicate", plan)} onToggleStatus={toggleStatus} onArchive={(plan) => setArchivePlanId(plan.id)} />
      <PlanFormModal open={formMode !== null} mode={formMode ?? "add"} plan={formPlan} destinations={destinations} onClose={() => { setFormMode(null); setFormPlanId(null); }} onSubmit={handleSubmit} />
      <ConfirmationModal open={Boolean(archivePlan)} title="Archive data plan?" warningTitle="This action affects the plan catalog" message={archivePlan ? `${archivePlan.name} will be removed from active catalog selection. Existing eSIM assignments remain linked for historical continuity.` : ""} confirmLabel="Archive plan" onClose={() => setArchivePlanId(null)} onConfirm={confirmArchive} />
    </div>
  );
}
