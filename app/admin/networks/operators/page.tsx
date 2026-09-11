import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNetworkManagement } from "@/components/admin/networks/AdminNetworkManagement";

export const metadata: Metadata = {
  title: "Admin Network operators",
};

export default function AdminNetworkOperatorsPage() {
  return <Suspense fallback={null}><AdminNetworkManagement view="operators" /></Suspense>;
}
