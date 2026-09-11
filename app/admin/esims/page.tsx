import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminEsimManagement } from "@/components/admin/esims/AdminEsimManagement";

export const metadata: Metadata = {
  title: "Admin eSIMs",
};

export default function AdminEsimsPage() {
  return <Suspense fallback={null}><AdminEsimManagement /></Suspense>;
}
