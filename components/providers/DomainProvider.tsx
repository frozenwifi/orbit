"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import { createInitialDomainState, LocalOrbitRepository, type OrbitDomainState } from "@/data/domain-repository";
import { assertDomainIntegrity } from "@/data/domain-validation";
import type { ActivityEvent, ApiApplication, Country, Customer, CustomerStatus, ESim, EsimStatus, Network, NetworkStatus, NewApiApplicationInput, NewCustomerInput, NewEsimInput, NewNetworkInput, NewPlanInput, Operation, OperationEvent, OperationType, Operator, Plan, PlanCoverage, PlanStatus, ResolvedCustomer, ResolvedNetwork, ResolvedPlan, UpdateEsimAssignmentInput } from "@/types/domain";
import type { Esim } from "@/types/esim";
import type { ResolvedOperation } from "@/types/operations";

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
  createCustomer: (input: NewCustomerInput) => Customer;
  updateCustomer: (id: string, input: NewCustomerInput) => void;
  setCustomerStatus: (id: string, status: CustomerStatus) => void;
  createEsim: (input: NewEsimInput) => ESim;
  updateEsimAssignment: (id: string, input: UpdateEsimAssignmentInput) => void;
  updateEsimStatus: (id: string, status: EsimStatus) => void;
  removeEsim: (id: string) => void;
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

  const createCustomer = (input: NewCustomerInput) => {
    if (!repository.getCountryById(input.countryId)) throw new Error(`Country ${input.countryId} does not exist.`);
    const customer: Customer = { id: `CUS-${nextCustomerSequence.current++}`, firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email.trim(), phone: input.phone.trim(), countryId: input.countryId, status: input.status ?? "Active", joinedDate: input.joinedDate ?? "2026-08-21", lifetimeSpend: input.lifetimeSpend ?? 0 };
    const createdEvent = event({ entityType: "customer", entityId: customer.id, type: "customer-created", title: "Customer created", detail: `${customer.firstName} ${customer.lastName} joined Orbit.`, date: customer.joinedDate });
    const operation = completedOperation("customer_created", { customerId: customer.id });
    commit((current) => ({ ...current, customers: [customer, ...current.customers], activityEvents: [createdEvent, ...current.activityEvents], operations: [operation.operation, ...current.operations], operationEvents: [...operation.events, ...current.operationEvents] }));
    return customer;
  };

  const updateCustomer = (id: string, input: NewCustomerInput) => {
    requireCustomer(id);
    if (!repository.getCountryById(input.countryId)) throw new Error(`Country ${input.countryId} does not exist.`);
    commit((current) => ({ ...current, customers: current.customers.map((customer) => customer.id === id ? { ...customer, firstName: input.firstName.trim(), lastName: input.lastName.trim(), email: input.email.trim(), phone: input.phone.trim(), countryId: input.countryId } : customer) }));
  };

  const setCustomerStatus = (id: string, status: CustomerStatus) => {
    const customer = requireCustomer(id);
    const statusEvent = event({ entityType: "customer", entityId: id, type: "customer-status-changed", title: status === "Archived" ? "Customer archived" : "Customer status changed", detail: `${customer.firstName} ${customer.lastName} was marked ${status.toLocaleLowerCase()}.`, date: today });
    commit((current) => ({ ...current, customers: current.customers.map((item) => item.id === id ? { ...item, status } : item), activityEvents: [statusEvent, ...current.activityEvents] }));
  };

  const createEsim = (input: NewEsimInput) => {
    const plan = requireAssignablePlan(input.planId);
    if (input.customerId) requireAssignableCustomer(input.customerId);
    const sequence = nextEsimSequence.current++;
    const esim: ESim = { id: `ES-${sequence}`, label: input.label.trim(), iccid: `8944501207256${String(sequence).padStart(6, "0")}`, customerId: input.customerId, planId: plan.id, networkId: eligibleNetworkForPlan(plan, input.networkId), destination: input.destination ?? plan.destination, dataUsedGb: 0, status: input.activateNow ? "Active" : "Pending", activationDate: input.activateNow ? "2026-08-21" : "—", expiryDate: input.activateNow ? "2027-08-20" : "—", lastActivity: input.activateNow ? "Activated just now" : "Not activated" };
    const events: ActivityEvent[] = [event({ entityType: "plan", entityId: plan.id, type: "plan-assigned", title: "Plan assigned to eSIM", detail: `${plan.name} was assigned to ${esim.label} (${esim.id}).`, date: today })];
    if (input.customerId) {
      events.push(event({ entityType: "customer", entityId: input.customerId, type: "esim-assigned", title: "eSIM assigned", detail: `${esim.label} (${esim.id}) was assigned.`, date: "2026-08-21" }));
      if (input.activateNow) events.push(event({ entityType: "customer", entityId: input.customerId, type: "esim-activated", title: "eSIM activated", detail: `${esim.label} connected successfully.`, date: "2026-08-21" }));
    }
    const operation = completedOperation("esim_created", { customerId: esim.customerId ?? undefined, esimId: esim.id, planId: esim.planId, networkId: esim.networkId ?? undefined });
    commit((current) => ({ ...current, esims: [esim, ...current.esims], activityEvents: [...events, ...current.activityEvents], operations: [operation.operation, ...current.operations], operationEvents: [...operation.events, ...current.operationEvents] }));
    return esim;
  };

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
    commit((current) => ({ ...current, esims: current.esims.map((esim) => esim.id === id ? { ...esim, customerId: input.customerId, planId: plan.id, networkId, destination: plan.destination } : esim), activityEvents: [...events, ...current.activityEvents], operations: [...operations.map((item) => item.operation), ...current.operations], operationEvents: [...operations.flatMap((item) => item.events), ...current.operationEvents] }));
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

  const value: DomainContextValue = { repository, customers, esims: state.esims, plans, countries: state.countries, operators: state.operators, networks: state.networks, resolvedNetworks, activities: repository.getActivityEvents("customer"), planActivities: repository.getActivityEvents("plan"), networkActivities: repository.getActivityEvents("network"), resolvedEsims, operations, apiApplications: state.apiApplications, createCustomer, updateCustomer, setCustomerStatus, createEsim, updateEsimAssignment, updateEsimStatus, removeEsim, assignEsim, createPlan, updatePlan, setPlanStatus, createNetwork, updateNetwork, setNetworkStatus, retryOperation, createApiApplication, revokeApiApplication };

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
}

export function useDomain() {
  const value = useContext(DomainContext);
  if (!value) throw new Error("useDomain must be used within DomainProvider");
  return value;
}
