"use client";

import { useState } from "react";
import { DateRangeDropdown } from "@/components/dashboard/DateRangeDropdown";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { dateRanges, orders } from "@/data/dashboard";
import { useToast } from "@/components/providers/ToastProvider";

function exportReport() {
  const headers = ["ID", "Date", "Status", "ICCID", "Organization", "Product", "Revenue"];
  const rows = orders.map((order) => [order.id, order.date, order.status, order.iccid, order.organization, order.product, order.revenue]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "orbit-sales-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function SalesReportCard() {
  const [dateRange, setDateRange] = useState<string>(dateRanges[0]);
  const { showToast } = useToast();

  return (
    <section className="card sales-card card-lift" aria-labelledby="salesTitle">
      <div className="card-header">
        <h2 className="card-title" id="salesTitle">Sales reports</h2>
        <div className="sales-actions">
          <DateRangeDropdown placement="sales" value={dateRange} onChange={(range) => {
            setDateRange(range);
            showToast(`Dashboard range updated to ${range}`);
          }} />
          <button className="export-button" type="button" onClick={() => {
            exportReport();
            showToast("Sales report exported as CSV");
          }}>
            <span className="export-icon" aria-hidden="true">↥</span>
            Export report
          </button>
        </div>
      </div>
      <SalesChart />
    </section>
  );
}
