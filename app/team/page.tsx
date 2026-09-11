import type { Metadata } from "next";
import { TeamUsersManagement } from "@/components/team/TeamUsersManagement";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return <TeamUsersManagement />;
}
