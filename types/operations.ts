import type { Operation, OperationEvent, ResolvedCustomer, ResolvedNetwork, ResolvedPlan } from "@/types/domain";
import type { Esim } from "@/types/esim";

export interface ResolvedOperation extends Operation {
  customer: ResolvedCustomer | null;
  esim: Esim | null;
  plan: ResolvedPlan | null;
  network: ResolvedNetwork | null;
  events: readonly OperationEvent[];
}
