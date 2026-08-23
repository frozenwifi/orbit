"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EntityReference } from "@/components/ui/EntityReference";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ResolvedOperation } from "@/types/operations";
import { customerName } from "@/utils/customers";
import { formatOperationDateTime, formatOperationDuration, operationStatusLabel, operationStatusTone, operationTypeIcon, operationTypeLabel } from "@/utils/operations";

interface OperationDetailDrawerProps {
  operation: ResolvedOperation | null;
  onClose: () => void;
  onRetry: (operation: ResolvedOperation) => void;
}

export function OperationDetailDrawer({ operation, onClose, onRetry }: OperationDetailDrawerProps) {
  if (!operation) return null;
  const links = [
    operation.customer ? { type: "customer" as const, id: operation.customer.id, label: "Customer", value: customerName(operation.customer), meta: operation.customer.id } : null,
    operation.esim ? { type: "esim" as const, id: operation.esim.id, label: "eSIM", value: operation.esim.label, meta: `${operation.esim.id} · ICCID ${operation.esim.iccid.slice(-8)}` } : null,
    operation.plan ? { type: "plan" as const, id: operation.plan.id, label: "Plan", value: operation.plan.name, meta: operation.plan.id } : null,
    operation.network ? { type: "network" as const, id: operation.network.id, label: "Network", value: operation.network.operator.name, meta: `${operation.network.country.name} · ${operation.network.id}` } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <Drawer open title="Operation details" description="Review lifecycle progress and linked Orbit entities." onClose={onClose} footer={operation.status === "failed" ? <><span className="drawer-footer-note">Deterministic mock retry</span><Button variant="primary" onClick={() => onRetry(operation)}>Retry operation</Button></> : undefined}>
    <div className="operation-detail-overview">
      <div className="operation-detail-hero"><span className={`operation-detail-icon type-${operation.type}`} aria-hidden="true">{operationTypeIcon(operation.type)}</span><div><strong>{operationTypeLabel(operation.type)}</strong><span>{operation.id}</span></div><StatusBadge label={operationStatusLabel(operation.status)} tone={operationStatusTone(operation.status)} /></div>
      <dl className="operation-detail-grid">
        <div><dt>Operation ID</dt><dd><code>{operation.id}</code></dd></div>
        <div><dt>Operation type</dt><dd>{operationTypeLabel(operation.type)}</dd></div>
        <div><dt>Created</dt><dd>{formatOperationDateTime(operation.createdAt)}</dd></div>
        <div><dt>Completed</dt><dd>{formatOperationDateTime(operation.completedAt)}</dd></div>
        <div><dt>Duration</dt><dd>{formatOperationDuration(operation)}</dd></div>
        <div><dt>Initiated by</dt><dd>{operation.initiatedBy}</dd></div>
      </dl>
      {operation.retryOfOperationId ? <section className="operation-retry-note"><span aria-hidden="true">↻</span><div><strong>Retry of {operation.retryOfOperationId}</strong><p>This operation was created by Orbit's deterministic mock retry workflow.</p></div></section> : null}
      {operation.status === "failed" ? <section className="operation-failure" role="alert"><span className="operation-failure-icon" aria-hidden="true">!</span><div><strong>{operation.errorCode}</strong><p>{operation.errorMessage}</p><small>Failed step: {operation.failedStep}</small></div></section> : null}
      <section className="operation-linked-section" aria-labelledby="operation-linked-title"><div className="operation-section-heading"><h3 id="operation-linked-title">Linked entities</h3><span>Canonical Orbit records</span></div>{links.length ? <div className="operation-linked-grid">{links.map((item) => <EntityReference className="operation-linked-card" entityType={item.type} entityId={item.id} key={`${item.type}-${item.id}`}><span>{item.label}</span><strong>{item.value}</strong><small>{item.meta}</small><i aria-hidden="true">›</i></EntityReference>)}</div> : <div className="inline-empty"><strong>No linked product entities</strong><span>This operation only references its initiating workflow.</span></div>}</section>
      <section className="operation-lifecycle-section" aria-labelledby="operation-lifecycle-title"><div className="operation-section-heading"><h3 id="operation-lifecycle-title">Operational timeline</h3><span>{operation.events.length} lifecycle steps</span></div><ol className="operation-timeline">{operation.events.map((event) => <li className={`status-${event.status}`} key={event.id}><span className="operation-timeline-icon" aria-hidden="true">{event.status === "failed" ? "!" : event.status === "processing" ? "…" : event.status === "pending" ? "○" : "✓"}</span><div><strong>{event.label}</strong><p>{event.detail}</p><time dateTime={event.timestamp}>{formatOperationDateTime(event.timestamp)}</time></div></li>)}</ol></section>
    </div>
  </Drawer>;
}
