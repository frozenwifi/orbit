import type { Metadata } from "next";
import { AdminBillingManagement } from "@/components/admin/billing/AdminBillingManagement";

export const metadata: Metadata = {
  title: "Admin Billing",
};

export default function AdminBillingPage() {
  return <AdminBillingManagement />;
}
