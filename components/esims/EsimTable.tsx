"use client";

import { EntityReference } from "@/components/ui/EntityReference";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Esim } from "@/types/esim";
import { statusTone } from "@/utils/esims";

interface EsimTableProps {
  esims: readonly Esim[];
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (esim: Esim) => void;
  onRemove: (esim: Esim) => void;
}

function assignedAt(esim: Esim) {
  if (esim.activationDate === "—") return "Not assigned";
  const date = new Date(`${esim.activationDate}T22:07:00`);
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date).replace(",", "");
}

function displayStatus(esim: Esim) {
  return esim.status === "Pending" ? "Awaiting activation" : esim.status;
}

export function EsimTable({ esims, page, pageCount, totalCount, pageSize, onPageChange, onView, onRemove }: EsimTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <>
      <div className="esim-table-wrap">
        <table className="esim-table">
          <thead>
            <tr>
              <th scope="col">ID <span aria-hidden="true">⌃</span></th>
              <th scope="col">Date assigned <span aria-hidden="true">⌃</span></th>
              <th scope="col">eSIM ICCID <span aria-hidden="true">⌃</span></th>
              <th scope="col">eSIM status <span aria-hidden="true">⌃</span></th>
              <th scope="col">Subtenant <span aria-hidden="true">⌃</span></th>
              <th scope="col">eSIM tag <span aria-hidden="true">⌃</span></th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {esims.map((esim) => (
              <tr key={esim.id}>
                <td data-label="ID"><button className="esim-table-link esim-id-link" type="button" onClick={() => onView(esim)} aria-label={`Open ${esim.id} details`}>{esim.id}</button></td>
                <td data-label="Date assigned"><span className={esim.activationDate === "—" ? "esim-table-muted" : ""}>{assignedAt(esim)}</span></td>
                <td data-label="eSIM ICCID"><button className="esim-table-link" type="button" onClick={() => onView(esim)} aria-label={`Open eSIM with ICCID ${esim.iccid}`}>{esim.iccid}</button></td>
                <td data-label="eSIM status"><StatusBadge label={displayStatus(esim)} tone={statusTone(esim.status)} /></td>
                <td data-label="Subtenant">{esim.customer ? <EntityReference className="esim-table-link esim-subtenant-link" entityType="customer" entityId={esim.customer.id}>{esim.user?.name}</EntityReference> : <span className="esim-table-muted">Unassigned</span>}</td>
                <td data-label="eSIM tag"><span className="esim-tag-cell" title={esim.label}>{esim.label}</span></td>
                <td data-label="Actions" className="esim-actions-cell"><button className="esim-delete-button" type="button" onClick={() => onRemove(esim)} aria-label={`Remove ${esim.id}`} title="Remove eSIM"><span className="esim-delete-glyph" aria-hidden="true" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="esim-table-footer">
        <span>Showing {start} to {end} of {totalCount} entries</span>
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="eSIM table pages" />
      </footer>
    </>
  );
}
