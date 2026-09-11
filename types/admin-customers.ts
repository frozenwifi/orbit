export interface AdminCustomerInput {
  name: string;
  phone: string;
  countryId: string;
  notes: string;
}

export interface AdminCustomerRow {
  rowId: string;
  customerId: string;
  displayId: string;
  name: string;
  phone: string;
  notes: string;
  country: string;
  activeEsims: number;
}

export type AdminCustomerEsimStatus = "Activated" | "Awaiting activation" | "Deactivated";

export interface AdminCustomerEsimRow {
  rowId: string;
  esimId: string;
  orbitUid: string;
  iccid: string;
  status: AdminCustomerEsimStatus;
  totalUsage: string;
  tag: string;
}

export interface AdminExpensePoint {
  label: string;
  value: number;
}
