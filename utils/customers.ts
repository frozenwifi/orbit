import type { StatusBadgeTone } from "@/components/ui/StatusBadge";
import type { Customer, CustomerStatus } from "@/types/domain";

export function customerName(customer: Customer) {
  return `${customer.firstName} ${customer.lastName}`;
}

export function customerStatusTone(status: CustomerStatus): StatusBadgeTone {
  if (status === "Active") return "success";
  if (status === "Suspended") return "danger";
  if (status === "Archived") return "warning";
  return "neutral";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value >= 1000 ? 0 : 2 }).format(value);
}
