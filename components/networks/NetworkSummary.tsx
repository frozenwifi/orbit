import type { ResolvedNetwork } from "@/types/domain";
import { formatConnections } from "@/utils/networks";

interface NetworkSummaryProps {
  networks: readonly ResolvedNetwork[];
}

export function NetworkSummary({ networks }: NetworkSummaryProps) {
  const countries = new Set(networks.map((network) => network.countryId)).size;
  const operators = new Set(networks.map((network) => network.operatorId)).size;
  const fiveG = networks.filter((network) => network.technologies.includes("5G") && network.status !== "Disabled").length;
  const connections = networks.reduce((total, network) => total + network.metrics.activeConnections, 0);
  const cards = [
    { label: "Countries covered", value: countries.toString(), helper: "Across Orbit network markets", icon: "◎", tone: "brand" },
    { label: "Network operators", value: operators.toString(), helper: `${networks.length} configured networks`, icon: "⌁", tone: "brand" },
    { label: "5G-enabled networks", value: fiveG.toString(), helper: `${networks.length ? Math.round((fiveG / networks.length) * 100) : 0}% of configured networks`, icon: "5G", tone: "success" },
    { label: "Active connections", value: formatConnections(connections), helper: "Typed mock operational metric", icon: "↗", tone: "value" },
  ] as const;

  return (
    <section className="network-summary-grid" aria-label="Network summary">
      {cards.map((card) => <article className="card network-summary-card card-lift" key={card.label}><span className={`network-summary-icon tone-${card.tone}`} aria-hidden="true">{card.icon}</span><span className="network-summary-copy"><span className="network-summary-label">{card.label}</span><strong>{card.value}</strong><span className="network-summary-helper">{card.helper}</span></span></article>)}
    </section>
  );
}
