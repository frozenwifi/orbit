import type { DashboardMetric, EarningsPeriod, Order } from "@/types/dashboard";

export const metrics: readonly DashboardMetric[] = [
  { value: "3456", label: "sales", icon: "arrow", trend: "-15.03%", direction: "down" },
  { value: "10k", label: "customers", icon: "customer", trend: "+65.03%", direction: "up" },
  { value: "100k", label: "active eSims", icon: "bars", trend: "+45.03%", direction: "up" },
] as const;

export const orders: readonly Order[] = [
  { id: "#10421", date: "2024-04-04 22:07", status: "Paid", iccid: "8981100022152967705F", organization: "Turkish Airlines", product: "Test 1", revenue: "$140,20" },
  { id: "#10422", date: "2024-04-04 22:07", status: "Paid", iccid: "8981100022152967705F", organization: "Turkish Airlines", product: "Test 1", revenue: "$42,20" },
  { id: "#10423", date: "2024-04-04 22:07", status: "Canceled", iccid: "8981100022152967705F", organization: "Turkish Airlines", product: "Test 1", revenue: "$25,50" },
  { id: "#10424", date: "2024-04-04 22:07", status: "Paid", iccid: "8981100022152967705F", organization: "Turkish Airlines", product: "Test 1", revenue: "$25,50" },
  { id: "#10425", date: "2024-04-04 22:07", status: "Canceled", iccid: "8981100022152967705F", organization: "Turkish Airlines", product: "Test 1", revenue: "$44,90" },
  { id: "#10426", date: "2024-04-05 10:22", status: "Paid", iccid: "8981100022152968811F", organization: "Turkish Airlines", product: "Test 2", revenue: "$81,40" },
  { id: "#10427", date: "2024-04-05 12:04", status: "Paid", iccid: "8981100022152968829F", organization: "Turkish Airlines", product: "Test 2", revenue: "$67,20" },
  { id: "#10428", date: "2024-04-05 13:16", status: "Canceled", iccid: "8981100022152968837F", organization: "Turkish Airlines", product: "Test 3", revenue: "$19,90" },
  { id: "#10429", date: "2024-04-05 14:41", status: "Paid", iccid: "8981100022152968845F", organization: "Turkish Airlines", product: "Test 3", revenue: "$92,00" },
  { id: "#10430", date: "2024-04-05 16:20", status: "Paid", iccid: "8981100022152968852F", organization: "Turkish Airlines", product: "Test 4", revenue: "$38,50" },
] as const;

export const dateRanges = [
  "Dec 29, 2024 - Jan 4, 2025",
  "Dec 22, 2024 - Dec 28, 2024",
  "Jan 5, 2025 - Jan 11, 2025",
] as const;

export const earningsByPeriod: Record<EarningsPeriod, string> = {
  Monthly: "$12,560",
  Weekly: "$3,104",
  Yearly: "$148,220",
};

export const salesValues = [2200, 2350, 2700, 2920, 2840, 2520, 2410, 2860, 3290, 4280, 4300, 3890, 4330, 4710, 3790, 3010, 3290] as const;

export const salesLabels = ["Dec 29", "Dec 29", "Dec 30", "Dec 30", "Dec 30", "Dec 31", "Dec 31", "Dec 31", "Dec 31", "Jan 1", "Jan 1", "Jan 2", "Jan 2", "Jan 2", "Jan 3", "Jan 3", "Jan 4"] as const;
