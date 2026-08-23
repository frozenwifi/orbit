import { EarningsCard } from "@/components/dashboard/EarningsCard";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { OrbitFooter } from "@/components/dashboard/OrbitFooter";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { SalesReportCard } from "@/components/dashboard/SalesReportCard";

export function Dashboard() {
  return (
    <div className="dashboard">
      <h1 className="welcome">Hello, Jane<span className="welcome-caret" aria-hidden="true" /></h1>
      <div className="top-grid">
        <div className="sales-stack">
          <SalesReportCard />
          <MetricCards />
        </div>
        <EarningsCard />
      </div>
      <OrdersTable />
      <OrbitFooter />
    </div>
  );
}
