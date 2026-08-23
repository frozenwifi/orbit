import type { StatusBadgeTone } from "@/components/ui/StatusBadge";
import type { CurrencyCode, Plan, PlanStatus } from "@/types/domain";

export function grossProfit(plan: Pick<Plan, "retailPrice" | "wholesaleCost">) {
  return plan.retailPrice - plan.wholesaleCost;
}

export function grossMargin(plan: Pick<Plan, "retailPrice" | "wholesaleCost">) {
  return plan.retailPrice > 0 ? (grossProfit(plan) / plan.retailPrice) * 100 : 0;
}

export function formatPlanMoney(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatPlanAllowance(plan: Pick<Plan, "allowanceGb" | "allowanceUnit">) {
  const value = plan.allowanceUnit === "MB" ? plan.allowanceGb * 1024 : plan.allowanceGb;
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} ${plan.allowanceUnit}`;
}

export function formatPlanValidity(plan: Pick<Plan, "validity" | "validityUnit">) {
  return `${plan.validity} ${plan.validity === 1 ? plan.validityUnit.slice(0, -1) : plan.validityUnit}`;
}

export function planStatusTone(status: PlanStatus): StatusBadgeTone {
  if (status === "Active") return "success";
  if (status === "Archived") return "warning";
  return "neutral";
}
