import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

interface AdminDashboardPageProps {
  searchParams: Promise<{ state?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  return <AdminDashboard defaultEmpty={params.state === "empty"} />;
}
