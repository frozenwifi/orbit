import type { OrbitDomainState } from "@/data/domain-repository";

function duplicateIds(label: string, values: readonly { id: string }[]) {
  const seen = new Set<string>();
  const issues: string[] = [];
  values.forEach(({ id }) => {
    if (seen.has(id)) issues.push(`Duplicate ${label} ID: ${id}`);
    seen.add(id);
  });
  return issues;
}

export function validateDomainState(state: Readonly<OrbitDomainState>) {
  const issues = [
    ...duplicateIds("customer", state.customers),
    ...duplicateIds("eSIM", state.esims),
    ...duplicateIds("plan", state.plans),
    ...duplicateIds("network", state.networks),
    ...duplicateIds("operator", state.operators),
    ...duplicateIds("country", state.countries),
    ...duplicateIds("activity", state.activityEvents),
    ...duplicateIds("operation", state.operations),
    ...duplicateIds("operation event", state.operationEvents),
    ...duplicateIds("API application", state.apiApplications),
  ];
  const customers = new Set(state.customers.map(({ id }) => id));
  const esims = new Set(state.esims.map(({ id }) => id));
  const plans = new Set(state.plans.map(({ id }) => id));
  const networks = new Map(state.networks.map((network) => [network.id, network]));
  const operators = new Map(state.operators.map((operator) => [operator.id, operator]));
  const countries = new Set(state.countries.map(({ id }) => id));
  const apiKeys = new Set<string>();

  state.apiApplications.forEach((application) => {
    if (!application.name.trim()) issues.push(`API application ${application.id} is missing a name`);
    if (!application.apiKey.trim()) issues.push(`API application ${application.id} is missing an API key`);
    if (apiKeys.has(application.apiKey)) issues.push(`Duplicate API key: ${application.apiKey}`);
    apiKeys.add(application.apiKey);
  });

  state.customers.forEach((customer) => {
    if (!countries.has(customer.countryId)) issues.push(`Customer ${customer.id} references missing country ${customer.countryId}`);
  });
  state.esims.forEach((esim) => {
    if (esim.customerId && !customers.has(esim.customerId)) issues.push(`eSIM ${esim.id} references missing customer ${esim.customerId}`);
    if (!plans.has(esim.planId)) issues.push(`eSIM ${esim.id} references missing plan ${esim.planId}`);
    if (esim.networkId && !networks.has(esim.networkId)) issues.push(`eSIM ${esim.id} references missing network ${esim.networkId}`);
    const plan = state.plans.find(({ id }) => id === esim.planId);
    if (esim.networkId && plan && !plan.coverage.some((entry) => entry.networkIds.includes(esim.networkId!))) issues.push(`eSIM ${esim.id} uses network ${esim.networkId} outside plan ${plan.id}`);
  });
  state.plans.forEach((plan) => plan.coverage.forEach((coverage) => {
    if (!countries.has(coverage.countryId)) issues.push(`Plan ${plan.id} references missing country ${coverage.countryId}`);
    coverage.networkIds.forEach((networkId) => {
      const network = networks.get(networkId);
      if (!network) issues.push(`Plan ${plan.id} references missing network ${networkId}`);
      else if (network.countryId !== coverage.countryId) issues.push(`Plan ${plan.id} coverage country ${coverage.countryId} does not match network ${networkId}`);
    });
  }));
  state.networks.forEach((network) => {
    if (!countries.has(network.countryId)) issues.push(`Network ${network.id} references missing country ${network.countryId}`);
    const operator = operators.get(network.operatorId);
    if (!operator) issues.push(`Network ${network.id} references missing operator ${network.operatorId}`);
    else if (!operator.countryIds.includes(network.countryId)) issues.push(`Operator ${operator.id} is not configured for network country ${network.countryId}`);
  });
  const mccMnc = new Set<string>();
  state.networks.forEach((network) => {
    const code = `${network.mcc}:${network.mnc}`;
    if (mccMnc.has(code)) issues.push(`Duplicate MCC/MNC: ${network.mcc}/${network.mnc}`);
    mccMnc.add(code);
  });
  state.activityEvents.forEach((event) => {
    const exists = event.entityType === "customer" ? customers.has(event.entityId)
      : event.entityType === "esim" ? esims.has(event.entityId)
        : event.entityType === "plan" ? plans.has(event.entityId)
          : networks.has(event.entityId);
    if (!exists) issues.push(`Activity ${event.id} references missing ${event.entityType} ${event.entityId}`);
  });
  const operations = new Set(state.operations.map(({ id }) => id));
  state.operations.forEach((operation) => {
    if (operation.customerId && !customers.has(operation.customerId)) issues.push(`Operation ${operation.id} references missing customer ${operation.customerId}`);
    if (operation.esimId && !esims.has(operation.esimId)) issues.push(`Operation ${operation.id} references missing eSIM ${operation.esimId}`);
    if (operation.planId && !plans.has(operation.planId)) issues.push(`Operation ${operation.id} references missing plan ${operation.planId}`);
    if (operation.networkId && !networks.has(operation.networkId)) issues.push(`Operation ${operation.id} references missing network ${operation.networkId}`);
    if (operation.retryOfOperationId && !operations.has(operation.retryOfOperationId)) issues.push(`Operation ${operation.id} retries missing operation ${operation.retryOfOperationId}`);
    if ((operation.status === "completed" || operation.status === "failed" || operation.status === "cancelled") && !operation.completedAt) issues.push(`Terminal operation ${operation.id} is missing completedAt`);
    if ((operation.status === "pending" || operation.status === "processing") && operation.completedAt) issues.push(`Non-terminal operation ${operation.id} has completedAt`);
    if (operation.status === "failed" && (!operation.errorCode || !operation.errorMessage || !operation.failedStep)) issues.push(`Failed operation ${operation.id} is missing failure context`);
    if (operation.completedAt && operation.completedAt < operation.createdAt) issues.push(`Operation ${operation.id} completed before it was created`);
  });
  state.operationEvents.forEach((event) => {
    if (!operations.has(event.operationId)) issues.push(`Operation event ${event.id} references missing operation ${event.operationId}`);
  });
  return issues;
}

export function assertDomainIntegrity(state: Readonly<OrbitDomainState>) {
  const issues = validateDomainState(state);
  if (issues.length) throw new Error(`Invalid Orbit domain state:\n${issues.join("\n")}`);
}
