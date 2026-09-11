import type { Metadata } from "next";
import { SubtenantCatalog } from "@/components/subtenants/SubtenantCatalog";

export const metadata: Metadata = { title: "Influencers" };
export default function InfluencersPage() { return <SubtenantCatalog kind="influencers" />; }
