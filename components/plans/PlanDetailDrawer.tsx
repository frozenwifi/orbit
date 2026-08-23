"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EntityReference } from "@/components/ui/EntityReference";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import type { ActivityEvent, ResolvedPlan } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { customerName } from "@/utils/customers";
import { formatOrbitDate, statusTone } from "@/utils/esims";
import { formatPlanAllowance, formatPlanMoney, formatPlanValidity, grossMargin, grossProfit, planStatusTone } from "@/utils/plans";

interface PlanDetailDrawerProps {
  plan: ResolvedPlan | null;
  esims: readonly Esim[];
  activities: readonly ActivityEvent[];
  onClose: () => void;
  onEdit: (plan: ResolvedPlan) => void;
  onDuplicate: (plan: ResolvedPlan) => void;
  onToggleStatus: (plan: ResolvedPlan) => void;
  onArchive: (plan: ResolvedPlan) => void;
}

export function PlanDetailDrawer({ plan, esims, activities, onClose, onEdit, onDuplicate, onToggleStatus, onArchive }: PlanDetailDrawerProps) {
  const [tab, setTab] = useState("overview");
  useEffect(() => setTab("overview"), [plan?.id]);
  if (!plan) return null;

  const planEsims = esims.filter((esim) => esim.planId === plan.id);
  const planActivities = activities.filter((activity) => activity.entityId === plan.id).sort((a, b) => b.date.localeCompare(a.date));
  const margin = grossMargin(plan);
  const profit = grossProfit(plan);

  const overview = (
    <div className="plan-detail-overview">
      <div className="plan-detail-hero"><span className="plan-detail-icon" aria-hidden="true"><i /><i /><i /></span><div><strong>{plan.name}</strong><span>{plan.id} · {plan.destination}</span></div><StatusBadge label={plan.status} tone={planStatusTone(plan.status)} /></div>
      <dl className="plan-detail-grid">
        <div><dt>Plan ID</dt><dd><code>{plan.id}</code></dd></div>
        <div><dt>Data allowance</dt><dd>{formatPlanAllowance(plan)}</dd></div>
        <div><dt>Validity</dt><dd>{formatPlanValidity(plan)}<small>Starts on activation</small></dd></div>
        <div><dt>Coverage</dt><dd>{plan.destination}<small>{plan.coverage.length} included markets</small></dd></div>
        <div><dt>Hotspot</dt><dd>{plan.hotspotAllowed ? "Allowed" : "Not allowed"}</dd></div>
        <div><dt>Status</dt><dd>{plan.status}</dd></div>
        <div><dt>Created</dt><dd>{formatOrbitDate(plan.createdDate)}</dd></div>
        <div><dt>Last updated</dt><dd>{formatOrbitDate(plan.updatedDate)}</dd></div>
      </dl>
      <section className="plan-detail-pricing" aria-labelledby="plan-pricing-title"><div className="plan-detail-pricing-heading"><div><span id="plan-pricing-title">Pricing performance</span><small>Calculated from underlying plan values</small></div><strong>{margin.toFixed(1)}% <small>margin</small></strong></div><div className="plan-price-grid"><span><small>Wholesale cost</small><strong>{formatPlanMoney(plan.wholesaleCost, plan.currency)}</strong></span><span><small>Retail price</small><strong>{formatPlanMoney(plan.retailPrice, plan.currency)}</strong></span><span><small>Gross profit</small><strong>{formatPlanMoney(profit, plan.currency)}</strong></span></div><span className="plan-margin-track" aria-label={`${margin.toFixed(1)} percent gross margin`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(margin)}><i style={{ width: `${Math.max(0, Math.min(100, margin))}%` }} /></span></section>
    </div>
  );

  const coverage = plan.coverage.length ? (
    <div className="plan-coverage-list" role="list" aria-label={`Coverage included in ${plan.name}`}>{plan.coverage.map((entry) => <article className="plan-coverage-row" role="listitem" key={entry.id}><span className="coverage-country-code" aria-hidden="true">{entry.countryCode}</span><span className="coverage-country"><strong>{entry.country}</strong><small>{entry.region}</small></span><span className="coverage-operator"><small>Operator</small>{entry.networkId ? <EntityReference className="coverage-network-link" entityType="network" entityId={entry.networkId}>{entry.operator ?? "Multiple networks"}</EntityReference> : <strong>{entry.operator ?? "Multiple networks"}</strong>}</span><span className="coverage-tech" aria-label={`Technologies: ${entry.technologies.join(", ")}`}>{entry.technologies.map((technology) => <i key={technology}>{technology}</i>)}</span></article>)}</div>
  ) : <div className="inline-empty"><strong>No coverage configured</strong><span>Add a destination before activating this plan.</span></div>;

  const assignedEsims = planEsims.length ? (
    <div className="plan-esim-list">{planEsims.map((esim) => <article className="plan-esim-row" key={esim.id}>
      <EntityReference className="plan-esim-identity" entityType="esim" entityId={esim.id} aria-label={`Open eSIM details for ${esim.label}`}><span className="esim-signal" aria-hidden="true"><i /><i /><i /></span><span><strong>{esim.label}</strong><small>{esim.id} · ICCID {esim.iccid.slice(-8)}</small></span></EntityReference>
      <span className="plan-esim-assignee"><small>Customer</small>{esim.customer ? <EntityReference entityType="customer" entityId={esim.customer.id}>{customerName(esim.customer)}</EntityReference> : <strong>Unassigned</strong>}</span>
      <StatusBadge label={esim.status} tone={statusTone(esim.status)} />
      <span className="plan-esim-usage"><span><strong>{esim.dataUsedGb.toFixed(1)} GB</strong> / {formatPlanAllowance(plan)}</span><ProgressBar compact value={esim.dataUsedGb} max={plan.allowanceGb} label={`Data usage for ${esim.label}`} /></span>
      <span className="plan-esim-dates"><span><small>Activation</small><strong>{formatOrbitDate(esim.activationDate)}</strong></span><span><small>Expiry</small><strong>{formatOrbitDate(esim.expiryDate)}</strong></span></span>
    </article>)}</div>
  ) : <div className="inline-empty"><span className="collection-state-icon" aria-hidden="true">⌁</span><strong>No eSIMs use this plan</strong><span>Assignments from eSIM Management will appear here automatically.</span></div>;

  const activity = planActivities.length ? (
    <ol className="plan-activity-list">{planActivities.map((item) => <li key={item.id}><span className={`plan-activity-icon ${item.type}`} aria-hidden="true">{item.type === "price-changed" ? "$" : item.type === "plan-deactivated" ? "!" : "✓"}</span><div><strong>{item.title}</strong><p>{item.detail}</p><time dateTime={item.date}>{formatOrbitDate(item.date)}</time></div></li>)}</ol>
  ) : <div className="inline-empty"><strong>No plan activity yet</strong><span>Commercial and assignment changes will appear here.</span></div>;

  return (
    <Drawer open title="Data plan details" description="Manage pricing, coverage and inventory assignment." onClose={onClose} footer={(
      <><Button variant="ghost" className="danger-text" onClick={() => onArchive(plan)}>Archive</Button><span className="drawer-footer-actions plan-drawer-actions"><Button onClick={() => onEdit(plan)}>Edit</Button><Button onClick={() => onDuplicate(plan)}>Duplicate</Button><Button variant="primary" onClick={() => onToggleStatus(plan)}>{plan.status === "Active" ? "Deactivate" : "Activate"}</Button></span></>
    )}>
      <Tabs ariaLabel="Data plan detail sections" value={tab} onValueChange={setTab} items={[{ id: "overview", label: "Overview", content: overview }, { id: "coverage", label: `Coverage (${plan.coverage.length})`, content: coverage }, { id: "esims", label: `eSIMs (${planEsims.length})`, content: assignedEsims }, { id: "activity", label: "Activity", content: activity }]} />
    </Drawer>
  );
}
