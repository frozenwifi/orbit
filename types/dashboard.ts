export type OrderStatus = "Paid" | "Canceled";

export interface DashboardMetric {
  value: string;
  label: string;
  icon: "arrow" | "customer" | "bars";
  trend: string;
  direction: "up" | "down";
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  iccid: string;
  organization: string;
  product: string;
  revenue: string;
}

export interface NavItem {
  label: string;
  asset: string;
  href?: string;
  expandable?: boolean;
  children?: readonly { label: string; href: string }[];
}

export type EarningsPeriod = "Monthly" | "Weekly" | "Yearly";
