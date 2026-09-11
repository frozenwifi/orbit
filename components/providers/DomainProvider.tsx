"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import { createInitialDomainState, LocalOrbitRepository, type OrbitDomainState } from "@/data/domain-repository";
import { assertDomainIntegrity } from "@/data/domain-validation";
import type { ActivityEvent, ApiApplication, Country, Customer, CustomerStatus, ESim, EsimStatus, Influencer, Network, NetworkStatus, NewApiApplicationInput, NewCustomerInput, NewEsimInput, NewInfluencerInput, NewNetworkInput, NewPaymentMethodInput, NewPlanInput, NewSubtenantInput, NewTeamUserInput, Operation, OperationEvent, OperationType, Operator, PaymentMethod, Plan, PlanCoverage, PlanStatus, ResolvedCustomer, ResolvedNetwork, ResolvedPlan, Subtenant, SubtenantStatus, TeamUser, TeamUserRole, UpdateEsimAssignmentInput } from "@/types/domain";
import type { Esim } from "@/types/esim";
import type { ResolvedOperation } from "@/types/operations";
import type { AdminCustomerInput } from "@/types/admin-customers";

interface DomainContextValue {
  repository: LocalOrbitRepository;
  customers: ResolvedCustomer[];
  esims: ESim[];
  plans: ResolvedPlan[];
  countries: readonly Country[];
  operators: readonly Operator[];
  networks: Network[];
  resolvedNetworks: ResolvedNetwork[];
  activities: ActivityEvent[];
  planActivities: ActivityEvent[];
  networkActivities: ActivityEvent[];
  resolvedEsims: Esim[];
  operations: ResolvedOperation[];
  apiApplications: ApiApplication[];
  subtenants: Subtenant[];
  influencers: Influencer[];
  teamUsers: TeamUser[];
  createCustomer: (input: NewCustomerInput) => Customer;
  updateCustomer: (id: string, input: NewCustomerInput) => void;
  setCustomerStatus: (id: string, status: CustomerStatus) => void;
  createCustomerForSubtenant: (subtenantId: string, input: AdminCustomerInput) => Customer;
  updateCustomerForSubtenant: (subtenantId: string, id: string, input: AdminCustomerInput) => void;
  deleteCustomerForSubtenant: (subtenantId: string, id: string) => void;
  createEsim: (input: NewEsimInput) => ESim;
  updateEsimAssignment: (id: string, input: UpdateEsimAssignmentInput) => void;
  updateEsimStatus: (id: string, status: EsimStatus) => void;
  removeEsim: (id: string) => void;
  createEsimForSubtenant: (subtenantId: string, input: NewEsimInput) => ESim;
  updateEsimStatusForSubtenant: (subtenantId: string, id: string, status: EsimStatus) => void;
  updateEsimTagForSubtenant: (subtenantId: string, id: string, label: string) => void;
  removeEsimForSubtenant: (subtenantId: string, id: string) => void;
  assignEsim: (esimId: string, customerId: string | null) => void;
  createPlan: (input: NewPlanInput) => Plan;
  updatePlan: (id: string, input: NewPlanInput) => void;
  setPlanStatus: (id: string, status: PlanStatus) => void;
  createNetwork: (input: NewNetworkInput) => Network;
  updateNetwork: (id: string, input: NewNetworkInput) => void;
  setNetworkStatus: (id: string, status: NetworkStatus) => void;
  retryOperation: (id: string) => Operation;
  createApiApplication: (input: NewApiApplicationInput) => ApiApplication;
  revokeApiApplication: (id: string) => void;
  createSubtenant: (input: NewSubtenantInput) => Subtenant;
  updateSubtenant: (id: string, input: NewSubtenantInput) => void;
  setSubtenantStatus: (id: string, status: SubtenantStatus) => void;
  deleteSubtenant: (id: string) => void;
  createInfluencer: (input: NewInfluencerInput) => Influencer;
  createTeamUser: (input: NewTeamUserInput) => TeamUser;
  updateTeamUser: (id: string, input: NewTeamUserInput) => void;
  updateTeamUserRole: (id: string, role: TeamUserRole) => void;
  requestTeamUserPasswordRecovery: (id: string) => void;
  removeTeamUser: (id: string) => void;
  addCreditForSubtenant: (subtenantId: string, amount: number, paymentMethodId: string) => void;
  addPaymentMethodForSubtenant: (subtenantId: string, input: NewPaymentMethodInput) => PaymentMethod;
  setPrimaryPaymentMethodForSubtenant: (subtenantId: string, id: string) => void;
  removePaymentMethodForSubtenant: (subtenantId: string, id: string) => void;
}

const DomainContext = createContext<DomainContextValue | null>(null);
const today = "2026-08-22";
const cloneCoverage = (entries: readonly PlanCoverage[]) => entries.map((entry) => ({ ...entry, networkIds: [...entry.networkIds] }));

export function DomainProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<OrbitDomainState>(() => {
    const initial = createInitialDomainState();
    if (process.env.NODE_ENV !== "production") assertDomainIntegrity(initial);
    return initial;
  });
  const nextCustomerSequence = useRef(1100);
  const nextEsimSequence = useRef(9900);
  const nextPlanSequence = useRef(1100);
  const nextNetworkSequence = useRef(2000);
  const nextActivitySequence = useRef(5000);
  const nextOperationSequence = useRef(6000);
  const nextOperationEventSequence = useRef(9000);
  const nextApiApplicationSequence = useRef(1300);
  const nextSubtenantSequence = useRef(2000);
  const nextInfluencerSequence = useRef(2000);
  const nextTeamUserSequence = useRef(2000);
  const nextPaymentMethodSequence = useRef(9000);
  const repository = useMemo(() => new LocalOrbitRepository(state), [state]);
  const customers = useMemo(() => repository.resolveCustomers(), [repository]);
  const plans = useMemo(() => repository.resolvePlans(), [repository]);
  const resolvedNetworks = useMemo(() => repository.resolveNetworks(), [repository]);
  const resolvedEsims = useMemo(() => repository.resolveESims(), [repository]);
  const operations = useMemo(() => repository.resolveOperations(), [repository]);

  const commit = (update: (current: OrbitDomainState) => OrbitDomainState) => {
    setState((current) => {
      const next = update(current);
      if (process.env.NODE_ENV !== "production") assertDomainIntegrity(next);
      return next;
    });
  };
  const event = (input: Omit<ActivityEvent, "id">): ActivityEvent => ({ ...input, id: `EVT-${nextActivitySequence.current++}` });
  const requireCustomer = (id: string) => {
    const customer = repository.getCustomerById(id);
    if (!customer) throw new Error(`Customer ${id} does not exist.`);
    return customer;
  };
  const requireAssignableCustomer = (id: string) => {
    const customer = requireCustomer(id);
    if (customer.status === "Archived") throw new Error(`Archived customer ${id} cannot receive an eSIM.`);
    return customer;
  };
  const requireAssignablePlan = (id: string) => {
    const plan = repository.getPlanById(id);
    if (!plan) throw new Error(`Plan ${id} does not exist.`);
    if (plan.status !== "Active") throw new Error(`Plan ${id} is not active and cannot be assigned.`);
    return plan;
  };
  const eligibleNetworkForPlan = (plan: Plan, requestedId?: string | null) => {
    const networkIds = plan.coverage.flatMap((entry) => entry.networkIds);
    if (requestedId) {
      const requested = repository.getNetworkById(requestedId);
      if (!requested || !networkIds.includes(requestedId) || requested.status === "Disabled") throw new Error(`Network ${requestedId} is not eligible for plan ${plan.id}.`);
      return requestedId;
    }
    return networkIds.find((networkId) => repository.getNetworkById(networkId)?.status !== "Disabled") ?? null;
  };

  interface OperationLinks {
    customerId?: string;
    esimId?: string;
    planId?: string;
    networkId?: string;
    retryOfOperationId?: string;
    subtenantId?: string;
  }

  const operationTimestamp = (sequence: number) => new Date(Date.parse("2026-08-23T12:30:00.000Z") + (sequence - 6000) * 60_000).toISOString();
  const operationEvent = (operationId: string, label: string, detail: string, timestamp: string, status: OperationEvent["status"]): OperationEvent => ({ id: `OPEV-${nextOperationEventSequence.current++}`, operationId, label, detail, timestamp, status });
  const completedOperation = (type: OperationType, links: OperationLinks, initiatedBy = "Jane Doe") => {
    const sequence = nextOperationSequence.current++;
    const createdAt = operationTimestamp(sequence);
    const completedAt = new Date(Date.parse(createdAt) + 6_000).toISOString();
    const operation: Operation = { id: `OP-${sequence}`, type, status: "completed", ...links, createdAt, completedAt, initiatedBy };
    const acceptedLabel = type === "esim_activation" || type === "reactivation" ? "Provider accepted request" : "Change applied";
    const acceptedDetail = type === "esim_activation" || type === "reactivation" ? "The connectivity provider accepted the provisioning request." : "The requested change was applied to the Orbit domain.";
    const events = [
      operationEvent(operation.id, "Requested", "Orbit accepted the operational request.", createdAt, "completed"),
      operationEvent(operation.id, "Processing started", "The request entered the provisioning workflow.", new Date(Date.parse(createdAt) + 1_000).toISOString(), "completed"),
      operationEvent(operation.id, acceptedLabel, acceptedDetail, new Date(Date.parse(createdAt) + 4_000).toISOString(), "completed"),
      operationEvent(operation.id, "Completed", "The operation completed successfully.", completedAt, "completed"),
    ];
    return { operation, events };
  };

  const createCustomerRecord = (input: NewCustomerInput, forcedSubtenantId?: string) => {
    if (!repository.getCountryById(input.countryId)) throw new Error(`Country ${input.countryId} does not exist.`);
    const customer: Customer = { id: `CUS-${nextCustomerSequence.current++}`, firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email.trim(), phone: input.phone.trim(), countryId: input.countryId, status: input.status ?? "Active", joinedDate: input.joinedDate ?? "2026-08-21", lifetimeSpend: input.lifetimeSpend ?? 0, subtenantId: forcedSubtenantId, notes: input.notes?.trim() };
    const createdEvent = event({ entityType: "customer", entityId: customer.id, type: "customer-created", title: "Customer created", detail: `${customer.firstName} ${customer.lastName} joined Orbit.`, date: customer.joinedDate });
    const operation = completedOperation("customer_created", { customerId: customer.id, subtenantId: forcedSubtenantId });
    commit((current) => ({ ...current, customers: [customer, ...current.customers], activityEvents: [createdEvent, ...current.activityEvents], operations: [operation.operation, ...current.operations], operationEvents: [...operation.events, ...current.operationEvents] }));
    return customer;
  };

  const createCustomer = (input: NewCustomerInput) => createCustomerRecord(input);

  const updateCustomer = (id: string, input: NewCustomerInput) => {
    requireCustomer(id);
    if (!repository.getCountryById(input.countryId)) throw new Error(`Country ${input.countryId} does not exist.`);
    commit((current) => ({ ...current, customers: current.customers.map((customer) => customer.id === id ? { ...customer, firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email.trim(), phone: input.phone.trim(), countryId: input.countryId, notes: input.notes?.trim() } : customer) }));
  };

  const requireSubtenantCustomer = (subtenantId: string, id: string) => {
    const customer = repository.getCustomerById(id);
    if (!customer || customer.subtenantId !== subtenantId) throw new Error(`Customer ${id} is not available to organization ${subtenantId}.`);
    return customer;
  };

  const customerNameParts = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    return { firstName: parts[0] ?? "Customer", lastName: parts.slice(1).join(" ") };
  };

  const createCustomerForSubtenant = (subtenantId: string, input: AdminCustomerInput) => {
    const name = customerNameParts(input.name);
    return createCustomerRecord({ ...name, email: `admin-customer-${nextCustomerSequence.current}@orbit.invalid`, phone: input.phone, countryId: input.countryId, notes: input.notes }, subtenantId);
  };

  const updateCustomerForSubtenant = (subtenantId: string, id: string, input: AdminCustomerInput) => {
    const customer = requireSubtenantCustomer(subtenantId, id);
    if (!repository.getCountryById(input.countryId)) throw new Error(`Country ${input.countryId} does not exist.`);
    const name = customerNameParts(input.name);
    commit((current) => ({ ...current, customers: current.customers.map((item) => item.id === id ? { ...item, ...name, phone: input.phone.trim(), countryId: input.countryId, notes: input.notes.trim(), email: customer.email } : item) }));
  };

  const deleteCustomerForSubtenant = (subtenantId: string, id: string) => {
    requireSubtenantCustomer(subtenantId, id);
    commit((current) => ({
      ...current,
      customers: current.customers.filter((customer) => customer.id !== id),
      esims: current.esims.map((esim) => esim.customerId === id ? { ...esim, customerId: null } : esim),
      activityEvents: current.activityEvents.filter((item) => !(item.entityType === "customer" && item.entityId === id)),
      operations: current.operations.map((operation) => operation.customerId === id ? { ...operation, customerId: undefined } : operation),
    }));
  };

  const setCustomerStatus = (id: string, status: CustomerStatus) => {
    const customer = requireCustomer(id);
    const statusEvent = event({ entityType: "customer", entityId: id, type: "customer-status-changed", title: status === "Archived" ? "Customer archived" : "Customer status changed", detail: `${customer.firstName} ${customer.lastName} was marked ${status.toLocaleLowerCase()}.`, date: today });
    commit((current) => ({ ...current, customers: current.customers.map((item) => item.id === id ? { ...item, status } : item), activityEvents: [statusEvent, ...current.activityEvents] }));
  };

  const createEsimRecord = (input: NewEsimInput, forcedSubtenantId?: string) => {
    const plan = requireAssignablePlan(input.planId);
    const customer = input.customerId ? requireAssignableCustomer(input.customerId) : null;
    if (forcedSubtenantId) {
      if (plan.subtenantId !== forcedSubtenantId) throw new Error(`Plan ${plan.id} is not available to organization ${forcedSubtenantId}.`);
      if (customer?.subtenantId !== forcedSubtenantId) throw new Error(`Customer ${customer?.id ?? "unknown"} is not available to organization ${forcedSubtenantId}.`);
    }
    const sequence = nextEsimSequence.current++;
    const esim: ESim = { id: `ES-${sequence}`, label: input.label.trim(), iccid: `8944501207256${String(sequence).padStart(6, "0")}`, customerId: input.customerId, planId: plan.id, networkId: eligibleNetworkForPlan(plan, input.networkId), destination: input.destination ?? plan.destination, dataUsedGb: 0, status: input.activateNow ? "Active" : "Pending", activationDate: input.activateNow ? "2026-08-21" : "—", expiryDate: input.activateNow ? "2027-08-20" : "—", lastActivity: input.activateNow ? "Activated just now" : "Not activated", subtenantId: forcedSubtenantId ?? customer?.subtenantId };
    const events: ActivityEvent[] = [event({ entityType: "plan", entityId: plan.id, type: "plan-assigned", title: "Plan assigned to eSIM", detail: `${plan.name} was assigned to ${esim.label} (${esim.id}).`, date: today })];
    if (input.customerId) {
      events.push(event({ entityType: "customer", entityId: input.customerId, type: "esim-assigned", title: "eSIM assigned", detail: `${esim.label} (${esim.id}) was assigned.`, date: "2026-08-21" }));
      if (input.activateNow) events.push(event({ entityType: "customer", entityId: input.customerId, type: "esim-activated", title: "eSIM activated", detail: `${esim.label} connected successfully.`, date: "2026-08-21" }));
    }
    const operation = completedOperation("esim_created", { customerId: esim.customerId ?? undefined, esimId: esim.id, planId: esim.planId, networkId: esim.networkId ?? undefined });
    commit((current) => ({ ...current, esims: [esim, ...current.esims], activityEvents: [...events, ...current.activityEvents], operations: [operation.operation, ...current.operations], operationEvents: [...operation.events, ...current.operationEvents] }));
    return esim;
  };

  const createEsim = (input: NewEsimInput) => createEsimRecord(input);
  const createEsimForSubtenant = (subtenantId: string, input: NewEsimInput) => createEsimRecord(input, subtenantId);

  const updateEsimAssignment = (id: string, input: UpdateEsimAssignmentInput) => {
    const currentEsim = repository.getESimById(id);
    if (!currentEsim) throw new Error(`eSIM ${id} does not exist.`);
    const plan = requireAssignablePlan(input.planId);
    if (input.customerId) requireAssignableCustomer(input.customerId);
    const currentNetworkEligible = currentEsim.networkId && plan.coverage.some((entry) => entry.networkIds.includes(currentEsim.networkId!)) && repository.getNetworkById(currentEsim.networkId)?.status !== "Disabled";
    const networkId = currentNetworkEligible ? currentEsim.networkId : eligibleNetworkForPlan(plan);
    const events: ActivityEvent[] = [event({ entityType: "plan", entityId: plan.id, type: "plan-assigned", title: "Plan assigned to eSIM", detail: `${plan.name} was assigned to ${currentEsim.label} (${currentEsim.id}).`, date: today })];
    if (input.customerId) events.push(event({ entityType: "customer", entityId: input.customerId, type: "esim-assigned", title: "eSIM assigned", detail: `${currentEsim.label} (${currentEsim.id}) was assigned.`, date: today }));
    const operationLinks = { customerId: input.customerId ?? undefined, esimId: id, planId: plan.id, networkId: networkId ?? undefined };
    const operations = [
      ...(currentEsim.customerId !== input.customerId ? [completedOperation("esim_assignment", operationLinks)] : []),
      ...(currentEsim.planId !== input.planId ? [completedOperation("plan_assignment", operationLinks)] : []),
    ];
    commit((current) => ({ ...current, esims: current.esims.map((esim) => esim.id === id ? { ...esim, customerId: input.customerId, planId: plan.id, networkId, destination: plan.destination, subtenantId: input.customerId ? current.customers.find((customer) => customer.id === input.customerId)?.subtenantId : esim.subtenantId } : esim), activityEvents: [...events, ...current.activityEvents], operations: [...operations.map((item) => item.operation), ...current.operations], operationEvents: [...operations.flatMap((item) => item.events), ...current.operationEvents] }));
  };

  const assignEsim = (esimId: string, customerId: string | null) => {
    const esim = repository.getESimById(esimId);
    if (!esim) throw new Error(`eSIM ${esimId} does not exist.`);
    updateEsimAssignment(esimId, { customerId, planId: esim.planId });
  };

  const updateEsimStatus = (id: string, status: EsimStatus) => {
    const esim = repository.getESimById(id);
    if (!esim) throw new Error(`eSIM ${id} does not exist.`);
    const statusEvent = esim.customerId && status === "Suspended" ? event({ entityType: "customer" as const, entityId: esim.customerId, type: "esim-suspended" as const, title: "eSIM suspended", detail: `${esim.label} was suspended by an administrator.`, date: "2026-08-21" }) : null;
    const operationType: OperationType | null = status === esim.status ? null : status === "Suspended" ? "suspension" : status === "Active" ? (esim.status === "Suspended" ? "reactivation" : "esim_activation") : null;
    const operation = operationType ? completedOperation(operationType, { customerId: esim.customerId ?? undefined, esimId: esim.id, planId: esim.planId, networkId: esim.networkId ?? undefined }) : null;
    commit((current) => ({ ...current, esims: current.esims.map((item) => item.id === id ? { ...item, status } : item), activityEvents: statusEvent ? [statusEvent, ...current.activityEvents] : current.activityEvents, operations: operation ? [operation.operation, ...current.operations] : current.operations, operationEvents: operation ? [...operation.events, ...current.operationEvents] : current.operationEvents }));
  };

  const removeEsim = (id: string) => {
    if (!repository.getESimById(id)) return;
    commit((current) => {
      const removedOperationIds = new Set(current.operations.filter((operation) => operation.esimId === id).map((operation) => operation.id));
      return { ...current, esims: current.esims.filter((esim) => esim.id !== id), operations: current.operations.filter((operation) => !removedOperationIds.has(operation.id)), operationEvents: current.operationEvents.filter((item) => !removedOperationIds.has(item.operationId)) };
    });
  };

  const requireSubtenantEsim = (subtenantId: string, id: string) => {
    const esim = repository.getESimById(id);
    if (!esim || esim.subtenantId !== subtenantId) throw new Error(`eSIM ${id} is not available to organization ${subtenantId}.`);
    return esim;
  };

  const updateEsimStatusForSubtenant = (subtenantId: string, id: string, status: EsimStatus) => {
    requireSubtenantEsim(subtenantId, id);
    updateEsimStatus(id, status);
  };

  const updateEsimTagForSubtenant = (subtenantId: string, id: string, label: string) => {
    requireSubtenantEsim(subtenantId, id);
    const normalized = label.trim();
    if (!normalized) throw new Error("eSIM tag cannot be empty.");
    commit((current) => ({ ...current, esims: current.esims.map((esim) => esim.id === id ? { ...esim, label: normalized } : esim) }));
  };

  const removeEsimForSubtenant = (subtenantId: string, id: string) => {
    requireSubtenantEsim(subtenantId, id);
    removeEsim(id);
  };

  const planFromInput = (id: string, input: NewPlanInput, createdDate: string): Plan => ({ id, name: input.name.trim(), allowanceGb: input.allowanceUnit === "GB" ? input.allowanceValue : input.allowanceValue / 1024, allowanceUnit: input.allowanceUnit, destination: input.destination, validity: input.validity, validityUnit: input.validityUnit, wholesaleCost: input.wholesaleCost, retailPrice: input.retailPrice, currency: input.currency, hotspotAllowed: input.hotspotAllowed, status: input.status, coverage: input.coverage ? cloneCoverage(input.coverage) : repository.getCoverageForDestination(input.destination), createdDate, updatedDate: today });

  const createPlan = (input: NewPlanInput) => {
    const plan = planFromInput(`PLAN-${nextPlanSequence.current++}`, input, today);
    const events: ActivityEvent[] = [event({ entityType: "plan", entityId: plan.id, type: "plan-created", title: "Plan created", detail: `${plan.name} was added to the Orbit catalog.`, date: plan.createdDate })];
    if (plan.status === "Active") events.push(event({ entityType: "plan", entityId: plan.id, type: "plan-activated", title: "Plan activated", detail: `${plan.name} is available for assignment.`, date: today }));
    commit((current) => ({ ...current, plans: [plan, ...current.plans], activityEvents: [...events, ...current.activityEvents] }));
    return plan;
  };

  const updatePlan = (id: string, input: NewPlanInput) => {
    const currentPlan = repository.getPlanById(id);
    if (!currentPlan) throw new Error(`Plan ${id} does not exist.`);
    const updated = planFromInput(id, input, currentPlan.createdDate);
    const eligibleIds = updated.coverage.flatMap((entry) => entry.networkIds).filter((networkId) => repository.getNetworkById(networkId)?.status !== "Disabled");
    const events: ActivityEvent[] = [];
    if (currentPlan.retailPrice !== updated.retailPrice || currentPlan.currency !== updated.currency) events.push(event({ entityType: "plan", entityId: id, type: "price-changed", title: "Retail price changed", detail: `Retail price updated to ${updated.currency} ${updated.retailPrice.toFixed(2)}.`, date: today }));
    if (currentPlan.destination !== updated.destination || currentPlan.coverage.length !== updated.coverage.length) events.push(event({ entityType: "plan", entityId: id, type: "coverage-updated", title: "Coverage updated", detail: `${updated.coverage.length} coverage markets are now included.`, date: today }));
    commit((current) => ({ ...current, plans: current.plans.map((plan) => plan.id === id ? updated : plan), esims: current.esims.map((esim) => esim.planId === id && esim.networkId && !eligibleIds.includes(esim.networkId) ? { ...esim, networkId: eligibleIds[0] ?? null, destination: updated.destination } : esim), activityEvents: [...events, ...current.activityEvents] }));
  };

  const setPlanStatus = (id: string, status: PlanStatus) => {
    const plan = repository.getPlanById(id);
    if (!plan) throw new Error(`Plan ${id} does not exist.`);
    const statusEvent = event({ entityType: "plan", entityId: id, type: status === "Active" ? "plan-activated" : "plan-deactivated", title: status === "Active" ? "Plan activated" : "Plan deactivated", detail: `${plan.name} was marked ${status.toLocaleLowerCase()}.`, date: today });
    commit((current) => ({ ...current, plans: current.plans.map((item) => item.id === id ? { ...item, status, updatedDate: today } : item), activityEvents: [statusEvent, ...current.activityEvents] }));
  };

  const assertUniqueNetworkCode = (mcc: string, mnc: string, ignoredId?: string) => {
    if (state.networks.some((network) => network.id !== ignoredId && network.mcc === mcc.trim() && network.mnc === mnc.trim())) throw new Error(`MCC/MNC ${mcc.trim()}/${mnc.trim()} already exists.`);
  };
  const assertNetworkReferences = (input: NewNetworkInput) => {
    if (!repository.getCountryById(input.countryId)) throw new Error(`Country ${input.countryId} does not exist.`);
    const operator = repository.getOperatorById(input.operatorId);
    if (!operator) throw new Error(`Operator ${input.operatorId} does not exist.`);
    if (!operator.countryIds.includes(input.countryId)) throw new Error(`Operator ${input.operatorId} is not available in ${input.countryId}.`);
  };

  const createNetwork = (input: NewNetworkInput) => {
    assertUniqueNetworkCode(input.mcc, input.mnc);
    assertNetworkReferences(input);
    const country = repository.getCountryById(input.countryId)!;
    const operator = repository.getOperatorById(input.operatorId)!;
    const plmn = `${country.code}${operator.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3)}`.toLocaleUpperCase();
    const network: Network = { id: `NET-${nextNetworkSequence.current++}`, countryId: input.countryId, operatorId: input.operatorId, mcc: input.mcc.trim(), mnc: input.mnc.trim(), plmn, technologies: [...input.technologies], status: input.status, metrics: { availability: 99.98, activationSuccessRate: 99.4, averageLatencyMs: 41, activeConnections: 0 }, createdDate: today, updatedDate: today };
    const events: ActivityEvent[] = [event({ entityType: "network", entityId: network.id, type: "network-added", title: "Network added", detail: `${operator?.name ?? "Operator"} in ${country?.name ?? "this market"} was added to Orbit coverage.`, date: network.createdDate })];
    if (network.technologies.includes("5G")) events.push(event({ entityType: "network", entityId: network.id, type: "5g-enabled", title: "5G enabled", detail: "5G capability was enabled in the internal Orbit catalog.", date: network.createdDate }));
    commit((current) => ({ ...current, networks: [network, ...current.networks], activityEvents: [...events, ...current.activityEvents] }));
    return network;
  };

  const updateNetwork = (id: string, input: NewNetworkInput) => {
    assertUniqueNetworkCode(input.mcc, input.mnc, id);
    assertNetworkReferences(input);
    const currentNetwork = repository.getNetworkById(id);
    if (!currentNetwork) throw new Error(`Network ${id} does not exist.`);
    const updated: Network = { ...currentNetwork, countryId: input.countryId, operatorId: input.operatorId, mcc: input.mcc.trim(), mnc: input.mnc.trim(), technologies: [...input.technologies], status: input.status, updatedDate: today };
    const events: ActivityEvent[] = [];
    if (currentNetwork.operatorId !== input.operatorId || currentNetwork.mcc !== updated.mcc || currentNetwork.mnc !== updated.mnc) events.push(event({ entityType: "network", entityId: id, type: "operator-updated", title: "Operator configuration updated", detail: "Internal operator and routing metadata was updated.", date: today }));
    if (!currentNetwork.technologies.includes("5G") && input.technologies.includes("5G")) events.push(event({ entityType: "network", entityId: id, type: "5g-enabled", title: "5G enabled", detail: "5G capability was enabled in the internal Orbit catalog.", date: today }));
    if ((currentNetwork.status === "Unavailable" || currentNetwork.status === "Degraded") && input.status === "Active") events.push(event({ entityType: "network", entityId: id, type: "network-restored", title: "Network restored", detail: "The network was returned to active catalog status.", date: today }));
    commit((current) => ({ ...current, networks: current.networks.map((network) => network.id === id ? updated : network), plans: current.plans.map((plan) => ({ ...plan, coverage: plan.coverage.map((coverage) => coverage.networkIds.includes(id) ? { ...coverage, countryId: input.countryId } : coverage) })), activityEvents: [...events, ...current.activityEvents] }));
  };

  const setNetworkStatus = (id: string, status: NetworkStatus) => {
    if (!repository.getNetworkById(id)) throw new Error(`Network ${id} does not exist.`);
    const statusEvent = event({ entityType: "network", entityId: id, type: status === "Disabled" ? "network-disabled" : status === "Unavailable" ? "network-unavailable" : "network-restored", title: status === "Disabled" ? "Network disabled" : status === "Unavailable" ? "Network temporarily unavailable" : "Network enabled", detail: status === "Disabled" ? "The network was disabled for new Orbit assignments." : `The network was marked ${status.toLocaleLowerCase()} in the Orbit catalog.`, date: today });
    commit((current) => ({ ...current, networks: current.networks.map((network) => network.id === id ? { ...network, status, updatedDate: today } : network), activityEvents: [statusEvent, ...current.activityEvents] }));
  };

  const retryOperation = (id: string) => {
    const source = repository.getOperationById(id);
    if (!source) throw new Error(`Operation ${id} does not exist.`);
    if (source.status !== "failed") throw new Error(`Only failed operations can be retried.`);
    const sequence = nextOperationSequence.current++;
    const createdAt = operationTimestamp(sequence);
    const operation: Operation = {
      id: `OP-${sequence}`,
      type: source.type,
      status: "processing",
      customerId: source.customerId,
      esimId: source.esimId,
      planId: source.planId,
      networkId: source.networkId,
      createdAt,
      initiatedBy: "Jane Doe",
      retryOfOperationId: source.id,
      subtenantId: source.subtenantId,
    };
    const initialEvents = [
      operationEvent(operation.id, "Requested", `Retry requested for ${source.id}.`, createdAt, "completed"),
      operationEvent(operation.id, "Processing started", "The retry entered the deterministic mock provisioning workflow.", new Date(Date.parse(createdAt) + 1_000).toISOString(), "processing"),
    ];
    const completedAt = new Date(Date.parse(createdAt) + 8_000).toISOString();
    const completionEvents = [
      operationEvent(operation.id, "Provider accepted request", "The provider accepted the retried request.", new Date(Date.parse(createdAt) + 6_000).toISOString(), "completed"),
      operationEvent(operation.id, "Completed", "The retry completed successfully.", completedAt, "completed"),
    ];
    commit((current) => ({ ...current, operations: [operation, ...current.operations], operationEvents: [...initialEvents, ...current.operationEvents] }));
    window.setTimeout(() => {
      commit((current) => ({
        ...current,
        operations: current.operations.map((item) => item.id === operation.id ? { ...item, status: "completed", completedAt } : item),
        operationEvents: [...completionEvents, ...current.operationEvents.map((item) => item.operationId === operation.id && item.status === "processing" ? { ...item, status: "completed" as const } : item)],
      }));
    }, 900);
    return operation;
  };

  const createApiApplication = (input: NewApiApplicationInput) => {
    const name = input.name.trim();
    if (!name) throw new Error("An application name is required.");
    const sequence = nextApiApplicationSequence.current++;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const credential = (length: number, offset: number) => Array.from({ length }, (_, index) => alphabet[(sequence * 13 + index * 17 + offset) % alphabet.length]).join("");
    const application: ApiApplication = {
      id: `APIAPP-${sequence}`,
      name,
      apiKey: credential(12, 3),
      apiSecret: credential(64, 11),
      createdAt: "2026-08-23T12:45:00.000Z",
    };
    commit((current) => ({ ...current, apiApplications: [application, ...current.apiApplications] }));
    return application;
  };

  const revokeApiApplication = (id: string) => {
    if (!repository.getApiApplicationById(id)) throw new Error(`API application ${id} does not exist.`);
    commit((current) => ({ ...current, apiApplications: current.apiApplications.filter((application) => application.id !== id) }));
  };

  const requireSubtenant = (id: string) => {
    const subtenant = repository.getSubtenantById(id);
    if (!subtenant) throw new Error(`Subtenant ${id} does not exist.`);
    return subtenant;
  };

  const createSubtenant = (input: NewSubtenantInput) => {
    const name = input.name.trim();
    if (!name) throw new Error("A subtenant name is required.");
    const sequence = nextSubtenantSequence.current++;
    const subtenant: Subtenant = {
      id: `SUB-${sequence}`,
      name,
      kind: input.kind,
      status: "Active",
      balance: 0,
      billingAddress: input.billingAddress.trim(),
      email: input.email.trim(),
      taxId: input.taxId.trim(),
      type: input.type,
      pricingCategory: input.pricingCategory,
      salesTargetPercent: input.kind === "brand-vno" ? 20 : 0,
      monthlyClientChange: 0,
      monthlyEsimChange: 0,
      discountPercent: input.discountPercent,
      createdAt: "2026-08-23",
    };
    commit((current) => ({ ...current, subtenants: [subtenant, ...current.subtenants] }));
    return subtenant;
  };

  const updateSubtenant = (id: string, input: NewSubtenantInput) => {
    requireSubtenant(id);
    commit((current) => ({ ...current, subtenants: current.subtenants.map((subtenant) => subtenant.id === id ? { ...subtenant, name: input.name.trim(), billingAddress: input.billingAddress.trim(), email: input.email.trim(), taxId: input.taxId.trim(), type: input.type, pricingCategory: input.pricingCategory, discountPercent: input.discountPercent } : subtenant) }));
  };

  const setSubtenantStatus = (id: string, status: SubtenantStatus) => {
    requireSubtenant(id);
    commit((current) => ({ ...current, subtenants: current.subtenants.map((subtenant) => subtenant.id === id ? { ...subtenant, status } : subtenant) }));
  };

  const deleteSubtenant = (id: string) => {
    requireSubtenant(id);
    commit((current) => ({
      ...current,
      subtenants: current.subtenants.filter((subtenant) => subtenant.id !== id),
      customers: current.customers.map((customer) => customer.subtenantId === id ? { ...customer, subtenantId: undefined } : customer),
      esims: current.esims.map((esim) => esim.subtenantId === id ? { ...esim, subtenantId: undefined } : esim),
      plans: current.plans.map((plan) => plan.subtenantId === id ? { ...plan, subtenantId: undefined } : plan),
      operations: current.operations.map((operation) => operation.subtenantId === id ? { ...operation, subtenantId: undefined } : operation),
      apiApplications: current.apiApplications.map((application) => application.subtenantId === id ? { ...application, subtenantId: undefined } : application),
      influencers: current.influencers.map((influencer) => influencer.subtenantId === id ? { ...influencer, subtenantId: undefined } : influencer),
    }));
  };

  const createInfluencer = (input: NewInfluencerInput) => {
    if (input.subtenantId) requireSubtenant(input.subtenantId);
    const sequence = nextInfluencerSequence.current++;
    const influencer: Influencer = { id: `INF-${sequence}`, subtenantId: input.subtenantId, name: input.name.trim(), platform: input.platform, email: input.email.trim(), affiliateLink: `orbit.link/${input.name.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-")}`, clicks: 0, conversionRate: input.clickRate, registrationFee: input.registrationFee, totalEarnings: 0, currency: "GBP" };
    commit((current) => ({ ...current, influencers: [influencer, ...current.influencers] }));
    return influencer;
  };

  const requireTeamUser = (id: string) => {
    const user = repository.getTeamUserById(id);
    if (!user) throw new Error(`Team user ${id} does not exist.`);
    return user;
  };

  const normalizeTeamUserInput = (input: NewTeamUserInput) => {
    const name = input.name.trim();
    const email = input.email.trim();
    if (!name) throw new Error("A user name is required.");
    if (!email) throw new Error("A user email is required.");
    if (!input.password) throw new Error("A mock password is required.");
    return { ...input, name, email, permissions: { ...input.permissions } };
  };

  const createTeamUser = (input: NewTeamUserInput) => {
    const normalized = normalizeTeamUserInput(input);
    const user: TeamUser = {
      id: `USER-${nextTeamUserSequence.current++}`,
      ...normalized,
      createdAt: "2026-08-24",
    };
    commit((current) => ({ ...current, teamUsers: [user, ...current.teamUsers] }));
    return user;
  };

  const updateTeamUser = (id: string, input: NewTeamUserInput) => {
    requireTeamUser(id);
    const normalized = normalizeTeamUserInput(input);
    commit((current) => ({ ...current, teamUsers: current.teamUsers.map((user) => user.id === id ? { ...user, ...normalized } : user) }));
  };

  const updateTeamUserRole = (id: string, role: TeamUserRole) => {
    requireTeamUser(id);
    commit((current) => ({ ...current, teamUsers: current.teamUsers.map((user) => user.id === id ? { ...user, role } : user) }));
  };

  const requestTeamUserPasswordRecovery = (id: string) => {
    requireTeamUser(id);
    commit((current) => ({ ...current, teamUsers: current.teamUsers.map((user) => user.id === id ? { ...user, passwordRecoveryRequestedAt: "2026-08-24T12:00:00.000Z" } : user) }));
  };

  const removeTeamUser = (id: string) => {
    requireTeamUser(id);
    commit((current) => ({ ...current, teamUsers: current.teamUsers.filter((user) => user.id !== id) }));
  };

  const requireBillingAccount = (subtenantId: string) => {
    const account = repository.getBillingAccountForSubtenant(subtenantId);
    if (!account) throw new Error(`Billing account is not available to organization ${subtenantId}.`);
    return account;
  };

  const requirePaymentMethod = (subtenantId: string, id: string) => {
    const method = repository.getPaymentMethodsForSubtenant(subtenantId).find((item) => item.id === id);
    if (!method) throw new Error(`Payment method ${id} is not available to organization ${subtenantId}.`);
    return method;
  };

  const addCreditForSubtenant = (subtenantId: string, amount: number, paymentMethodId: string) => {
    const account = requireBillingAccount(subtenantId);
    requirePaymentMethod(subtenantId, paymentMethodId);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Credit amount must be greater than zero.");
    commit((current) => ({ ...current, billingAccounts: current.billingAccounts.map((item) => item.id === account.id ? { ...item, creditBalance: Number((item.creditBalance + amount).toFixed(2)) } : item) }));
  };

  const addPaymentMethodForSubtenant = (subtenantId: string, input: NewPaymentMethodInput) => {
    requireBillingAccount(subtenantId);
    const digits = input.cardNumber.replace(/\D/g, "");
    const [expiryMonth = "01", shortYear = "28"] = input.expiryDate.trim().split("/");
    if (digits.length < 4) throw new Error("A valid mock card number is required.");
    if (!input.securityCode.trim()) throw new Error("A mock security code is required.");
    if (!input.nameOnCard.trim()) throw new Error("The name on card is required.");
    const method: PaymentMethod = {
      id: `PAY-ADMIN-${nextPaymentMethodSequence.current++}`,
      subtenantId,
      provider: digits.startsWith("4") ? "Visa" : "Stripe",
      last4: digits.slice(-4),
      currency: "GBP",
      expiryMonth: expiryMonth.padStart(2, "0").slice(-2),
      expiryYear: shortYear.length === 2 ? `20${shortYear}` : shortYear,
      nameOnCard: input.nameOnCard.trim(),
      isPrimary: false,
      createdAt: "2026-08-24T12:00:00.000Z",
    };
    commit((current) => ({ ...current, paymentMethods: [...current.paymentMethods, method] }));
    return method;
  };

  const setPrimaryPaymentMethodForSubtenant = (subtenantId: string, id: string) => {
    requirePaymentMethod(subtenantId, id);
    commit((current) => ({ ...current, paymentMethods: current.paymentMethods.map((method) => method.subtenantId === subtenantId ? { ...method, isPrimary: method.id === id } : method) }));
  };

  const removePaymentMethodForSubtenant = (subtenantId: string, id: string) => {
    requirePaymentMethod(subtenantId, id);
    commit((current) => ({ ...current, paymentMethods: current.paymentMethods.filter((method) => method.id !== id) }));
  };

  const value: DomainContextValue = { repository, customers, esims: state.esims, plans, countries: state.countries, operators: state.operators, networks: state.networks, resolvedNetworks, activities: repository.getActivityEvents("customer"), planActivities: repository.getActivityEvents("plan"), networkActivities: repository.getActivityEvents("network"), resolvedEsims, operations, apiApplications: state.apiApplications, subtenants: state.subtenants, influencers: state.influencers, teamUsers: state.teamUsers, createCustomer, updateCustomer, setCustomerStatus, createCustomerForSubtenant, updateCustomerForSubtenant, deleteCustomerForSubtenant, createEsim, updateEsimAssignment, updateEsimStatus, removeEsim, createEsimForSubtenant, updateEsimStatusForSubtenant, updateEsimTagForSubtenant, removeEsimForSubtenant, assignEsim, createPlan, updatePlan, setPlanStatus, createNetwork, updateNetwork, setNetworkStatus, retryOperation, createApiApplication, revokeApiApplication, createSubtenant, updateSubtenant, setSubtenantStatus, deleteSubtenant, createInfluencer, createTeamUser, updateTeamUser, updateTeamUserRole, requestTeamUserPasswordRecovery, removeTeamUser, addCreditForSubtenant, addPaymentMethodForSubtenant, setPrimaryPaymentMethodForSubtenant, removePaymentMethodForSubtenant };

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

export function useDomain() {
  const value = useContext(DomainContext);
  if (!value) throw new Error("useDomain must be used within DomainProvider");
  return value;
}
