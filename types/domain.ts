export type EsimStatus = "Active" | "Inactive" | "Suspended" | "Pending";
export type CustomerStatus = "Active" | "Inactive" | "Suspended" | "Archived";
export type PlanStatus = "Active" | "Inactive" | "Archived";
export type CurrencyCode = "GBP" | "EUR" | "USD";
export type AllowanceUnit = "GB" | "MB";
export type ValidityUnit = "Days" | "Months";
export type NetworkTechnology = "2G" | "3G" | "4G" | "LTE" | "5G";
export type NetworkStatus = "Active" | "Degraded" | "Unavailable" | "Disabled";
export type NetworkRegion = "Default" | "Europe" | "Asia" | "Latin America" | "Caribbean" | "Middle East" | "Balkans" | "Caucasus";
export type EntityType = "customer" | "esim" | "plan" | "network";
export type OperationStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type OperationType = "esim_activation" | "esim_assignment" | "plan_assignment" | "top_up" | "suspension" | "reactivation" | "esim_created" | "customer_created";
export type OperationEventStatus = "completed" | "processing" | "failed" | "pending";

export interface Country {
  id: string;
  code: string;
  iso3: string;
  name: string;
  region: string;
  networkRegion: NetworkRegion;
  apnName: string;
  autoApn: boolean;
  wifiHotspot: boolean;
}

export interface Operator {
  id: string;
  name: string;
  countryIds: readonly string[];
  logoAsset?: string;
}

export interface NetworkOperationalMetrics {
  availability: number;
  activationSuccessRate: number;
  averageLatencyMs: number;
  activeConnections: number;
}

export interface Network {
  id: string;
  countryId: string;
  operatorId: string;
  mcc: string;
  mnc: string;
  plmn: string;
  technologies: readonly NetworkTechnology[];
  status: NetworkStatus;
  metrics: NetworkOperationalMetrics;
  createdDate: string;
  updatedDate: string;
}

export interface ResolvedNetwork extends Network {
  country: Country;
  operator: Operator;
}

export interface PlanCoverage {
  id: string;
  countryId: string;
  networkIds: readonly string[];
}

export interface ResolvedPlanCoverage extends PlanCoverage {
  country: string;
  countryCode: string;
  region: string;
  operator?: string;
  networkId?: string;
  technologies: readonly NetworkTechnology[];
  networks: readonly ResolvedNetwork[];
}

export interface Plan {
  id: string;
  name: string;
  allowanceGb: number;
  allowanceUnit: AllowanceUnit;
  destination: string;
  validity: number;
  validityUnit: ValidityUnit;
  wholesaleCost: number;
  retailPrice: number;
  currency: CurrencyCode;
  hotspotAllowed: boolean;
  status: PlanStatus;
  coverage: readonly PlanCoverage[];
  createdDate: string;
  updatedDate: string;
}

export interface ResolvedPlan extends Omit<Plan, "coverage"> {
  coverage: readonly ResolvedPlanCoverage[];
}

export type ActivityEventType =
  | "customer-created"
  | "customer-status-changed"
  | "esim-assigned"
  | "esim-activated"
  | "esim-suspended"
  | "plan-added"
  | "top-up-completed"
  | "plan-created"
  | "price-changed"
  | "coverage-updated"
  | "plan-assigned"
  | "plan-activated"
  | "plan-deactivated"
  | "network-added"
  | "5g-enabled"
  | "plan-coverage-added"
  | "operator-updated"
  | "network-unavailable"
  | "network-restored"
  | "network-disabled";

export interface ActivityEvent {
  id: string;
  entityType: EntityType;
  entityId: string;
  type: ActivityEventType;
  title: string;
  detail: string;
  date: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryId: string;
  status: CustomerStatus;
  joinedDate: string;
  lifetimeSpend: number;
}

export interface ResolvedCustomer extends Customer {
  country: string;
  market: string;
  countryEntity: Country;
}

export interface ESim {
  id: string;
  label: string;
  iccid: string;
  customerId: string | null;
  planId: string;
  networkId: string | null;
  destination: string;
  dataUsedGb: number;
  status: EsimStatus;
  activationDate: string;
  expiryDate: string;
  lastActivity: string;
}

export interface Operation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  customerId?: string;
  esimId?: string;
  planId?: string;
  networkId?: string;
  createdAt: string;
  completedAt?: string;
  initiatedBy: string;
  errorCode?: string;
  errorMessage?: string;
  failedStep?: string;
  retryOfOperationId?: string;
}

export interface OperationEvent {
  id: string;
  operationId: string;
  label: string;
  detail: string;
  timestamp: string;
  status: OperationEventStatus;
}

export interface ApiApplication {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  createdAt: string;
}

export interface NewApiApplicationInput {
  name: string;
}

export interface NewCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryId: string;
  status?: CustomerStatus;
  joinedDate?: string;
  lifetimeSpend?: number;
}

export interface NewEsimInput {
  label: string;
  customerId: string | null;
  planId: string;
  networkId?: string | null;
  destination?: string;
  activateNow: boolean;
}

export interface UpdateEsimAssignmentInput {
  customerId: string | null;
  planId: string;
}

export interface NewPlanInput {
  name: string;
  allowanceValue: number;
  allowanceUnit: AllowanceUnit;
  validity: number;
  validityUnit: ValidityUnit;
  destination: string;
  wholesaleCost: number;
  retailPrice: number;
  currency: CurrencyCode;
  hotspotAllowed: boolean;
  status: PlanStatus;
  coverage?: readonly PlanCoverage[];
}

export interface NewNetworkInput {
  countryId: string;
  operatorId: string;
  mcc: string;
  mnc: string;
  technologies: readonly NetworkTechnology[];
  status: NetworkStatus;
}
