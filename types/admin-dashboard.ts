export type AdminOrderStatus = "Paid" | "Canceled";
export type AdminEarningsPeriod = "Monthly" | "Weekly" | "Yearly";

export interface AdminDashboardMetric {
  id: "sales" | "credit" | "esims";
  value: string;
  label: string;
  trend: string;
  direction: "up" | "down";
}

export interface AdminOrder {
  id: string;
  date: string;
  status: AdminOrderStatus;
  iccid: string;
  organization: string;
  product: string;
  revenue: string;
}

export interface AdminNavigationItem {
  label: string;
  asset: string;
  expandable?: boolean;
  children?: readonly string[];
}
