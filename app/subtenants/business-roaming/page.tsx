import type { Metadata } from "next";
import { SubtenantCatalog } from "@/components/subtenants/SubtenantCatalog";

export const metadata: Metadata = { title: "Business roaming" };
export default function BusinessRoamingPage() { return <SubtenantCatalog kind="business-roaming" />; }
