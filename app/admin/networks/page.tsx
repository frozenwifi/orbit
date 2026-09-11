import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNetworkManagement } from "@/components/admin/networks/AdminNetworkManagement";

export const metadata: Metadata = {
  title: "Admin Regions",
};

export default function AdminNetworksPage() {
  return <Suspense fallback={null}><AdminNetworkManagement view="regions" /></Suspense>;
}
