import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminCustomerManagement } from "@/components/admin/customers/AdminCustomerManagement";

export const metadata: Metadata = {
  title: "Admin Customers",
};

export default function AdminCustomersPage() {
  return <Suspense fallback={null}><AdminCustomerManagement /></Suspense>;
}
