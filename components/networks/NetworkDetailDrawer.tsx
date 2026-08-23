"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EntityReference } from "@/components/ui/EntityReference";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { TechnologyBadge } from "@/components/ui/TechnologyBadge";
import type { ActivityEvent, ResolvedNetwork, ResolvedPlan } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { customerName } from "@/utils/customers";
import { formatOrbitDate, statusTone } from "@/utils/esims";
import { formatConnections, formatMccMnc, formatPercent, networkStatusTone } from "@/utils/networks";
import { formatPlanAllowance, formatPlanMoney, formatPlanValidity, planStatusTone } from "@/utils/plans";

interface NetworkDetailDrawerProps {
  network: ResolvedNetwork | null;
  plans: readonly ResolvedPlan[];
  esims: readonly Esim[];
  activities: readonly ActivityEvent[];
  onClose: () => void;
  onEdit: (network: ResolvedNetwork) => void;
  onToggleStatus: (network: ResolvedNetwork) => void;
}

export function NetworkDetailDrawer({ network, plans, esims, activities, onClose, onEdit, onToggleStatus }: NetworkDetailDrawerProps) {
  const [tab, setTab] = useState("overview");
  useEffect(() => setTab("overview"), [network?.id]);
  if (!network) return null;
  const linkedPlans = plans.filter((plan) => plan.coverage.some((entry) => entry.networkIds.includes(network.id)));
  const activePlans = linkedPlans.filter((plan) => plan.status === "Active");
  const connections = esims.filter((esim) => esim.networkId === network.id);
  const activeConnections = connections.filter((esim) => esim.status === "Active");
  const networkActivities = activities.filter((activity) => activity.entityId === network.id).sort((a, b) => b.date.localeCompare(a.date));

  const overview = <div className="network-detail-overview">
    <div className="network-detail-hero"><span className="network-detail-code" aria-hidden="true">{network.country.code}</span><div><strong>{network.operator.name}</strong><span>{network.country.name} · {network.id}</span></div><StatusBadge label={network.status} tone={networkStatusTone(network.status)} /></div>
    <dl className="network-detail-grid">
      <div><dt>Country</dt><dd>{network.country.name}<small>{network.country.region}</small></dd></div>
      <div><dt>Operator</dt><dd>{network.operator.name}</dd></div>
      <div><dt>Network ID</dt><dd><code>{network.id}</code></dd></div>
      <div><dt>Combined MCC/MNC</dt><dd>{formatMccMnc(network.mcc, network.mnc)}<small>{network.mcc}{network.mnc}</small></dd></div>
      <div><dt>MCC</dt><dd>{network.mcc}</dd></div>
      <div><dt>MNC</dt><dd>{network.mnc}</dd></div>
      <div><dt>Active plans</dt><dd>{activePlans.length}<small>{linkedPlans.length} supported total</small></dd></div>
      <div><dt>Active eSIMs</dt><dd>{activeConnections.length}<small>{connections.length} assigned total</small></dd></div>
    </dl>
    <section className="network-technology-panel" aria-label="Supported network technologies"><span>Supported technologies</span><div>{network.technologies.map((technology) => <TechnologyBadge technology={technology} key={technology} />)}</div></section>
    <section className="network-operational-section" aria-labelledby="network-operational-title"><div className="network-section-heading"><h3 id="network-operational-title">Operational snapshot</h3><span>Typed mock telemetry</span></div><div className="network-operational-grid">
      <article><span>Availability</span><strong>{formatPercent(network.metrics.availability)}</strong><small>Current mock window</small></article>
      <article><span>Activation success</span><strong>{formatPercent(network.metrics.activationSuccessRate)}</strong><small>Recent mock attempts</small></article>
      <article><span>Average latency</span><strong>{network.metrics.averageLatencyMs} ms</strong><small>Indicative only</small></article>
      <article><span>Active connections</span><strong>{formatConnections(network.metrics.activeConnections)}</strong><small>Mock operator total</small></article>
    </div></section>
  </div>;

  const planList = linkedPlans.length ? <div className="network-plan-list">{linkedPlans.map((plan) => <article className="network-plan-row" key={plan.id}>
    <EntityReference className="network-plan-identity" entityType="plan" entityId={plan.id} aria-label={`Open data plan ${plan.name}`}><span className="plan-icon" aria-hidden="true"><i /><i /><i /></span><span><strong>{plan.name}</strong><small>{plan.id}</small></span></EntityReference>
    <span><small>Allowance</small><strong>{formatPlanAllowance(plan)}</strong></span><span><small>Validity</small><strong>{formatPlanValidity(plan)}</strong></span><span><small>Retail price</small><strong>{formatPlanMoney(plan.retailPrice, plan.currency)}</strong></span><StatusBadge label={plan.status} tone={planStatusTone(plan.status)} />
  </article>)}</div> : <div className="inline-empty"><span className="collection-state-icon" aria-hidden="true">⌁</span><strong>No plans use this network</strong><span>Plan coverage assignments will appear here automatically.</span></div>;

  const connectionList = connections.length ? <div className="network-connection-list">{connections.map((esim) => <article className="network-connection-row" key={esim.id}>
    <EntityReference className="network-connection-identity" entityType="esim" entityId={esim.id} aria-label={`Open eSIM details for ${esim.label}`}><span className="esim-signal" aria-hidden="true"><i /><i /><i /></span><span><strong>{esim.label}</strong><small>{esim.id} · ICCID {esim.iccid.slice(-8)}</small></span></EntityReference><StatusBadge label={esim.status} tone={statusTone(esim.status)} />
    <span className="network-connection-link"><small>Customer</small>{esim.customer ? <EntityReference entityType="customer" entityId={esim.customer.id}>{customerName(esim.customer)}</EntityReference> : <strong>Unassigned</strong>}</span>
    <span className="network-connection-link"><small>Plan</small><EntityReference entityType="plan" entityId={esim.planId}>{esim.plan.name}</EntityReference></span>
    <span className="network-connection-usage"><span><strong>{esim.dataUsedGb.toFixed(1)} GB</strong> / {formatPlanAllowance(esim.plan)}</span><ProgressBar compact value={esim.dataUsedGb} max={esim.plan.allowanceGb} label={`Usage for ${esim.label}`} /></span>
  </article>)}</div> : <div className="inline-empty"><span className="collection-state-icon" aria-hidden="true">⌁</span><strong>No eSIM connections</strong><span>eSIMs resolved to this network will appear here.</span></div>;

  const activity = networkActivities.length ? <ol className="network-activity-list">{networkActivities.map((item) => <li key={item.id}><span className={`network-activity-icon ${item.type}`} aria-hidden="true">{item.type === "network-unavailable" || item.type === "network-disabled" ? "!" : item.type === "5g-enabled" ? "5G" : "✓"}</span><div><strong>{item.title}</strong><p>{item.detail}</p><time dateTime={item.date}>{formatOrbitDate(item.date)}</time></div></li>)}</ol> : <div className="inline-empty"><strong>No network activity yet</strong><span>Catalog and operational events will appear here.</span></div>;

  return <Drawer open title="Network details" description="Review catalog coverage, linked products and mock operational health." onClose={onClose} footer={<><span /><span className="drawer-footer-actions network-drawer-actions"><Button onClick={() => onEdit(network)}>Edit configuration</Button><Button className={network.status === "Disabled" ? "" : "danger-text"} variant={network.status === "Disabled" ? "primary" : "ghost"} onClick={() => onToggleStatus(network)}>{network.status === "Disabled" ? "Enable network" : "Disable network"}</Button></span></>}>
    <Tabs ariaLabel="Network detail sections" value={tab} onValueChange={setTab} items={[{ id: "overview", label: "Overview", content: overview }, { id: "plans", label: `Plans (${linkedPlans.length})`, content: planList }, { id: "connections", label: `Connections (${connections.length})`, content: connectionList }, { id: "activity", label: "Activity", content: activity }]} />
  </Drawer>;
}
