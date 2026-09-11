import type { Metadata } from "next";
import { SubtenantApiSection } from "@/components/subtenants/SubtenantApiSection";

export const metadata: Metadata = { title: "Subtenant API" };
export default function SubtenantApiPage() { return <SubtenantApiSection />; }
