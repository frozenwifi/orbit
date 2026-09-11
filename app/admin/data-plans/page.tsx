import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDataPlanManagement } from "@/components/admin/data-plans/AdminDataPlanManagement";

export const metadata: Metadata = {
  title: "Admin Data plans",
};

export default function AdminDataPlansPage() {
  return <Suspense fallback={null}><AdminDataPlanManagement /></Suspense>;
}
