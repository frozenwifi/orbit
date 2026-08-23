import type { ResolvedOperation } from "@/types/operations";
import { OPERATION_REFERENCE_DATE, operationDurationMs } from "@/utils/operations";

interface OperationSummaryProps {
  operations: readonly ResolvedOperation[];
}

export function OperationSummary({ operations }: OperationSummaryProps) {
  const activationsToday = operations.filter((operation) => operation.type === "esim_activation" && operation.createdAt.startsWith(OPERATION_REFERENCE_DATE)).length;
  const pending = operations.filter((operation) => operation.status === "pending" || operation.status === "processing").length;
  const failed = operations.filter((operation) => operation.status === "failed").length;
  const successful = operations.filter((operation) => operation.status === "completed").length;
  const terminal = successful + failed;
  const successRate = terminal ? Math.round((successful / terminal) * 100) : 0;
  const completedDurations = operations.map(operationDurationMs).filter((value): value is number => value !== null);
  const averageSeconds = completedDurations.length ? Math.round(completedDurations.reduce((total, value) => total + value, 0) / completedDurations.length / 1000) : 0;
  const cards = [
    { label: "Activations today", value: activationsToday.toString(), helper: "Provisioning requests today", icon: "↗", tone: "brand" },
    { label: "Pending operations", value: pending.toString(), helper: "Pending or processing", icon: "…", tone: "warning" },
    { label: "Failed operations", value: failed.toString(), helper: "Available for review", icon: "!", tone: "danger" },
    { label: "Successful operations", value: successful.toString(), helper: `${successRate}% success · ${averageSeconds}s avg.`, icon: "✓", tone: "success" },
  ] as const;

  return (
    <section className="operation-summary-grid" aria-label="Operations summary">
      {cards.map((card) => <article className="card operation-summary-card card-lift" key={card.label}><span className={`operation-summary-icon tone-${card.tone}`} aria-hidden="true">{card.icon}</span><span className="operation-summary-copy"><span className="operation-summary-label">{card.label}</span><strong>{card.value}</strong><span className="operation-summary-helper">{card.helper}</span></span></article>)}
    </section>
  );
}
