import type { ResolvedPlan } from "@/types/domain";
import { grossMargin } from "@/utils/plans";

interface PlanSummaryProps {
  plans: readonly ResolvedPlan[];
}

export function PlanSummary({ plans }: PlanSummaryProps) {
  const active = plans.filter((plan) => plan.status === "Active").length;
  const countries = new Set(plans.flatMap((plan) => plan.coverage.map((entry) => entry.country))).size;
  const regions = new Set(plans.flatMap((plan) => plan.coverage.map((entry) => entry.region))).size;
  const averageMargin = plans.length ? plans.reduce((total, plan) => total + grossMargin(plan), 0) / plans.length : 0;
  const cards = [
    { label: "Total plans", value: plans.length.toString(), helper: "Across the Orbit catalog", icon: "▤", tone: "brand" },
    { label: "Active plans", value: active.toString(), helper: `${plans.length ? Math.round((active / plans.length) * 100) : 0}% of catalog`, icon: "✓", tone: "success" },
    { label: "Countries / regions", value: countries.toString(), helper: `Across ${regions} coverage regions`, icon: "◎", tone: "brand" },
    { label: "Average gross margin", value: `${averageMargin.toFixed(1)}%`, helper: "Calculated from live pricing", icon: "%", tone: "value" },
  ] as const;

  return (
    <section className="plan-summary-grid" aria-label="Data plan summary">
      {cards.map((card) => (
        <article className="card plan-summary-card card-lift" key={card.label}>
          <span className={`plan-summary-icon tone-${card.tone}`} aria-hidden="true">{card.icon}</span>
          <span className="plan-summary-copy"><span className="plan-summary-label">{card.label}</span><strong>{card.value}</strong><span className="plan-summary-helper">{card.helper}</span></span>
        </article>
      ))}
    </section>
  );
}
