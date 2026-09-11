import type { NavItem } from "@/types/dashboard";

export const navigationItems: readonly NavItem[] = [
  { label: "Dashboard", asset: "dashboard", href: "/" },
  { label: "Subtenants", asset: "subtenants", expandable: true, children: [{ label: "Brand-VNO", href: "/subtenants/brand-vno" }, { label: "Business roaming", href: "/subtenants/business-roaming" }, { label: "Influencers", href: "/subtenants/influencers" }, { label: "API", href: "/subtenants/api" }] },
  { label: "eSIMs", asset: "esims", href: "/esims" },
  { label: "Data plans", asset: "data-plans", href: "/data-plans" },
  { label: "Networks", asset: "networks", expandable: true, children: [{ label: "Regions", href: "/networks" }, { label: "Network operators", href: "/networks/operators" }] },
  { label: "API keys", asset: "api-keys", href: "/api-keys" },
  { label: "Operations", asset: "logs", href: "/operations" },
  { label: "Team", asset: "team", href: "/team" },
] as const;
