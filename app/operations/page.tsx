import type { Metadata } from "next";
import { Suspense } from "react";
import { OperationManagement } from "@/components/operations/OperationManagement";

export const metadata: Metadata = { title: "Operations" };

export default function OperationsPage() {
  return <Suspense><OperationManagement /></Suspense>;
}
