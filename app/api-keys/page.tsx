import type { Metadata } from "next";
import { ApiKeysManagement } from "@/components/api-keys/ApiKeysManagement";

export const metadata: Metadata = { title: "API keys" };

export default function ApiKeysPage() {
  return <ApiKeysManagement />;
}
