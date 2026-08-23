import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanManagement } from "@/components/plans/PlanManagement";

export const metadata: Metadata = { title: "Data Plans" };

export default function DataPlansPage() {
  return <Suspense><PlanManagement /></Suspense>;
}
