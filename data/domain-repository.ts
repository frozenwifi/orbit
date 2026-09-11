import { mockActivityEvents, mockApiApplications, mockCountries, mockCoverageCatalog, mockCustomers, mockEsims, mockNetworks, mockOperationEvents, mockOperations, mockOperators, mockPlans } from "@/data/mock-domain";
import { mockInfluencers, mockSubtenants } from "@/data/mock-subtenants";
import { mockTeamUsers } from "@/data/mock-team-users";
import { mockBillingAccounts, mockInvoices, mockPaymentMethods } from "@/data/mock-admin-billing";
import type { ActivityEvent, ApiApplication, BillingAccount, Country, Customer, ESim, EntityType, Influencer, Invoice, Network, Operation, OperationEvent, Operator, PaymentMethod, Plan, PlanCoverage, ResolvedCustomer, ResolvedNetwork, ResolvedPlan, Subtenant, TeamUser } from "@/types/domain";
import type { Esim } from "@/types/esim";
import type { ResolvedOperation } from "@/types/operations";
import type { AdminEsimDisplayStatus, AdminEsimRow } from "@/types/admin-esims";
import type { AdminCustomerEsimRow, AdminCustomerRow, AdminExpensePoint } from "@/types/admin-customers";
import type { AdminDataPlanRow } from "@/types/admin-data-plans";

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
  subtenants: Subtenant[];
  influencers: Influencer[];
  teamUsers: TeamUser[];
  billingAccounts: BillingAccount[];
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
}

const cloneCoverage = (coverage: readonly PlanCoverage[]) => coverage.map((entry) => ({ ...entry, networkIds: [...entry.networkIds] }));
const superadminRegionCountryIds = ["CTY-CN", "CTY-SE", "CTY-GB", "CTY-US", "CTY-IT", "CTY-DE", "CTY-ES", "CTY-PL", "CTY-JP", "CTY-PT", "CTY-BR", "CTY-AR"] as const;
const superadminOperatorNetworkIds = ["NET-OOO-DZ", "NET-AND-AD", "NET-FLOW-AI", "NET-FLOW-AG", "NET-MOV-AR", "NET-MTS-AM", "NET-SETAR-AW", "NET-OPTUS-AU", "NET-CMCC-CN", "NET-MEO-PT", "NET-EE-GB", "NET-NTT-JP"] as const;
const adminRegionCountryIds = ["CTY-CN", "CTY-SE", "CTY-GB", "CTY-US", "CTY-IT", "CTY-DE", "CTY-ES", "CTY-PL", "CTY-JP", "CTY-PT", "CTY-BR", "CTY-AR"] as const;
const adminOperatorNetworkIds = ["NET-OOO-DZ", "NET-AND-AD", "NET-FLOW-AI", "NET-FLOW-AG", "NET-MOV-AR", "NET-MTS-AM", "NET-SETAR-AW", "NET-OPTUS-AU", "NET-CMCC-CN", "NET-MEO-PT", "NET-EE-GB", "NET-NTT-JP"] as const;

export function createInitialDomainState(): OrbitDomainState {
  const customerOwnership = new Map(mockCustomers.map((customer, index) => [customer.id, index < 5 ? "SUB-VODAFONE" : index < 8 ? "SUB-ORANGE" : index < 10 ? "SUB-LYCA" : "SUB-LEBARA"]));
  return {
    customers: mockCustomers.map((customer) => ({ ...customer, subtenantId: customerOwnership.get(customer.id) })),
    esims: mockEsims.map((esim) => ({ ...esim, subtenantId: esim.customerId ? customerOwnership.get(esim.customerId) : undefined })),
    plans: mockPlans.map((plan, index) => ({ ...plan, subtenantId: index < 2 ? "SUB-VODAFONE" : undefined, coverage: cloneCoverage(plan.coverage) })),
    networks: mockNetworks.map((network) => ({ ...network, technologies: [...network.technologies], metrics: { ...network.metrics } })),
    countries: mockCountries.map((country) => ({ ...country })),
    operators: mockOperators.map((operator) => ({ ...operator, countryIds: [...operator.countryIds] })),
    activityEvents: mockActivityEvents.map((activity) => ({ ...activity })),
    operations: mockOperations.map((operation) => ({ ...operation, subtenantId: operation.customerId ? customerOwnership.get(operation.customerId) : undefined })),
    operationEvents: mockOperationEvents.map((event) => ({ ...event })),
    apiApplications: mockApiApplications.map((application, index) => ({ ...application, subtenantId: index < 4 ? "SUB-VODAFONE" : undefined })),
    subtenants: mockSubtenants.map((subtenant) => ({ ...subtenant })),
    influencers: mockInfluencers.map((influencer) => ({ ...influencer })),
    teamUsers: mockTeamUsers.map((user) => ({ ...user, permissions: { ...user.permissions } })),
    billingAccounts: mockBillingAccounts.map((account) => ({ ...account })),
    paymentMethods: mockPaymentMethods.map((method) => ({ ...method })),
    invoices: mockInvoices.map((invoice) => ({
      ...invoice,
      billedTo: { ...invoice.billedTo, addressLines: [...invoice.billedTo.addressLines] },
      billedFrom: { ...invoice.billedFrom, addressLines: [...invoice.billedFrom.addressLines] },
      issuer: { ...invoice.issuer, addressLines: [...invoice.issuer.addressLines] },
      lines: invoice.lines.map((line) => ({ ...line })),
    })),
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
  getSubtenants() { return this.state.subtenants; }
  getSubtenantById(id: string) { return this.state.subtenants.find((subtenant) => subtenant.id === id) ?? null; }
  getInfluencers() { return this.state.influencers; }
  getInfluencerById(id: string) { return this.state.influencers.find((influencer) => influencer.id === id) ?? null; }
  getTeamUsers() { return this.state.teamUsers; }
  getTeamUserById(id: string) { return this.state.teamUsers.find((user) => user.id === id) ?? null; }
  getBillingAccountForSubtenant(subtenantId: string) { return this.state.billingAccounts.find((account) => account.subtenantId === subtenantId) ?? null; }
  getPaymentMethodsForSubtenant(subtenantId: string) { return this.state.paymentMethods.filter((method) => method.subtenantId === subtenantId); }
  getInvoicesForSubtenant(subtenantId: string) { return this.state.invoices.filter((invoice) => invoice.subtenantId === subtenantId); }
  getInvoiceForSubtenant(subtenantId: string, id: string) { return this.state.invoices.find((invoice) => invoice.subtenantId === subtenantId && invoice.id === id) ?? null; }
  getCustomersForSubtenant(subtenantId: string) { return this.state.customers.filter((customer) => customer.subtenantId === subtenantId); }
  getESimsForSubtenant(subtenantId: string) { return this.state.esims.filter((esim) => esim.subtenantId === subtenantId); }
  getPlansForSubtenant(subtenantId: string) { return this.state.plans.filter((plan) => plan.subtenantId === subtenantId); }
  getOperationsForSubtenant(subtenantId: string) { return this.state.operations.filter((operation) => operation.subtenantId === subtenantId); }
  getInfluencersForSubtenant(subtenantId: string) { return this.state.influencers.filter((influencer) => influencer.subtenantId === subtenantId); }
  getApiApplicationsForSubtenant(subtenantId: string) { return this.state.apiApplications.filter((application) => application.subtenantId === subtenantId); }

  resolveCustomersForSubtenant(subtenantId: string): ResolvedCustomer[] {
    return this.resolveCustomers().filter((customer) => customer.subtenantId === subtenantId);
  }

  resolvePlansForSubtenant(subtenantId: string): ResolvedPlan[] {
    return this.resolvePlans().filter((plan) => plan.subtenantId === subtenantId);
  }

  resolveESimsForSubtenant(subtenantId: string): Esim[] {
    return this.resolveESims().filter((esim) => esim.subtenantId === subtenantId);
  }

  getAdminRegionCatalog(subtenantId: string): Country[] {
    if (!this.getSubtenantById(subtenantId)) return [];
    return adminRegionCountryIds.flatMap((id) => {
      const country = this.getCountryById(id);
      return country ? [country] : [];
    });
  }

  resolveAdminOperatorCatalog(subtenantId: string): ResolvedNetwork[] {
    if (!this.getSubtenantById(subtenantId)) return [];
    const networks = new Map(this.resolveNetworks().map((network) => [network.id, network]));
    return adminOperatorNetworkIds.flatMap((id) => {
      const network = networks.get(id);
      return network ? [network] : [];
    });
  }

  resolveAdminDataPlanCatalog(subtenantId: string): AdminDataPlanRow[] {
    const scoped = this.resolvePlansForSubtenant(subtenantId);
    if (!scoped.length) return [];
    return Array.from({ length: 12 }, (_, index) => {
      const plan = scoped[index % scoped.length];
      return {
        rowId: `ADMIN-DATA-PLAN-ROW-${index + 1}`,
        planId: plan.id,
        region: "APAC",
        displayId: "JW7RCU5NPXY1",
        name: "Asia+ 10GB - 10 Days",
        wsp: 13.67,
        rrp: 17.99,
        dataGb: 10,
        validityDays: 10,
        wifiHotspot: true,
        coverageCountries: 12,
      } satisfies AdminDataPlanRow;
    });
  }

  private isSeedCustomerUnchanged(customer: Customer) {
    const seed = mockCustomers.find((item) => item.id === customer.id);
    return Boolean(seed
      && seed.firstName === customer.firstName
      && seed.lastName === customer.lastName
      && seed.phone === customer.phone
      && seed.countryId === customer.countryId
      && !customer.notes);
  }

  private adminCustomerDisplayName(customerId: string | null) {
    if (!customerId) return "—";
    const customer = this.getCustomerById(customerId);
    if (!customer) return "—";
    return this.isSeedCustomerUnchanged(customer) ? "Jane Doe" : `${customer.firstName} ${customer.lastName}`.trim();
  }

  resolveAdminCustomerCatalog(subtenantId: string): AdminCustomerRow[] {
    const scoped = this.resolveCustomersForSubtenant(subtenantId);
    if (!scoped.length) return [];
    const created = scoped.filter((customer) => {
      const sequence = Number(customer.id.replace(/^CUS-/, ""));
      return Number.isFinite(sequence) && sequence >= 1100;
    });
    const seeded = scoped.filter((customer) => !created.includes(customer));
    const fixtureSource = seeded.length ? seeded : scoped;
    const fixtureRows = Array.from({ length: 12 }, (_, index) => {
      const customer = fixtureSource[index % fixtureSource.length];
      const unchanged = this.isSeedCustomerUnchanged(customer);
      return {
        rowId: `ADMIN-CUSTOMER-ROW-${index + 1}`,
        customerId: customer.id,
        displayId: String(34566245 + index),
        name: unchanged ? "Jane Doe" : `${customer.firstName} ${customer.lastName}`.trim(),
        phone: unchanged ? "+44 20 7946 0958" : customer.phone,
        notes: unchanged ? "Needs coverage in both the UK and Europe." : customer.notes?.trim() || "—",
        country: unchanged ? "United Kingdom" : customer.country,
        activeEsims: unchanged ? 2 : this.getESimsForCustomer(customer.id).filter((esim) => esim.status === "Active").length,
      } satisfies AdminCustomerRow;
    });
    const createdRows = created.map((customer) => ({
      rowId: `ADMIN-CUSTOMER-CREATED-${customer.id}`,
      customerId: customer.id,
      displayId: customer.id.replace(/^CUS-/, ""),
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      phone: customer.phone,
      notes: customer.notes?.trim() || "—",
      country: customer.country,
      activeEsims: this.getESimsForCustomer(customer.id).filter((esim) => esim.status === "Active").length,
    } satisfies AdminCustomerRow));
    return [...createdRows, ...fixtureRows];
  }

  resolveAdminCustomerEsims(subtenantId: string, customerId: string): AdminCustomerEsimRow[] {
    const customer = this.getCustomerById(customerId);
    if (!customer || customer.subtenantId !== subtenantId) return [];
    const related = this.resolveESimsForSubtenant(subtenantId).filter((esim) => esim.customerId === customerId);
    if (!related.length) return [];
    return Array.from({ length: 4 }, (_, index) => {
      const esim = related[index % related.length];
      return {
        rowId: `ADMIN-CUSTOMER-ESIM-${customerId}-${index + 1}`,
        esimId: esim.id,
        orbitUid: "JXGQ9Y3DUS2H",
        iccid: "8910300000016774634",
        status: Number(esim.id.replace(/^ES-/, "")) >= 9900 ? (esim.status === "Active" ? "Activated" : esim.status === "Pending" ? "Awaiting activation" : "Deactivated") : "Awaiting activation",
        totalUsage: "506.95 MiB",
        tag: "Test",
      } satisfies AdminCustomerEsimRow;
    });
  }

  resolveAdminCustomerExpenses(_subtenantId: string, _customerId: string): AdminExpensePoint[] {
    return [
      { label: "Dec 29", value: 2300 }, { label: "Dec 30", value: 2900 }, { label: "Dec 31", value: 2500 },
      { label: "Jan 1", value: 2400 }, { label: "Jan 2", value: 3100 }, { label: "Jan 3", value: 4300 },
      { label: "Jan 4", value: 4300 }, { label: "Jan 5", value: 3850 }, { label: "Jan 6", value: 4700 },
      { label: "Jan 7", value: 3900 }, { label: "Jan 8", value: 3000 }, { label: "Jan 9", value: 3300 },
    ];
  }

  resolveAdminEsimCatalog(subtenantId: string): AdminEsimRow[] {
    const scoped = this.resolveESimsForSubtenant(subtenantId);
    if (!scoped.length) return [];
    const created = scoped.filter((esim) => {
      const sequence = Number(esim.id.replace(/^ES-/, ""));
      return Number.isFinite(sequence) && sequence >= 9900;
    });
    const seeded = scoped.filter((esim) => !created.includes(esim));
    const fixtureSource = seeded.length ? seeded : scoped;
    const displayStatuses: readonly AdminEsimDisplayStatus[] = ["Deactivated", "Awaiting activation", "Awaiting activation", "Awaiting activation", "Deactivated", "Activated", "Activated", "Awaiting activation", "Awaiting activation", "Awaiting activation", "Activated", "Deactivated"];
    const rows = Array.from({ length: 12 }, (_, index) => {
      const esim = fixtureSource[index % fixtureSource.length];
      const canonicalStatus = esim.status;
      const status = displayStatuses[index];
      return {
        rowId: `ADMIN-ESIM-ROW-${index + 1}`,
        esimId: esim.id,
        customerId: esim.customerId,
        planId: esim.planId,
        orbitUid: "JXGQ9Y3DUS2H",
        dateAssigned: "2024-04-04 22:07",
        iccid: "8910300000016774634",
        status,
        totalUsage: "506.95 MiB",
        customerName: this.adminCustomerDisplayName(esim.customerId),
        tag: "Test",
        canonicalStatus,
      } satisfies AdminEsimRow;
    });
    const createdRows = created.map((esim) => ({
      rowId: `ADMIN-ESIM-CREATED-${esim.id}`,
      esimId: esim.id,
      customerId: esim.customerId,
      planId: esim.planId,
      orbitUid: esim.id,
      dateAssigned: "2026-08-21 12:30",
      iccid: esim.iccid,
      status: esim.status === "Active" ? "Activated" : esim.status === "Pending" ? "Awaiting activation" : "Deactivated",
      totalUsage: `${Math.round(esim.dataUsedGb * 1024 * 100) / 100} MiB`,
      customerName: esim.customer ? `${esim.customer.firstName} ${esim.customer.lastName}` : "—",
      tag: esim.label,
      canonicalStatus: esim.status,
    } satisfies AdminEsimRow));
    return [...createdRows, ...rows];
  }

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
