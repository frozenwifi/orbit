import type { Metadata } from "next";
import { Suspense } from "react";
import { NetworkManagement } from "@/components/networks/NetworkManagement";

export const metadata: Metadata = { title: "Network operators" };

export default function NetworkOperatorsPage() {
  return <Suspense><NetworkManagement view="operators" /></Suspense>;
}
