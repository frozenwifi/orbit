import type { EsimStatus } from "@/types/domain";

export type AdminEsimDisplayStatus = "Activated" | "Awaiting activation" | "Deactivated";

export interface AdminEsimRow {
  rowId: string;
  esimId: string;
  customerId: string | null;
  planId: string;
  orbitUid: string;
  dateAssigned: string;
  iccid: string;
  status: AdminEsimDisplayStatus;
  totalUsage: string;
  customerName: string;
  tag: string;
  canonicalStatus: EsimStatus;
}
