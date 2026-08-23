import type { Metadata } from "next";
import { Suspense } from "react";
import { NetworkManagement } from "@/components/networks/NetworkManagement";

export const metadata: Metadata = { title: "Networks" };

export default function NetworksPage() {
  return <Suspense><NetworkManagement view="regions" /></Suspense>;
}
