import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerManagement } from "@/components/customers/CustomerManagement";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return <Suspense><CustomerManagement /></Suspense>;
}
