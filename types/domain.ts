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
export type SubtenantKind = "brand-vno" | "business-roaming";
export type SubtenantStatus = "Active" | "Blocked";
export type InfluencerPlatform = "Instagram" | "TikTok" | "YouTube" | "X";
export type TeamUserRole = "Admin" | "Manager";
export type PaymentProvider = "Visa" | "Stripe";
export type InvoiceStatus = "Paid";

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
  subtenantId?: string;
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
  subtenantId?: string;
  notes?: string;
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
  subtenantId?: string;
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
  subtenantId?: string;
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
  subtenantId?: string;
}

export interface BillingAccount {
  id: string;
  subtenantId: string;
  creditBalance: number;
  currency: "USD";
}

export interface PaymentMethod {
  id: string;
  subtenantId: string;
  provider: PaymentProvider;
  last4: string;
  currency: "GBP";
  expiryMonth: string;
  expiryYear: string;
  nameOnCard: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface InvoiceParty {
  name: string;
  addressLines: readonly string[];
  taxId?: string;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  subtenantId: string;
  invoiceNumber: string;
  reference: string;
  invoiceDate: string;
  dueDate: string;
  tableDate: string;
  status: InvoiceStatus;
  currency: "USD";
  tableTotalDue: number;
  billedTo: InvoiceParty;
  billedFrom: InvoiceParty;
  issuer: InvoiceParty;
  lines: readonly InvoiceLine[];
  subtotal: number;
  taxRate: number;
  tax: number;
  totalDue: number;
  paymentNote: string;
  exchangeRateDisclaimer: string;
}

export interface Subtenant {
  id: string;
  name: string;
  kind: SubtenantKind;
  status: SubtenantStatus;
  balance: number;
  billingAddress: string;
  email: string;
  taxId: string;
  type: string;
  pricingCategory: string;
  salesTargetPercent: number;
  monthlyClientChange: number;
  monthlyEsimChange: number;
  discountPercent?: number;
  createdAt: string;
}

export interface Influencer {
  id: string;
  subtenantId?: string;
  name: string;
  platform: InfluencerPlatform;
  email: string;
  affiliateLink: string;
  clicks: number;
  conversionRate: number;
  registrationFee: number;
  totalEarnings: number;
  currency: CurrencyCode;
}

export interface TeamUserPermissions {
  manageEsims: boolean;
  manageBilling: boolean;
  manageApiKeys: boolean;
  manageUsers: boolean;
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: TeamUserRole;
  permissions: TeamUserPermissions;
  createdAt: string;
  passwordRecoveryRequestedAt?: string;
}

export interface NewTeamUserInput {
  name: string;
  email: string;
  password: string;
  role: TeamUserRole;
  permissions: TeamUserPermissions;
}

export interface NewSubtenantInput {
  name: string;
  kind: SubtenantKind;
  billingAddress: string;
  email: string;
  taxId: string;
  type: string;
  pricingCategory: string;
  discountPercent?: number;
}

export interface NewInfluencerInput {
  name: string;
  platform: InfluencerPlatform;
  email: string;
  registrationFee: number;
  clickRate: number;
  subtenantId?: string;
}

export interface NewApiApplicationInput {
  name: string;
}

export interface NewPaymentMethodInput {
  cardNumber: string;
  expiryDate: string;
  securityCode: string;
  nameOnCard: string;
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
  notes?: string;
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
