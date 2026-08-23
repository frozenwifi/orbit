"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { Pagination } from "@/components/ui/Pagination";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ResolvedCustomer } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { customerName, customerStatusTone, formatCurrency } from "@/utils/customers";
import { formatOrbitDate, getInitials } from "@/utils/esims";

interface CustomerTableProps {
  customers: readonly ResolvedCustomer[];
  esims: readonly Esim[];
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (customer: ResolvedCustomer) => void;
  onEdit: (customer: ResolvedCustomer) => void;
  onAssign: (customer: ResolvedCustomer) => void;
  onAddEsim: (customer: ResolvedCustomer) => void;
  onSuspend: (customer: ResolvedCustomer) => void;
  onArchive: (customer: ResolvedCustomer) => void;
}

export function CustomerTable({ customers, esims, page, pageCount, totalCount, pageSize, onPageChange, onView, onEdit, onAssign, onAddEsim, onSuspend, onArchive }: CustomerTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <>
      <div className="customer-table-wrap">
        <table className="customer-table">
          <thead><tr><th scope="col">Customer</th><th scope="col">Contact</th><th scope="col">eSIMs</th><th scope="col">Active plan</th><th scope="col">Data usage</th><th scope="col">Spend</th><th scope="col">Status</th><th scope="col">Joined</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {customers.map((customer) => {
              const assigned = esims.filter((esim) => esim.customerId === customer.id);
              const primary = assigned.find((esim) => esim.status === "Active") ?? assigned[0] ?? null;
              const used = assigned.reduce((total, esim) => total + esim.dataUsedGb, 0);
              const allowance = assigned.reduce((total, esim) => total + esim.plan.allowanceGb, 0);
              const name = customerName(customer);
              return (
                <tr key={customer.id}>
                  <td data-label="Customer"><button className="customer-identity" type="button" onClick={() => onView(customer)} aria-label={`Open details for ${name}`}><span className="customer-avatar" aria-hidden="true">{getInitials(name)}</span><span><strong>{name}</strong><small>{customer.id} · {customer.country}</small></span></button></td>
                  <td data-label="Contact"><span className="customer-contact"><strong>{customer.email}</strong><small>{customer.phone}</small></span></td>
                  <td data-label="eSIMs"><span className="customer-esim-count"><strong>{assigned.length}</strong><small>{assigned.filter((esim) => esim.status === "Active").length} active</small></span></td>
                  <td data-label="Active plan"><span className="customer-plan"><strong>{primary?.plan.name ?? "No active plan"}</strong><small>{primary?.destination ?? "Unassigned"}</small></span></td>
                  <td data-label="Data usage">{allowance ? <span className="customer-usage"><span><strong>{used.toFixed(1)} GB</strong> / {allowance} GB</span><ProgressBar compact value={used} max={allowance} label={`Data usage for ${name}`} /></span> : <span className="customer-none">—</span>}</td>
                  <td data-label="Spend"><strong className="customer-spend">{formatCurrency(customer.lifetimeSpend)}</strong></td>
                  <td data-label="Status"><StatusBadge label={customer.status} tone={customerStatusTone(customer.status)} /></td>
                  <td data-label="Joined"><time dateTime={customer.joinedDate}>{formatOrbitDate(customer.joinedDate)}</time></td>
                  <td data-label="Actions" className="customer-actions-cell">
                    <Dropdown ariaLabel={`Actions for ${name}`} className="customer-actions-wrap" menuClassName="control-menu customer-row-menu" trigger={({ isOpen, toggle, buttonRef, contentId }) => <button className="row-actions-button" type="button" aria-label={`Actions for ${name}`} aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>•••</button>}>
                      {(close) => <><button type="button" role="menuitem" onClick={() => { close(); onView(customer); }}>View details</button><button type="button" role="menuitem" onClick={() => { close(); onEdit(customer); }}>Edit customer</button><button type="button" role="menuitem" disabled={customer.status === "Archived"} onClick={() => { close(); onAssign(customer); }}>Assign eSIM</button><button type="button" role="menuitem" disabled={customer.status === "Archived"} onClick={() => { close(); onAddEsim(customer); }}>Add eSIM</button><button type="button" role="menuitem" disabled={customer.status === "Archived"} onClick={() => { close(); onSuspend(customer); }}>{customer.status === "Suspended" ? "Reactivate customer" : "Suspend customer"}</button><button className="menu-danger" type="button" role="menuitem" disabled={customer.status === "Archived"} onClick={() => { close(); onArchive(customer); }}>Archive customer</button></>}
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <footer className="customer-table-footer"><span>Showing {start}–{end} of {totalCount} customers</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="Customer table pages" /></footer>
    </>
  );
}
