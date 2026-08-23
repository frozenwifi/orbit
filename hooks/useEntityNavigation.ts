"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EntityType } from "@/types/domain";

export type DetailEntityType = EntityType | "operation";

const detailRoutes = {
  customer: { route: "/customers", parameter: "customer" },
  esim: { route: "/esims", parameter: "esim" },
  plan: { route: "/data-plans", parameter: "plan" },
  network: { route: "/networks", parameter: "network" },
  operation: { route: "/operations", parameter: "operation" },
} as const satisfies Record<DetailEntityType, { route: string; parameter: string }>;

export function entityDetailHref(entityType: DetailEntityType, entityId: string) {
  const detail = detailRoutes[entityType];
  return `${detail.route}?${detail.parameter}=${encodeURIComponent(entityId)}`;
}

export function useEntityNavigation() {
  const router = useRouter();
  const openEntity = useCallback((entityType: EntityType, entityId: string) => {
    router.push(entityDetailHref(entityType, entityId), { scroll: false });
  }, [router]);
  return { openEntity };
}

export function useEntityDetail(entityType: DetailEntityType) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detail = detailRoutes[entityType];
  const selectedId = pathname === detail.route ? searchParams.get(detail.parameter) : null;
  const openDetail = useCallback((entityId: string) => {
    router.push(entityDetailHref(entityType, entityId), { scroll: false });
  }, [entityType, router]);
  const closeDetail = useCallback(() => {
    router.replace(detail.route, { scroll: false });
  }, [detail.route, router]);
  return { selectedId, openDetail, closeDetail };
}
