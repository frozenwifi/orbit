import type { TeamUser } from "@/types/domain";

const defaultPermissions = {
  manageEsims: false,
  manageBilling: false,
  manageApiKeys: false,
  manageUsers: false,
} as const;

export const mockTeamUsers: readonly TeamUser[] = Array.from({ length: 12 }, (_, index) => ({
  id: `USER-${String(index + 1).padStart(4, "0")}`,
  name: "Adam Lambert",
  email: "adam@gmail.com",
  password: "OrbitDemo2026!",
  role: "Manager",
  permissions: { ...defaultPermissions },
  createdAt: `2026-07-${String(index + 1).padStart(2, "0")}`,
}));
