"use client";

import { useEffect, useMemo, useState } from "react";
import { AddEsimModal, type NewEsimDraft } from "@/components/esims/AddEsimModal";
import { AssignEsimModal } from "@/components/customers/AssignEsimModal";
import { CustomerDetailDrawer } from "@/components/customers/CustomerDetailDrawer";
import { CustomerFormModal, type CustomerDraft } from "@/components/customers/CustomerFormModal";
import { CustomerSummary } from "@/components/customers/CustomerSummary";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { useDomain } from "@/components/providers/DomainProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { CollectionState } from "@/components/ui/CollectionState";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { useEntityDetail } from "@/hooks/useEntityNavigation";
import type { CustomerStatus, ResolvedCustomer } from "@/types/domain";
import { customerName } from "@/utils/customers";

const PAGE_SIZE = 6;

const statusOptions = ["all", "Active", "Inactive", "Suspended", "Archived"].map((value) => ({ label: value === "all" ? "All statuses" : value, value }));
const esimStatusOptions = [
  { label: "All eSIM statuses", value: "all" },
  { label: "Active eSIM", value: "Active" },
  { label: "Inactive eSIM", value: "Inactive" },
  { label: "Suspended eSIM", value: "Suspended" },
  { label: "Pending eSIM", value: "Pending" },
  { label: "No eSIMs", value: "none" },
];
const joinedOptions = [
  { label: "Any join date", value: "all" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 12 months", value: "365" },
  { label: "Over 12 months", value: "older" },
];

export function CustomerManagement() {
  const { selectedId, openDetail, closeDetail } = useEntityDetail("customer");
  const { customers, countries, resolvedEsims: esims, plans, activities, createCustomer, updateCustomer, setCustomerStatus, assignEsim, createEsim } = useDomain();
  const { query, setQuery } = useSearch();
  const { showToast } = useToast();
  const [collectionState, setCollectionState] = useState<"loading" | "ready" | "error">("loading");
  const [status, setStatus] = useState("all");
  const [esimStatus, setEsimStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const [joined, setJoined] = useState("all");
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [formCustomerId, setFormCustomerId] = useState<string | null>(null);
  const [assignCustomerId, setAssignCustomerId] = useState<string | null>(null);
  const [addEsimCustomerId, setAddEsimCustomerId] = useState<string | null>(null);
  const [archiveCustomerId, setArchiveCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCollectionState("ready"), 460);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? null;
  const formCustomer = customers.find((customer) => customer.id === formCustomerId) ?? null;
  const assignCustomer = customers.find((customer) => customer.id === assignCustomerId) ?? null;
  const addEsimCustomer = customers.find((customer) => customer.id === addEsimCustomerId) ?? null;
  const archiveCustomer = customers.find((customer) => customer.id === archiveCustomerId) ?? null;
  const availableEsims = esims.filter((esim) => !esim.customerId);
  const countryOptions = useMemo(() => [{ label: "All countries", value: "all" }, ...[...new Set(customers.map((customer) => customer.country))].sort().map((value) => ({ label: value, value }))], [customers]);

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const referenceDate = new Date("2026-08-21T00:00:00");
    return customers.filter((customer) => {
      const assigned = esims.filter((esim) => esim.customerId === customer.id);
      const ageDays = Math.floor((referenceDate.getTime() - new Date(`${customer.joinedDate}T00:00:00`).getTime()) / 86_400_000);
      const matchesDate = joined === "all" || (joined === "older" ? ageDays > 365 : ageDays <= Number(joined));
      const values = [customerName(customer), customer.email, customer.phone, customer.id, customer.country, customer.market];
      return (!normalized || values.some((value) => value.toLocaleLowerCase().includes(normalized)))
        && (status === "all" || customer.status === status)
        && (esimStatus === "all" || (esimStatus === "none" ? assigned.length === 0 : assigned.some((esim) => esim.status === esimStatus)))
        && (country === "all" || customer.country === country)
        && matchesDate;
    });
  }, [country, customers, esims, esimStatus, joined, query, status]);

  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleCustomers = filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const clearFilters = () => { setQuery(""); setStatus("all"); setEsimStatus("all"); setCountry("all"); setJoined("all"); setPage(1); };
  const openEdit = (customer: ResolvedCustomer) => { if (selectedId !== customer.id) openDetail(customer.id); setFormCustomerId(customer.id); setFormMode("edit"); };
  const openAssign = (customer: ResolvedCustomer) => { if (customer.status === "Archived") { showToast("Archived customers cannot receive eSIM assignments."); return; } if (selectedId !== customer.id) openDetail(customer.id); setAssignCustomerId(customer.id); };
  const openAddEsim = (customer: ResolvedCustomer) => { if (customer.status === "Archived") { showToast("Archived customers cannot receive new eSIMs."); return; } if (selectedId !== customer.id) openDetail(customer.id); setAddEsimCustomerId(customer.id); };

  const handleCustomerSubmit = (draft: CustomerDraft) => {
    if (formMode === "edit" && formCustomer) {
      updateCustomer(formCustomer.id, draft);
      openDetail(formCustomer.id);
      showToast(`${draft.firstName} ${draft.lastName} was updated.`);
    } else {
      const customer = createCustomer(draft);
      if (draft.esimId) assignEsim(draft.esimId, customer.id);
      clearFilters();
      openDetail(customer.id);
      showToast(`${customerName(customer)} was added successfully.`);
    }
    setFormMode(null);
    setFormCustomerId(null);
  };

  const toggleCustomerStatus = (customer: ResolvedCustomer) => {
    const nextStatus: CustomerStatus = customer.status === "Suspended" ? "Active" : "Suspended";
    setCustomerStatus(customer.id, nextStatus);
    showToast(`${customerName(customer)} is now ${nextStatus.toLocaleLowerCase()}.`);
  };

  const confirmArchive = () => {
    if (!archiveCustomer) return;
    setCustomerStatus(archiveCustomer.id, "Archived");
    showToast(`${customerName(archiveCustomer)} was archived.`);
    setArchiveCustomerId(null);
    closeDetail();
  };

  const handleAssign = (esimId: string) => {
    if (!assignCustomer) return;
    assignEsim(esimId, assignCustomer.id);
    showToast(`${esims.find((esim) => esim.id === esimId)?.label ?? "eSIM"} was assigned to ${customerName(assignCustomer)}.`);
    setAssignCustomerId(null);
  };

  const handleAddEsim = (draft: NewEsimDraft) => {
    if (!addEsimCustomer) return;
    const plan = plans.find((item) => item.id === draft.planId) ?? plans[0];
    const created = createEsim({ label: draft.label, customerId: addEsimCustomer.id, planId: plan.id, activateNow: draft.activateNow });
    showToast(`${created.label} was added for ${customerName(addEsimCustomer)}.`);
    setAddEsimCustomerId(null);
  };

  const refresh = () => {
    setCollectionState("loading");
    window.setTimeout(() => { setCollectionState("ready"); showToast("Customer records are up to date."); }, 650);
  };

  return (
    <div className="customers-page">
      <header className="customers-page-header"><div><h1>Customers</h1><p>Manage customer profiles, connectivity and account activity.</p></div><Button variant="primary" className="add-customer-button" onClick={() => { setFormCustomerId(null); setFormMode("add"); }}><span aria-hidden="true">＋</span>Add customer</Button></header>
      <CustomerSummary customers={customers} esims={esims} />
      <section className="card customer-management-card" aria-labelledby="customer-management-title">
        <header className="customer-management-header"><div><h2 id="customer-management-title">Customer management</h2><p>View and manage every customer connected through Orbit.</p></div><Button variant="ghost" compact onClick={refresh} aria-label="Refresh customer records"><span className="refresh-icon" aria-hidden="true">↻</span>Refresh</Button></header>
        <div className="customer-toolbar">
          <label className="customer-search"><span className="search-icon" aria-hidden="true" /><span className="sr-only">Search customers</span><input type="search" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} placeholder="Search name, contact or ID…" />{query ? <button type="button" aria-label="Clear customer search" onClick={() => setQuery("")}>×</button> : null}</label>
          <div className="customer-filters" aria-label="Customer filters"><FilterSelect label="Filter by customer status" value={status} options={statusOptions} onChange={(value) => updateFilter(setStatus, value)} /><FilterSelect label="Filter by eSIM status" value={esimStatus} options={esimStatusOptions} onChange={(value) => updateFilter(setEsimStatus, value)} /><FilterSelect label="Filter by country or market" value={country} options={countryOptions} onChange={(value) => updateFilter(setCountry, value)} /><FilterSelect label="Filter by date joined" value={joined} options={joinedOptions} onChange={(value) => updateFilter(setJoined, value)} /></div>
        </div>
        {collectionState === "loading" ? <CollectionState kind="loading" entityLabel="customers" /> : collectionState === "error" ? <CollectionState kind="error" entityLabel="customers" actionLabel="Try again" onAction={refresh} /> : filteredCustomers.length === 0 ? <CollectionState kind="empty" entityLabel="customers" title={customers.length ? "No matching customers" : "No customers yet"} message={customers.length ? "No customers match the current search and filters." : "Add your first customer to start managing connected accounts."} actionLabel={customers.length ? "Clear filters" : "Add customer"} onAction={customers.length ? clearFilters : () => setFormMode("add")} /> : <CustomerTable customers={visibleCustomers} esims={esims} page={currentPage} pageCount={pageCount} totalCount={filteredCustomers.length} pageSize={PAGE_SIZE} onPageChange={setPage} onView={(customer) => openDetail(customer.id)} onEdit={openEdit} onAssign={openAssign} onAddEsim={openAddEsim} onSuspend={toggleCustomerStatus} onArchive={(customer) => setArchiveCustomerId(customer.id)} />}
      </section>

      <CustomerDetailDrawer customer={selectedCustomer} esims={esims} activities={activities} onClose={closeDetail} onEdit={openEdit} onAssign={openAssign} onAddEsim={openAddEsim} onSuspend={toggleCustomerStatus} onArchive={(customer) => setArchiveCustomerId(customer.id)} />
      <CustomerFormModal open={formMode !== null} customer={formMode === "edit" ? formCustomer : null} countries={countries} availableEsims={availableEsims} onClose={() => { setFormMode(null); setFormCustomerId(null); }} onSubmit={handleCustomerSubmit} />
      <AssignEsimModal open={Boolean(assignCustomer)} customer={assignCustomer} availableEsims={availableEsims} onClose={() => setAssignCustomerId(null)} onAssign={handleAssign} />
      <AddEsimModal open={Boolean(addEsimCustomer)} plans={plans} initialAssignee={addEsimCustomer ? { name: customerName(addEsimCustomer), email: addEsimCustomer.email } : null} onClose={() => setAddEsimCustomerId(null)} onAdd={handleAddEsim} />
      <ConfirmationModal open={Boolean(archiveCustomer)} title="Archive customer?" message={archiveCustomer ? `${customerName(archiveCustomer)} will be marked as archived. Assigned eSIMs remain in inventory and can be reassigned.` : ""} confirmLabel="Archive customer" onClose={() => setArchiveCustomerId(null)} onConfirm={confirmArchive} />
    </div>
  );
}
