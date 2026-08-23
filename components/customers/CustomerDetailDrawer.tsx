"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EntityReference } from "@/components/ui/EntityReference";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import type { ActivityEvent, ResolvedCustomer } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { customerName, customerStatusTone, formatCurrency } from "@/utils/customers";
import { formatOrbitDate, getInitials, statusTone } from "@/utils/esims";

interface CustomerDetailDrawerProps {
  customer: ResolvedCustomer | null;
  esims: readonly Esim[];
  activities: readonly ActivityEvent[];
  onClose: () => void;
  onEdit: (customer: ResolvedCustomer) => void;
  onAssign: (customer: ResolvedCustomer) => void;
  onAddEsim: (customer: ResolvedCustomer) => void;
  onSuspend: (customer: ResolvedCustomer) => void;
  onArchive: (customer: ResolvedCustomer) => void;
}

export function CustomerDetailDrawer({ customer, esims, activities, onClose, onEdit, onAssign, onAddEsim, onSuspend, onArchive }: CustomerDetailDrawerProps) {
  const [tab, setTab] = useState("overview");
  useEffect(() => setTab("overview"), [customer?.id]);
  if (!customer) return null;

  const name = customerName(customer);
  const archived = customer.status === "Archived";
  const customerEsims = esims.filter((esim) => esim.customerId === customer.id);
  const activeEsims = customerEsims.filter((esim) => esim.status === "Active");
  const totalUsed = customerEsims.reduce((total, esim) => total + esim.dataUsedGb, 0);
  const totalAllowance = customerEsims.reduce((total, esim) => total + esim.plan.allowanceGb, 0);
  const customerActivities = activities.filter((activity) => activity.entityId === customer.id).sort((a, b) => b.date.localeCompare(a.date));

  const overview = (
    <div className="customer-detail-overview">
      <div className="customer-detail-hero"><span className="customer-detail-avatar" aria-hidden="true">{getInitials(name)}</span><div><strong>{name}</strong><span>{customer.id} · {customer.country}</span></div><StatusBadge label={customer.status} tone={customerStatusTone(customer.status)} /></div>
      <dl className="customer-detail-grid">
        <div><dt>Customer ID</dt><dd><code>{customer.id}</code></dd></div>
        <div><dt>Date joined</dt><dd>{formatOrbitDate(customer.joinedDate)}</dd></div>
        <div><dt>Email</dt><dd><a href={`mailto:${customer.email}`}>{customer.email}</a></dd></div>
        <div><dt>Phone</dt><dd><a href={`tel:${customer.phone}`}>{customer.phone}</a></dd></div>
        <div><dt>Country</dt><dd>{customer.country}<small>{customer.market} market</small></dd></div>
        <div><dt>Lifetime spend</dt><dd>{formatCurrency(customer.lifetimeSpend)}</dd></div>
        <div><dt>Active eSIMs</dt><dd>{activeEsims.length}<small>{customerEsims.length} assigned total</small></dd></div>
        <div><dt>Customer status</dt><dd>{customer.status}</dd></div>
      </dl>
      <section className="customer-quick-actions" aria-label="Customer management actions"><Button compact onClick={() => onEdit(customer)}>Edit customer</Button><Button compact disabled={archived} onClick={() => onSuspend(customer)}>{customer.status === "Suspended" ? "Reactivate" : "Suspend customer"}</Button></section>
    </div>
  );

  const esimList = customerEsims.length ? (
    <div className="customer-esim-list">{customerEsims.map((esim) => (
      <EntityReference className="customer-esim-card" entityType="esim" entityId={esim.id} key={esim.id} aria-label={`Open eSIM details for ${esim.label}`}>
        <span className="esim-signal" aria-hidden="true"><i /><i /><i /></span>
        <span className="customer-esim-card-main"><span><strong>{esim.label}</strong><small>{esim.id} · ICCID {esim.iccid.slice(-8)}</small></span><StatusBadge label={esim.status} tone={statusTone(esim.status)} /></span>
        <span className="customer-esim-card-meta"><span><small>Plan</small><strong>{esim.plan.name}</strong></span><span><small>Usage</small><strong>{esim.dataUsedGb.toFixed(1)} / {esim.plan.allowanceGb} GB</strong></span><span><small>Expiry</small><strong>{formatOrbitDate(esim.expiryDate)}</strong></span></span>
        <ProgressBar compact value={esim.dataUsedGb} max={esim.plan.allowanceGb} label={`Data usage for ${esim.label}`} />
      </EntityReference>
    ))}</div>
  ) : <div className="inline-empty"><span className="collection-state-icon" aria-hidden="true">⌁</span><strong>No eSIMs assigned</strong><span>Assign an existing eSIM or add a new one for this customer.</span><span className="inline-empty-actions"><Button compact onClick={() => onAssign(customer)}>Assign eSIM</Button><Button compact variant="primary" onClick={() => onAddEsim(customer)}>Add eSIM</Button></span></div>;

  const usage = (
    <div className="customer-usage-panel">
      <section className="aggregate-usage"><div><span>Aggregate data usage</span><strong>{totalUsed.toFixed(1)} GB <small>of {totalAllowance} GB</small></strong></div><ProgressBar value={totalUsed} max={totalAllowance || 1} label={`Aggregate data usage for ${name}`} /><p>{totalAllowance ? `${Math.max(0, totalAllowance - totalUsed).toFixed(1)} GB remaining across ${customerEsims.length} eSIM${customerEsims.length === 1 ? "" : "s"}` : "No active data allowance"}</p></section>
      <div className="usage-breakdown"><h3>Usage by eSIM</h3>{customerEsims.length ? customerEsims.map((esim) => <div className="usage-breakdown-row" key={esim.id}><span><strong>{esim.label}</strong><small>{esim.id} · {esim.plan.name}</small></span><span><strong>{esim.dataUsedGb.toFixed(1)} GB</strong><ProgressBar compact value={esim.dataUsedGb} max={esim.plan.allowanceGb} label={`Usage for ${esim.label}`} /></span></div>) : <div className="inline-empty compact"><strong>No usage yet</strong><span>Usage appears when an eSIM is assigned.</span></div>}</div>
    </div>
  );

  const activity = customerActivities.length ? (
    <ol className="customer-activity-list">{customerActivities.map((item) => <li key={item.id}><span className={`customer-activity-icon ${item.type}`} aria-hidden="true">{item.type === "top-up-completed" ? "+" : item.type === "esim-suspended" ? "!" : "✓"}</span><div><strong>{item.title}</strong><p>{item.detail}</p><time dateTime={item.date}>{formatOrbitDate(item.date)}</time></div></li>)}</ol>
  ) : <div className="inline-empty"><strong>No activity yet</strong><span>Customer events will appear here.</span></div>;

  return (
    <Drawer open title="Customer details" description="Manage customer identity, connectivity and activity." onClose={onClose} footer={(
      <><Button variant="ghost" className="danger-text" disabled={archived} onClick={() => onArchive(customer)}>Archive</Button><span className="drawer-footer-actions customer-drawer-actions"><Button onClick={() => onEdit(customer)}>Edit</Button><Button disabled={archived} onClick={() => onAssign(customer)}>Assign eSIM</Button><Button variant="primary" disabled={archived} onClick={() => onAddEsim(customer)}>Add eSIM</Button></span></>
    )}>
      <Tabs ariaLabel="Customer detail sections" value={tab} onValueChange={setTab} items={[{ id: "overview", label: "Overview", content: overview }, { id: "esims", label: `eSIMs (${customerEsims.length})`, content: esimList }, { id: "usage", label: "Usage", content: usage }, { id: "activity", label: "Activity", content: activity }]} />
    </Drawer>
  );
}
