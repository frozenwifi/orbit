"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Plan } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { formatPlanAllowance, formatPlanMoney, formatPlanValidity, grossMargin, grossProfit, planStatusTone } from "@/utils/plans";

interface PlanTableProps {
  plans: readonly Plan[];
  esims: readonly Esim[];
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onDuplicate: (plan: Plan) => void;
  onToggleStatus: (plan: Plan) => void;
  onArchive: (plan: Plan) => void;
}

export function PlanTable({ plans, esims, page, pageCount, totalCount, pageSize, onPageChange, onView, onEdit, onDuplicate, onToggleStatus, onArchive }: PlanTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <>
      <div className="plan-table-wrap">
        <table className="plan-table">
          <thead><tr><th scope="col">Plan</th><th scope="col">Coverage</th><th scope="col">Data allowance</th><th scope="col">Validity</th><th scope="col">Wholesale</th><th scope="col">Retail</th><th scope="col">Margin</th><th scope="col">Active eSIMs</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{plans.map((plan) => {
            const activeEsims = esims.filter((esim) => esim.planId === plan.id && esim.status === "Active").length;
            const margin = grossMargin(plan);
            return (
              <tr key={plan.id}>
                <td data-label="Plan"><button className="plan-identity" type="button" onClick={() => onView(plan)} aria-label={`Open details for ${plan.name}`}><span className="plan-icon" aria-hidden="true"><i /><i /><i /></span><span><strong>{plan.name}</strong><small>{plan.id}</small></span></button></td>
                <td data-label="Coverage"><span className="plan-coverage-cell"><strong>{plan.destination}</strong><small>{plan.coverage.length} market{plan.coverage.length === 1 ? "" : "s"}</small></span></td>
                <td data-label="Data allowance"><strong className="plan-value">{formatPlanAllowance(plan)}</strong></td>
                <td data-label="Validity"><span className="plan-coverage-cell"><strong>{formatPlanValidity(plan)}</strong><small>From activation</small></span></td>
                <td data-label="Wholesale"><strong className="plan-money">{formatPlanMoney(plan.wholesaleCost, plan.currency)}</strong></td>
                <td data-label="Retail"><strong className="plan-money">{formatPlanMoney(plan.retailPrice, plan.currency)}</strong></td>
                <td data-label="Margin"><span className="plan-margin-cell"><strong>{margin.toFixed(1)}%</strong><small>{formatPlanMoney(grossProfit(plan), plan.currency)} profit</small><i aria-hidden="true"><b style={{ width: `${Math.max(0, Math.min(100, margin))}%` }} /></i></span></td>
                <td data-label="Active eSIMs"><span className="plan-esim-count"><strong>{activeEsims}</strong><small>{esims.filter((esim) => esim.planId === plan.id).length} assigned</small></span></td>
                <td data-label="Status"><StatusBadge label={plan.status} tone={planStatusTone(plan.status)} /></td>
                <td data-label="Actions" className="plan-actions-cell"><Dropdown ariaLabel={`Actions for ${plan.name}`} className="plan-actions-wrap" menuClassName="control-menu plan-row-menu" trigger={({ isOpen, toggle, buttonRef, contentId }) => <button className="row-actions-button" type="button" aria-label={`Actions for ${plan.name}`} aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>•••</button>}>
                  {(close) => <><button type="button" role="menuitem" onClick={() => { close(); onView(plan); }}>View details</button><button type="button" role="menuitem" onClick={() => { close(); onEdit(plan); }}>Edit plan</button><button type="button" role="menuitem" onClick={() => { close(); onDuplicate(plan); }}>Duplicate plan</button><button type="button" role="menuitem" onClick={() => { close(); onToggleStatus(plan); }}>{plan.status === "Active" ? "Deactivate plan" : "Activate plan"}</button><button className="menu-danger" type="button" role="menuitem" onClick={() => { close(); onArchive(plan); }}>Archive plan</button></>}
                </Dropdown></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <footer className="plan-table-footer"><span>Showing {start}–{end} of {totalCount} plans</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="Data plan table pages" /></footer>
    </>
  );
}
