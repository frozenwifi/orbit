import { metrics } from "@/data/dashboard";
import type { DashboardMetric } from "@/types/dashboard";

function MetricIcon({ metric }: { metric: DashboardMetric }) {
  if (metric.icon === "bars") {
    return <span className="stat-icon chart-bars" aria-hidden="true"><i /><i /><i /></span>;
  }
  return <span className="stat-icon" aria-hidden="true">{metric.icon === "arrow" ? "↑" : "☺"}</span>;
}

export function MetricCards() {
  return (
    <section className="stats-grid" aria-label="Key performance indicators">
      {metrics.map((metric) => (
        <article className="card stat-card card-lift" key={metric.label}>
          <MetricIcon metric={metric} />
          <span className="stat-copy">
            <strong className="stat-value">{metric.value}</strong>
            <span className="stat-label">{metric.label}</span>
          </span>
          <span className={`stat-trend${metric.direction === "down" ? " negative" : ""}`}>
            <b aria-hidden="true">{metric.direction === "down" ? "↘" : "↗"}</b>
            {metric.trend}
          </span>
        </article>
      ))}
    </section>
  );
}
