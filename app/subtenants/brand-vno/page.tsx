import type { Metadata } from "next";
import { SubtenantCatalog } from "@/components/subtenants/SubtenantCatalog";

export const metadata: Metadata = { title: "Brand-VNO" };
export default function BrandVnoPage() { return <SubtenantCatalog kind="brand-vno" />; }
