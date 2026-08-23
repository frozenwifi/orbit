"use client";

import { useMemo, useState } from "react";
import { DateRangeDropdown } from "@/components/dashboard/DateRangeDropdown";
import { useSearch } from "@/components/providers/SearchProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { dateRanges, orders } from "@/data/dashboard";
import type { Order } from "@/types/dashboard";

const headings = ["ID", "DATE", "STATUS", "ICCID", "ORGANIZATION", "PRODUCT", "REVENUE"] as const;

function OrderRow({ order }: { order: Order }) {
  const canceled = order.status === "Canceled";
  return (
    <tr>
      <td><span className="order-id"><input className="row-check" type="checkbox" aria-label={`Select order ${order.id}`} />{order.id}</span></td>
      <td>{order.date}</td>
      <td><span className={`status${canceled ? " canceled" : ""}`}><span className="status-dot" aria-hidden="true">{canceled ? "×" : "✓"}</span>{order.status}</span></td>
      <td>{order.iccid}</td>
      <td><span className="organization"><img src="/assets/turkish-airlines.png" alt="" />{order.organization}</span></td>
      <td>{order.product}</td>
      <td><span className="revenue"><span className="eye-icon" aria-hidden="true" />{order.revenue}</span></td>
    </tr>
  );
}

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<string>(dateRanges[0]);
  const { query } = useSearch();
  const { showToast } = useToast();

  const visibleOrders = useMemo(() => {
    const pageOrders = page === 1 ? orders.slice(0, 5) : orders.slice(5, 10);
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return pageOrders;
    return pageOrders.filter((order) => Object.values(order).some((value) => value.toLocaleLowerCase().includes(normalizedQuery)));
  }, [page, query]);

  return (
    <section className="card orders-card" aria-labelledby="ordersTitle">
      <div className="orders-header">
        <h2 className="card-title" id="ordersTitle">Recent orders</h2>
        <div className="orders-actions">
          <DateRangeDropdown placement="orders" value={dateRange} onChange={(range) => {
            setDateRange(range);
            showToast(`Orders range updated to ${range}`);
          }} />
        </div>
      </div>
      <div className="table-scroll">
        <table className="orders-table">
          <thead><tr>{headings.map((heading) => <th scope="col" key={heading}>{heading}<span className="sort-mark" aria-hidden="true">‹›</span></th>)}</tr></thead>
          <tbody>{visibleOrders.map((order) => <OrderRow order={order} key={order.id} />)}</tbody>
        </table>
      </div>
      <div className="table-footer">
        <span className="entries-label">Showing 1 to 10 of 12 entries</span>
        <div className="pager" aria-label="Order table pages">
          <button className="pager-button prev" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(1)}>‹</button>
          {[1, 2].map((pageNumber) => <button className={`pager-button page${page === pageNumber ? " active" : ""}`} key={pageNumber} type="button" aria-current={page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}
          <button className="pager-button next" type="button" aria-label="Next page" disabled={page === 2} onClick={() => setPage(2)}>›</button>
        </div>
        <span />
      </div>
    </section>
  );
}
