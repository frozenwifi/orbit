import type { ResolvedCustomer } from "@/types/domain";
import type { Esim } from "@/types/esim";
import { formatCurrency } from "@/utils/customers";

interface CustomerSummaryProps {
  customers: readonly ResolvedCustomer[];
  esims: readonly Esim[];
}

export function CustomerSummary({ customers, esims }: CustomerSummaryProps) {
  const active = customers.filter((customer) => customer.status === "Active").length;
  const activeEsimCustomers = new Set(esims.filter((esim) => esim.status === "Active" && esim.customerId).map((esim) => esim.customerId)).size;
  const totalValue = customers.reduce((total, customer) => total + customer.lifetimeSpend, 0);
  const averageValue = customers.length ? totalValue / customers.length : 0;
  const cards = [
    { label: "Total customers", value: customers.length.toString(), helper: "Across all markets", icon: "◎", tone: "brand" },
    { label: "Active customers", value: active.toString(), helper: `${customers.length ? Math.round((active / customers.length) * 100) : 0}% of customers`, icon: "✓", tone: "success" },
    { label: "With active eSIMs", value: activeEsimCustomers.toString(), helper: "Currently connected", icon: "⌁", tone: "brand" },
    { label: "Average spend", value: formatCurrency(averageValue), helper: `${formatCurrency(totalValue)} total value`, icon: "$", tone: "value" },
  ] as const;

  return (
    <section className="customer-summary-grid" aria-label="Customer summary">
      {cards.map((card) => (
        <article className="card customer-summary-card card-lift" key={card.label}>
          <span className={`customer-summary-icon tone-${card.tone}`} aria-hidden="true">{card.icon}</span>
          <span className="customer-summary-copy">
            <span className="customer-summary-label">{card.label}</span>
            <strong>{card.value}</strong>
            <span className="customer-summary-helper">{card.helper}</span>
          </span>
        </article>
      ))}
    </section>
  );
}
