import type { StatusBadgeTone } from "@/components/ui/StatusBadge";
import type { Operation, OperationStatus, OperationType } from "@/types/domain";

export const OPERATION_REFERENCE_DATE = "2026-08-23";

const typeLabels: Record<OperationType, string> = {
  esim_activation: "eSIM activation",
  esim_assignment: "eSIM assignment",
  plan_assignment: "Plan assigned",
  top_up: "Top-up",
  suspension: "eSIM suspended",
  reactivation: "eSIM reactivation",
  esim_created: "eSIM created",
  customer_created: "Customer created",
};

export function operationTypeLabel(type: OperationType) {
  return typeLabels[type];
}

export function operationStatusLabel(status: OperationStatus) {
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

export function operationStatusTone(status: OperationStatus): StatusBadgeTone {
  if (status === "completed") return "success";
  if (status === "failed") return "danger";
  if (status === "processing") return "info";
  if (status === "pending") return "warning";
  return "neutral";
}

export function operationDurationMs(operation: Pick<Operation, "createdAt" | "completedAt">) {
  return operation.completedAt ? Math.max(0, Date.parse(operation.completedAt) - Date.parse(operation.createdAt)) : null;
}

export function formatOperationDuration(operation: Pick<Operation, "createdAt" | "completedAt">) {
  const duration = operationDurationMs(operation);
  if (duration === null) return "In progress";
  if (duration < 60_000) return `${Math.round(duration / 1000)} sec`;
  const minutes = Math.floor(duration / 60_000);
  const seconds = Math.round((duration % 60_000) / 1000);
  return seconds ? `${minutes}m ${seconds}s` : `${minutes} min`;
}

export function formatOperationDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Lisbon" }).format(new Date(value));
}

export function operationTypeIcon(type: OperationType) {
  if (type === "esim_activation" || type === "reactivation") return "↗";
  if (type === "suspension") return "Ⅱ";
  if (type === "top_up") return "+";
  if (type === "customer_created") return "☺";
  if (type === "plan_assignment") return "▥";
  return "◉";
}
