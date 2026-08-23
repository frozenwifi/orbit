import type { StatusBadgeTone } from "@/components/ui/StatusBadge";
import type { NetworkStatus } from "@/types/domain";

export function networkStatusTone(status: NetworkStatus): StatusBadgeTone {
  if (status === "Active") return "success";
  if (status === "Degraded") return "warning";
  if (status === "Unavailable") return "danger";
  return "neutral";
}

export function formatMccMnc(mcc: string, mnc: string) {
  return `${mcc} / ${mnc}`;
}

export function formatConnections(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function countryFlag(code: string) {
  return String.fromCodePoint(...code.toLocaleUpperCase().split("").map((character) => 127397 + character.charCodeAt(0)));
}
