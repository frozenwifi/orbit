"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { Dropdown } from "@/components/ui/Dropdown";
import { useSearch } from "@/components/providers/SearchProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { adminDateRanges, adminEarningsByPeriod, adminMetrics, adminOrders } from "@/data/admin-dashboard";
import type { AdminDashboardMetric, AdminEarningsPeriod, AdminOrder } from "@/types/admin-dashboard";
import { downloadExcelTable } from "@/utils/export";

const orderHeadings = ["ID", "DATE", "STATUS", "ICCID", "ORGANIZATION", "PRODUCT", "REVENUE"] as const;
const earningsPeriods = Object.keys(adminEarningsByPeriod) as AdminEarningsPeriod[];

interface AdminDashboardProps {
  defaultEmpty?: boolean;
}

interface AdminDateDropdownProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

function AdminDateDropdown({ value, label, onChange }: AdminDateDropdownProps) {
  return (
    <Dropdown
      ariaLabel={label}
      className="admin-control-wrap"
      menuClassName="admin-control-menu"
      trigger={({ isOpen, toggle, buttonRef, contentId }) => (
        <button className="admin-date-button" type="button" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
          <span className="admin-calendar-icon" aria-hidden="true" />
          <span className="admin-date-label">{value}</span>
          <span className="admin-down-chevron" aria-hidden="true" />
        </button>
      )}
    >
      {(close) => adminDateRanges.map((range) => (
        <button className={range === value ? "selected" : undefined} key={range} type="button" role="menuitemradio" aria-checked={range === value} onClick={() => {
          onChange(range);
          close();
        }}>{range}</button>
      ))}
    </Dropdown>
  );
}

function AdminMetricIcon({ id }: Pick<AdminDashboardMetric, "id">) {
  if (id === "esims") {
    return <span className="admin-stat-icon" aria-hidden="true"><span className="admin-stat-symbol bars"><span className="admin-stat-bars"><i /><i /><i /></span></span></span>;
  }
  return <span className="admin-stat-icon" aria-hidden="true"><span className="admin-stat-symbol">{id === "sales" ? "↑" : "$"}</span></span>;
}

function AdminMetricCards({ empty }: { empty: boolean }) {
  return (
    <section className="admin-stats-grid" aria-label="Admin key performance indicators">
      {adminMetrics.map((metric) => (
        <article className="admin-card admin-stat-card" key={metric.id}>
          <AdminMetricIcon id={metric.id} />
          <span className="admin-stat-copy">
            <strong className="admin-stat-value">{empty ? "-" : metric.value}</strong>
            <span className="admin-stat-label">{metric.label}</span>
          </span>
          {!empty ? (
            <span className={`admin-stat-trend${metric.direction === "down" ? " negative" : ""}`}>
              <b aria-hidden="true">{metric.direction === "down" ? "↘" : "↗"}</b>
              {metric.trend}
            </span>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function AdminEarningsCard({ empty }: { empty: boolean }) {
  const [period, setPeriod] = useState<AdminEarningsPeriod>("Monthly");

  return (
    <section className={`admin-card admin-earnings-card${empty ? " empty" : ""}`} aria-labelledby="admin-earnings-title">
      <div className="admin-card-header">
        <h2 className="admin-card-title" id="admin-earnings-title">Earnings</h2>
        <Dropdown
          ariaLabel="Admin earnings period"
          className="admin-control-wrap"
          menuClassName="admin-control-menu admin-period-menu"
          trigger={({ isOpen, toggle, buttonRef, contentId }) => (
            <button className="admin-period-button" type="button" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={contentId} ref={buttonRef} onClick={toggle}>
              <span>{period}</span><span className="admin-down-chevron" aria-hidden="true" />
            </button>
          )}
        >
          {(close) => earningsPeriods.map((option) => (
            <button className={option === period ? "selected" : undefined} key={option} type="button" role="menuitemradio" aria-checked={option === period} onClick={() => {
              setPeriod(option);
              close();
            }}>{option}</button>
          ))}
        </Dropdown>
      </div>
      <div className="admin-earnings-content">
        <div className="admin-donut-wrap" aria-label={empty ? "No earnings balance" : `Earnings balance ${adminEarningsByPeriod[period]}`}>
          <div className="admin-donut" aria-hidden="true" />
          <div className="admin-donut-copy" key={`${period}-${empty}`}><strong>{empty ? "-" : adminEarningsByPeriod[period]}</strong><span>Balance</span></div>
        </div>
        <div className="admin-earnings-legend">
          <span className="admin-legend-dot fees" aria-hidden="true" /><strong>Fees</strong><span>{empty ? "-" : "$992.00"}</span>
          <span className="admin-legend-dot income" aria-hidden="true" /><strong>Income</strong><span>{empty ? "-" : "$10,092"}</span>
        </div>
      </div>
    </section>
  );
}

function AdminOrderRow({ order }: { order: AdminOrder }) {
  const canceled = order.status === "Canceled";
  return (
    <tr>
      <td>{order.id}</td>
      <td>{order.date}</td>
      <td><span className={`admin-order-status${canceled ? " canceled" : ""}`}><span aria-hidden="true">{canceled ? "×" : "✓"}</span>{order.status}</span></td>
      <td>{order.iccid}</td>
      <td><span className="admin-order-organization"><img src="/assets/turkish-airlines.png" alt="" />{order.organization}</span></td>
      <td>{order.product}</td>
      <td><span className="admin-order-revenue"><span className="admin-eye-icon" aria-hidden="true" />{order.revenue}</span></td>
    </tr>
  );
}

function AdminOrders({ empty, orders }: { empty: boolean; orders: readonly AdminOrder[] }) {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<string>(adminDateRanges[0]);
  const { showToast } = useToast();
  const visibleOrders = page === 1 ? orders.slice(0, 5) : orders.slice(5, 10);
  const showEmpty = empty || visibleOrders.length === 0;

  useEffect(() => setPage(1), [orders]);

  return (
    <section className={`admin-card admin-orders-card${showEmpty ? " empty" : ""}`} aria-labelledby="admin-orders-title">
      <div className="admin-orders-header">
        <h2 className="admin-card-title" id="admin-orders-title">Recent orders</h2>
        <div className="admin-orders-actions">
          <AdminDateDropdown value={dateRange} label="Recent orders date range" onChange={(range) => {
            setDateRange(range);
            showToast(`Orders range updated to ${range}`);
          }} />
        </div>
      </div>
      {showEmpty ? (
        <div className="admin-orders-empty" role="status">
          <span className="admin-orders-empty-icon" aria-hidden="true" />
          <strong>No recent orders</strong>
          <span>You don’t have any orders yet. Once you receive them, they will appear here.</span>
        </div>
      ) : (
        <>
          <div className="admin-table-scroll">
            <table className="admin-orders-table">
              <thead><tr>{orderHeadings.map((heading) => <th scope="col" key={heading}>{heading}<span className="admin-sort-mark" aria-hidden="true" /></th>)}</tr></thead>
              <tbody>{visibleOrders.map((order) => <AdminOrderRow order={order} key={order.id} />)}</tbody>
            </table>
          </div>
          <div className="admin-table-footer">
            <span className="admin-entries-label">Showing 1 to 10 of 12 entries</span>
            <div className="admin-pager" aria-label="Admin order table pages">
              <button className="admin-pager-button" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(1)}><span aria-hidden="true">‹</span></button>
              {[1, 2].map((pageNumber) => <button className={`admin-pager-button${page === pageNumber ? " active" : ""}`} key={pageNumber} type="button" aria-current={page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}
              <button className="admin-pager-button" type="button" aria-label="Next page" disabled={page === 2} onClick={() => setPage(2)}><span aria-hidden="true">›</span></button>
            </div>
            <span />
          </div>
        </>
      )}
    </section>
  );
}

export function AdminDashboard({ defaultEmpty = false }: AdminDashboardProps) {
  const [salesDateRange, setSalesDateRange] = useState<string>(adminDateRanges[0]);
  const { query } = useSearch();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return adminOrders;
    return adminOrders.filter((order) => Object.values(order).some((value) => value.toLocaleLowerCase().includes(normalizedQuery)));
  }, [query]);

  const exportOrders = () => {
    downloadExcelTable("orbit-admin-sales-report.xls", orderHeadings, adminOrders.map((order) => [order.id, order.date, order.status, order.iccid, order.organization, order.product, order.revenue]));
    showToast("Sales report exported to Excel");
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-welcome">Hello, Jane<span className="admin-welcome-caret" aria-hidden="true" /></h1>
      <div className="admin-top-grid">
        <div className="admin-sales-stack">
          <section className="admin-card admin-sales-card" aria-labelledby="admin-sales-title">
            <div className="admin-card-header">
              <h2 className="admin-card-title" id="admin-sales-title">Sales reports</h2>
              <div className="admin-sales-actions">
                <AdminDateDropdown value={salesDateRange} label="Sales report date range" onChange={(range) => {
                  setSalesDateRange(range);
                  showToast(`Dashboard range updated to ${range}`);
                }} />
                {!defaultEmpty ? <button className="admin-export-button" type="button" onClick={exportOrders}><span className="admin-export-icon" aria-hidden="true" />{theme === "dark" ? "Export report" : "Export excel"}</button> : null}
              </div>
            </div>
            <AdminSalesChart empty={defaultEmpty} />
          </section>
          <AdminMetricCards empty={defaultEmpty} />
        </div>
        <AdminEarningsCard empty={defaultEmpty} />
      </div>
      <AdminOrders empty={defaultEmpty} orders={visibleOrders} />
      <AdminFooter />
    </div>
  );
}
