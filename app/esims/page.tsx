import type { Metadata } from "next";
import { Suspense } from "react";
import { EsimManagement } from "@/components/esims/EsimManagement";

export const metadata: Metadata = {
  title: "eSIMs",
};

export default function EsimsPage() {
  return <Suspense><EsimManagement /></Suspense>;
}
