import type { Metadata } from "next";
import { SubtenantDetailWorkspace } from "@/components/subtenants/SubtenantDetailWorkspace";

export const metadata: Metadata = { title: "Subtenant details" };
export default async function BrandVnoDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SubtenantDetailWorkspace subtenantId={id} />; }
