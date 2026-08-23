import type { StatusBadgeTone } from "@/components/ui/StatusBadge";
import type { EsimStatus } from "@/types/esim";

export function statusTone(status: EsimStatus): StatusBadgeTone {
  if (status === "Active") return "success";
  if (status === "Suspended") return "danger";
  if (status === "Pending") return "warning";
  return "neutral";
}

export function formatOrbitDate(value: string) {
  if (value === "—") return value;
  return new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "UN";
}
