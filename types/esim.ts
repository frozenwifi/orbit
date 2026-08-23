import type { ESim, ResolvedCustomer, ResolvedNetwork, ResolvedPlan } from "@/types/domain";

export type { EsimStatus } from "@/types/domain";

export interface EsimUser {
  name: string;
  email: string;
  initials: string;
}

export interface Esim extends Omit<ESim, "planId"> {
  planId: string;
  customer: ResolvedCustomer | null;
  user: EsimUser | null;
  plan: ResolvedPlan;
  network: ResolvedNetwork | null;
  destination: string;
}

export type EsimCollectionState = "loading" | "ready" | "error";
