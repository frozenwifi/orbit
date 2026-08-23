"use client";

import { DataTable } from "@/components/ui/DataTable";
import { Dropdown } from "@/components/ui/Dropdown";
import { EntityReference } from "@/components/ui/EntityReference";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ResolvedOperation } from "@/types/operations";
import { customerName } from "@/utils/customers";
import { formatOperationDateTime, formatOperationDuration, operationStatusLabel, operationStatusTone, operationTypeIcon, operationTypeLabel } from "@/utils/operations";

interface OperationTableProps {
  operations: readonly ResolvedOperation[];
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (operation: ResolvedOperation) => void;
  onRetry: (operation: ResolvedOperation) => void;
}

const columns = [
  { id: "operation", label: "Operation" },
  { id: "customer", label: "Customer" },
  { id: "esim", label: "eSIM" },
  { id: "plan", label: "Plan" },
  { id: "network", label: "Network" },
  { id: "status", label: "Status" },
  { id: "initiated", label: "Initiated" },
  { id: "duration", label: "Duration" },
  { id: "actions", label: "Actions", screenReaderOnly: true },
] as const;

export function OperationTable({ operations, page, pageCount, totalCount, pageSize, onPageChange, onView, onRetry }: OperationTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);
  return (
    <>
      <DataTable columns={columns} className="operation-table" wrapperClassName="operation-table-wrap">
        {operations.map((operation) => <tr key={operation.id}>
          <td data-label="Operation"><button className="operation-identity" type="button" onClick={() => onView(operation)} aria-label={`Open details for ${operationTypeLabel(operation.type)} ${operation.id}`}><span className={`operation-type-icon type-${operation.type}`} aria-hidden="true">{operationTypeIcon(operation.type)}</span><span><strong>{operationTypeLabel(operation.type)}</strong><small>{operation.id}</small></span></button></td>
          <td data-label="Customer">{operation.customer ? <EntityReference className="operation-entity-link" entityType="customer" entityId={operation.customer.id}><strong>{customerName(operation.customer)}</strong><small>{operation.customer.id}</small></EntityReference> : <span className="operation-muted">—</span>}</td>
          <td data-label="eSIM">{operation.esim ? <EntityReference className="operation-entity-link" entityType="esim" entityId={operation.esim.id}><strong>{operation.esim.label}</strong><small>{operation.esim.id} · {operation.esim.iccid.slice(-6)}</small></EntityReference> : <span className="operation-muted">—</span>}</td>
          <td data-label="Plan">{operation.plan ? <EntityReference className="operation-entity-link" entityType="plan" entityId={operation.plan.id}><strong>{operation.plan.name}</strong><small>{operation.plan.id}</small></EntityReference> : <span className="operation-muted">—</span>}</td>
          <td data-label="Network">{operation.network ? <EntityReference className="operation-entity-link" entityType="network" entityId={operation.network.id}><strong>{operation.network.operator.name}</strong><small>{operation.network.country.name}</small></EntityReference> : <span className="operation-muted">—</span>}</td>
          <td data-label="Status"><StatusBadge label={operationStatusLabel(operation.status)} tone={operationStatusTone(operation.status)} /></td>
          <td data-label="Initiated"><span className="operation-time"><strong>{formatOperationDateTime(operation.createdAt)}</strong><small>{operation.initiatedBy}</small></span></td>
          <td data-label="Duration"><span className="operation-duration">{formatOperationDuration(operation)}</span></td>
          <td data-label="Actions" className="operation-actions-cell"><Dropdown ariaLabel={`Actions for operation ${operation.id}`} className="operation-actions-wrap" menuClassName="control-menu operation-row-menu" trigger={({ isOpen, toggle, buttonRef, contentId }) => <button className="row-actions-button" type="button" aria-label={`Actions for operation ${operation.id}`} aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>•••</button>}>
            {(close) => <><button type="button" role="menuitem" onClick={() => { close(); onView(operation); }}>View details</button>{operation.status === "failed" ? <button type="button" role="menuitem" onClick={() => { close(); onRetry(operation); }}>Retry operation</button> : null}</>}
          </Dropdown></td>
        </tr>)}
      </DataTable>
      <footer className="operation-table-footer"><span>Showing {start}–{end} of {totalCount} operations</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="Operation table pages" /></footer>
    </>
  );
}
