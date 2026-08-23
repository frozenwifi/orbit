import { mockActivityEvents, mockApiApplications, mockCountries, mockCoverageCatalog, mockCustomers, mockEsims, mockNetworks, mockOperationEvents, mockOperations, mockOperators, mockPlans } from "@/data/mock-domain";
import type { ActivityEvent, ApiApplication, Country, Customer, ESim, EntityType, Network, Operation, OperationEvent, Operator, Plan, PlanCoverage, ResolvedCustomer, ResolvedNetwork, ResolvedPlan } from "@/types/domain";
import type { Esim } from "@/types/esim";
import type { ResolvedOperation } from "@/types/operations";

export interface OrbitDomainState {
  customers: Customer[];
  esims: ESim[];
  plans: Plan[];
  networks: Network[];
  countries: Country[];
  operators: Operator[];
  activityEvents: ActivityEvent[];
  operations: Operation[];
  operationEvents: OperationEvent[];
  apiApplications: ApiApplication[];
}

const cloneCoverage = (coverage: readonly PlanCoverage[]) => coverage.map((entry) => ({ ...entry, networkIds: [...entry.networkIds] }));
const superadminRegionCountryIds = ["CTY-CN", "CTY-SE", "CTY-GB", "CTY-US", "CTY-IT", "CTY-DE", "CTY-ES", "CTY-PL", "CTY-JP", "CTY-PT", "CTY-BR", "CTY-AR"] as const;
const superadminOperatorNetworkIds = ["NET-OOO-DZ", "NET-AND-AD", "NET-FLOW-AI", "NET-FLOW-AG", "NET-MOV-AR", "NET-MTS-AM", "NET-SETAR-AW", "NET-OPTUS-AU", "NET-CMCC-CN", "NET-MEO-PT", "NET-EE-GB", "NET-NTT-JP"] as const;

export function createInitialDomainState(): OrbitDomainState {
  return {
    customers: mockCustomers.map((customer) => ({ ...customer })),
    esims: mockEsims.map((esim) => ({ ...esim })),
    plans: mockPlans.map((plan) => ({ ...plan, coverage: cloneCoverage(plan.coverage) })),
    networks: mockNetworks.map((network) => ({ ...network, technologies: [...network.technologies], metrics: { ...network.metrics } })),
    countries: mockCountries.map((country) => ({ ...country })),
    operators: mockOperators.map((operator) => ({ ...operator, countryIds: [...operator.countryIds] })),
    activityEvents: mockActivityEvents.map((activity) => ({ ...activity })),
    operations: mockOperations.map((operation) => ({ ...operation })),
    operationEvents: mockOperationEvents.map((event) => ({ ...event })),
    apiApplications: mockApiApplications.map((application) => ({ ...application })),
  };
}

export class LocalOrbitRepository {
  constructor(private readonly state: Readonly<OrbitDomainState>) {}

  getCustomers() { return this.state.customers; }
  getCustomerById(id: string) { return this.state.customers.find((customer) => customer.id === id) ?? null; }
  getESims() { return this.state.esims; }
  getESimById(id: string) { return this.state.esims.find((esim) => esim.id === id) ?? null; }
  getPlans() { return this.state.plans; }
  getPlanById(id: string) { return this.state.plans.find((plan) => plan.id === id) ?? null; }
  getNetworks() { return this.state.networks; }
  getNetworkById(id: string) { return this.state.networks.find((network) => network.id === id) ?? null; }
  getCountries() { return this.state.countries; }
  getCountryById(id: string) { return this.state.countries.find((country) => country.id === id) ?? null; }
  getOperators() { return this.state.operators; }
  getOperatorById(id: string) { return this.state.operators.find((operator) => operator.id === id) ?? null; }
  getOperations() { return this.state.operations; }
  getOperationById(id: string) { return this.state.operations.find((operation) => operation.id === id) ?? null; }
  getOperationEvents(operationId: string) { return this.state.operationEvents.filter((event) => event.operationId === operationId); }
  getApiApplications() { return this.state.apiApplications; }
  getApiApplicationById(id: string) { return this.state.apiApplications.find((application) => application.id === id) ?? null; }

  getESimsForCustomer(customerId: string) { return this.state.esims.filter((esim) => esim.customerId === customerId); }
  getESimsForPlan(planId: string) { return this.state.esims.filter((esim) => esim.planId === planId); }
  getESimsForNetwork(networkId: string) { return this.state.esims.filter((esim) => esim.networkId === networkId); }
  getCustomerForESim(esimId: string) {
    const customerId = this.getESimById(esimId)?.customerId;
    return customerId ? this.getCustomerById(customerId) : null;
  }
  getPlansForNetwork(networkId: string) { return this.state.plans.filter((plan) => plan.coverage.some((entry) => entry.networkIds.includes(networkId))); }
  getNetworksForPlan(planId: string) {
    const ids = new Set(this.getPlanById(planId)?.coverage.flatMap((entry) => entry.networkIds) ?? []);
    return this.state.networks.filter((network) => ids.has(network.id));
  }
  getActivityEvents(entityType: EntityType, entityId?: string) {
    return this.state.activityEvents.filter((event) => event.entityType === entityType && (!entityId || event.entityId === entityId));
  }

  getSuperadminRegionCatalog(): Country[] {
    return superadminRegionCountryIds.flatMap((id) => {
      const country = this.getCountryById(id);
      return country ? [country] : [];
    });
  }

  resolveSuperadminOperatorCatalog(): ResolvedNetwork[] {
    const networks = new Map(this.resolveNetworks().map((network) => [network.id, network]));
    return superadminOperatorNetworkIds.flatMap((id) => {
      const network = networks.get(id);
      return network ? [network] : [];
    });
  }

  getCoverageForDestination(destination: string): PlanCoverage[] {
    const existing = this.state.plans.find((plan) => plan.destination === destination)?.coverage;
    if (existing?.length) return cloneCoverage(existing);
    const catalogEntries = Object.values(mockCoverageCatalog).find((entries) => entries.some((entry) => {
      const country = this.getCountryById(entry.countryId);
      return country?.region === destination || country?.name === destination;
    }));
    return cloneCoverage(catalogEntries ?? []);
  }

  resolveCustomers(): ResolvedCustomer[] {
    return this.state.customers.flatMap((customer) => {
      const country = this.getCountryById(customer.countryId);
      return country ? [{ ...customer, country: country.name, market: country.region, countryEntity: country }] : [];
    });
  }

  resolveNetworks(): ResolvedNetwork[] {
    return this.state.networks.flatMap((network) => {
      const country = this.getCountryById(network.countryId);
      const operator = this.getOperatorById(network.operatorId);
      return country && operator ? [{ ...network, country, operator }] : [];
    });
  }

  resolvePlans(): ResolvedPlan[] {
    const networkById = new Map(this.resolveNetworks().map((network) => [network.id, network]));
    return this.state.plans.map((plan) => ({
      ...plan,
      coverage: plan.coverage.flatMap((entry) => {
        const country = this.getCountryById(entry.countryId);
        if (!country) return [];
        const networks = entry.networkIds.flatMap((networkId) => {
          const network = networkById.get(networkId);
          return network ? [network] : [];
        });
        return [{
          ...entry,
          country: country.name,
          countryCode: country.code,
          region: country.region,
          operator: [...new Set(networks.map((network) => network.operator.name))].join(", ") || undefined,
          networkId: networks[0]?.id,
          technologies: [...new Set(networks.flatMap((network) => network.technologies))],
          networks,
        }];
      }),
    }));
  }

  resolveESims(): Esim[] {
    const customerById = new Map(this.resolveCustomers().map((customer) => [customer.id, customer]));
    const planById = new Map(this.resolvePlans().map((plan) => [plan.id, plan]));
    const networkById = new Map(this.resolveNetworks().map((network) => [network.id, network]));
    return this.state.esims.flatMap((esim) => {
      const plan = planById.get(esim.planId);
      if (!plan) return [];
      const customer = esim.customerId ? customerById.get(esim.customerId) ?? null : null;
      const fullName = customer ? `${customer.firstName} ${customer.lastName}` : "";
      return [{
        ...esim,
        plan,
        network: esim.networkId ? networkById.get(esim.networkId) ?? null : null,
        customer,
        user: customer ? { name: fullName, email: customer.email, initials: fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toLocaleUpperCase() } : null,
      }];
    });
  }

  resolveOperations(): ResolvedOperation[] {
    const customerById = new Map(this.resolveCustomers().map((customer) => [customer.id, customer]));
    const esimById = new Map(this.resolveESims().map((esim) => [esim.id, esim]));
    const planById = new Map(this.resolvePlans().map((plan) => [plan.id, plan]));
    const networkById = new Map(this.resolveNetworks().map((network) => [network.id, network]));
    return this.state.operations.map((operation) => ({
      ...operation,
      customer: operation.customerId ? customerById.get(operation.customerId) ?? null : null,
      esim: operation.esimId ? esimById.get(operation.esimId) ?? null : null,
      plan: operation.planId ? planById.get(operation.planId) ?? null : null,
      network: operation.networkId ? networkById.get(operation.networkId) ?? null : null,
      events: this.getOperationEvents(operation.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    }));
  }
}
