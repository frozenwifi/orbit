import type { ActivityEvent, ApiApplication, Country, Customer, ESim, Network, NetworkRegion, NetworkStatus, NetworkTechnology, Operation, OperationEvent, Operator, Plan, PlanCoverage } from "@/types/domain";

export const mockCountries: readonly Country[] = [
  ["PT", "PRT", "Portugal", "Europe", "Europe"], ["ES", "ESP", "Spain", "Europe", "Europe"], ["FR", "FRA", "France", "Europe", "Europe"], ["DE", "DEU", "Germany", "Europe", "Europe"], ["IT", "ITA", "Italy", "Europe", "Europe"],
  ["GB", "GBR", "United Kingdom", "Europe", "Europe"], ["US", "USA", "United States", "North America", "Default"], ["JP", "JPN", "Japan", "Asia Pacific", "Asia"], ["AE", "ARE", "United Arab Emirates", "Middle East", "Middle East"], ["AU", "AUS", "Australia", "Oceania", "Asia"],
  ["CA", "CAN", "Canada", "North America", "Default"], ["MX", "MEX", "Mexico", "North America", "Latin America"], ["SG", "SGP", "Singapore", "Asia Pacific", "Asia"], ["IN", "IND", "India", "Asia Pacific", "Asia"], ["TH", "THA", "Thailand", "Asia Pacific", "Asia"],
  ["QA", "QAT", "Qatar", "Middle East", "Middle East"], ["SA", "SAU", "Saudi Arabia", "Middle East", "Middle East"], ["SE", "SWE", "Sweden", "Nordics", "Europe"], ["NO", "NOR", "Norway", "Nordics", "Europe"], ["DK", "DNK", "Denmark", "Nordics", "Europe"],
  ["FI", "FIN", "Finland", "Nordics", "Europe"], ["BR", "BRA", "Brazil", "South America", "Latin America"], ["AR", "ARG", "Argentina", "South America", "Latin America"], ["CL", "CHL", "Chile", "South America", "Latin America"], ["NZ", "NZL", "New Zealand", "Oceania", "Asia"],
  ["CN", "CHN", "China", "Asia Pacific", "Asia"], ["PL", "POL", "Poland", "Europe", "Europe"], ["DZ", "DZA", "Algeria", "North Africa", "Default"], ["AD", "AND", "Andorra", "Europe", "Europe"],
  ["AI", "AIA", "Anguilla", "Caribbean", "Caribbean"], ["AG", "ATG", "Antigua and Barbuda", "Caribbean", "Caribbean"], ["AM", "ARM", "Armenia", "Caucasus", "Caucasus"], ["AW", "ABW", "Aruba", "Caribbean", "Caribbean"], ["AL", "ALB", "Albania", "Balkans", "Balkans"],
].map(([code, iso3, name, region, networkRegion]) => ({ id: `CTY-${code}`, code, iso3, name, region, networkRegion: networkRegion as NetworkRegion, apnName: "globaldata", autoApn: true, wifiHotspot: true }));

export const mockOperators: readonly Operator[] = [
  ["OP-MEO", "MEO", "PT"], ["OP-MOV", "Movistar", "ES", "/assets/operators/movistar.png"], ["OP-ORA", "Orange", "FR"], ["OP-DT", "Telekom", "DE"], ["OP-TIM", "TIM", "IT"],
  ["OP-EE", "EE", "GB"], ["OP-TMO", "T-Mobile", "US"], ["OP-NTT", "NTT DOCOMO", "JP"], ["OP-ETI", "e&", "AE"], ["OP-TEL-AU", "Telstra", "AU"],
  ["OP-ROG", "Rogers", "CA"], ["OP-TEL-MX", "Telcel", "MX"], ["OP-SIN", "Singtel", "SG"], ["OP-AIR", "Airtel", "IN"], ["OP-AIS", "AIS", "TH"],
  ["OP-OOO", "Ooredoo", "QA"], ["OP-STC", "stc", "SA"], ["OP-TEL-SE", "Telia", "SE"], ["OP-TEL-NO", "Telenor", "NO"], ["OP-TDC", "TDC NET", "DK"],
  ["OP-ELI", "Elisa", "FI"], ["OP-VIV", "Vivo", "BR"], ["OP-CLA", "Claro", "AR"], ["OP-ENT", "Entel", "CL"], ["OP-SPA", "Spark", "NZ"],
  ["OP-VOD-PT", "Vodafone", "PT"], ["OP-VOD-GB", "Vodafone", "GB"], ["OP-ATT", "AT&T", "US"], ["OP-VOD-DE", "Vodafone", "DE"],
  ["OP-OOO-DZ", "Ooredoo", "DZ", "/assets/operators/ooredoo.png"], ["OP-AND", "Andorra Telecom", "AD", "/assets/operators/andorra-telecom.png"], ["OP-FLOW-AI", "FLOW", "AI", "/assets/operators/flow.png"], ["OP-FLOW-AG", "FLOW", "AG", "/assets/operators/flow.png"],
  ["OP-MOV-AR", "Movistar", "AR", "/assets/operators/movistar.png"], ["OP-MTS-AM", "MTS ARM (VivaCell)", "AM", "/assets/operators/viva-mts.png"], ["OP-SETAR", "Setar GSM", "AW", "/assets/operators/setar.png"], ["OP-OPTUS", "Optus", "AU", "/assets/operators/optus.png"], ["OP-CMCC", "China mobile", "CN"],
].map(([id, name, countryCode, logoAsset]) => ({ id, name, countryIds: [`CTY-${countryCode}`], ...(logoAsset ? { logoAsset } : {}) }));

function operationalMetrics(index: number, status: NetworkStatus, activeConnections: number) {
  if (status === "Disabled") return { availability: 0, activationSuccessRate: 0, averageLatencyMs: 0, activeConnections: 0 };
  if (status === "Unavailable") return { availability: 82.4, activationSuccessRate: 76.8, averageLatencyMs: 184, activeConnections };
  if (status === "Degraded") return { availability: 97.82, activationSuccessRate: 94.6, averageLatencyMs: 89, activeConnections };
  return { availability: Number((99.91 + (index % 8) * .01).toFixed(2)), activationSuccessRate: Number((99.18 + (index % 6) * .09).toFixed(2)), averageLatencyMs: 32 + (index % 7) * 4, activeConnections };
}

function network(id: string, countryCode: string, operatorId: string, mcc: string, mnc: string, technologies: readonly NetworkTechnology[], activeConnections: number, status: NetworkStatus = "Active", index = 0, plmn = `${countryCode}${mcc}${mnc}`): Network {
  return { id, countryId: `CTY-${countryCode}`, operatorId, mcc, mnc, plmn, technologies, status, metrics: operationalMetrics(index, status, activeConnections), createdDate: "2025-09-12", updatedDate: status === "Active" ? "2026-08-18" : "2026-08-21" };
}

export const mockNetworks: readonly Network[] = [
  network("NET-MEO-PT", "PT", "OP-MEO", "268", "06", ["4G", "5G"], 1284, "Active", 0),
  network("NET-MOV-ES", "ES", "OP-MOV", "214", "07", ["4G", "5G"], 1138, "Active", 1),
  network("NET-ORA-FR", "FR", "OP-ORA", "208", "01", ["3G", "4G", "5G"], 1462, "Active", 2),
  network("NET-TMO-DE", "DE", "OP-DT", "262", "01", ["4G", "5G"], 1320, "Active", 3),
  network("NET-TIM-IT", "IT", "OP-TIM", "222", "01", ["4G", "5G"], 974, "Active", 4),
  network("NET-EE-GB", "GB", "OP-EE", "234", "30", ["4G", "5G"], 1588, "Active", 5),
  network("NET-TMO-US", "US", "OP-TMO", "310", "260", ["4G", "5G"], 2214, "Active", 6),
  network("NET-NTT-JP", "JP", "OP-NTT", "440", "10", ["4G", "5G"], 1208, "Active", 7),
  network("NET-ETI-AE", "AE", "OP-ETI", "424", "02", ["4G", "5G"], 842, "Active", 8),
  network("NET-TEL-AU", "AU", "OP-TEL-AU", "505", "01", ["4G", "5G"], 916, "Active", 9),
  network("NET-ROG-CA", "CA", "OP-ROG", "302", "720", ["4G", "5G"], 1046, "Active", 10),
  network("NET-TEL-MX", "MX", "OP-TEL-MX", "334", "020", ["3G", "4G", "5G"], 516, "Degraded", 11),
  network("NET-SIN-SG", "SG", "OP-SIN", "525", "01", ["4G", "5G"], 624, "Active", 12),
  network("NET-AIR-IN", "IN", "OP-AIR", "404", "45", ["4G", "5G"], 1774, "Active", 13),
  network("NET-AIS-TH", "TH", "OP-AIS", "520", "01", ["4G", "5G"], 588, "Active", 14),
  network("NET-OOO-QA", "QA", "OP-OOO", "427", "01", ["4G", "5G"], 338, "Active", 15),
  network("NET-STC-SA", "SA", "OP-STC", "420", "01", ["4G", "5G"], 812, "Active", 16),
  network("NET-TEL-SE", "SE", "OP-TEL-SE", "240", "01", ["4G", "5G"], 472, "Active", 17),
  network("NET-TEL-NO", "NO", "OP-TEL-NO", "242", "01", ["4G", "5G"], 438, "Active", 18),
  network("NET-TDC-DK", "DK", "OP-TDC", "238", "01", ["4G", "5G"], 404, "Active", 19),
  network("NET-ELI-FI", "FI", "OP-ELI", "244", "05", ["4G", "5G"], 396, "Active", 20),
  network("NET-VIV-BR", "BR", "OP-VIV", "724", "10", ["4G", "5G"], 982, "Active", 21),
  network("NET-CLA-AR", "AR", "OP-CLA", "722", "310", ["3G", "4G", "5G"], 76, "Unavailable", 22),
  network("NET-ENT-CL", "CL", "OP-ENT", "730", "01", ["4G", "5G"], 462, "Active", 23),
  network("NET-SPA-NZ", "NZ", "OP-SPA", "530", "05", ["4G", "5G"], 286, "Active", 24),
  network("NET-VOD-PT", "PT", "OP-VOD-PT", "268", "01", ["2G", "3G", "4G", "LTE", "5G"], 694, "Active", 25),
  network("NET-VOD-GB", "GB", "OP-VOD-GB", "234", "15", ["3G", "4G", "LTE", "5G"], 1104, "Active", 26),
  network("NET-ATT-US", "US", "OP-ATT", "310", "410", ["3G", "4G", "LTE", "5G"], 1988, "Active", 27),
  network("NET-VOD-DE", "DE", "OP-VOD-DE", "262", "02", ["2G", "3G", "4G", "LTE"], 0, "Disabled", 28),
  network("NET-OOO-DZ", "DZ", "OP-OOO-DZ", "603", "03", ["3G", "4G"], 188, "Active", 29, "DZAWT"),
  network("NET-AND-AD", "AD", "OP-AND", "213", "03", ["3G", "4G", "5G"], 84, "Active", 30, "ANDMA"),
  network("NET-FLOW-AI", "AI", "OP-FLOW-AI", "365", "840", ["3G", "4G"], 42, "Active", 31, "AIACW"),
  network("NET-FLOW-AG", "AG", "OP-FLOW-AG", "344", "920", ["3G", "4G"], 46, "Active", 32, "ATGCW"),
  network("NET-MOV-AR", "AR", "OP-MOV-AR", "722", "07", ["3G", "4G"], 390, "Active", 33, "ARGTM"),
  network("NET-MTS-AM", "AM", "OP-MTS-AM", "283", "05", ["3G", "4G", "5G"], 112, "Active", 34, "ARM05"),
  network("NET-SETAR-AW", "AW", "OP-SETAR", "363", "01", ["3G", "4G"], 64, "Active", 35, "ABWSE"),
  network("NET-OPTUS-AU", "AU", "OP-OPTUS", "505", "02", ["3G", "4G", "5G"], 704, "Active", 36, "AUSOP"),
  network("NET-CMCC-CN", "CN", "OP-CMCC", "460", "00", ["3G", "4G", "5G"], 2410, "Active", 37, "CHNCT"),
];

const planCoverage = (id: string, countryCode: string, networkId: string): PlanCoverage => ({ id, countryId: `CTY-${countryCode}`, networkIds: [networkId] });
const coverage = {
  europe: [planCoverage("COV-PT", "PT", "NET-MEO-PT"), planCoverage("COV-ES", "ES", "NET-MOV-ES"), planCoverage("COV-FR", "FR", "NET-ORA-FR"), planCoverage("COV-DE", "DE", "NET-TMO-DE"), planCoverage("COV-IT", "IT", "NET-TIM-IT")],
  global: [planCoverage("COV-GB", "GB", "NET-EE-GB"), planCoverage("COV-US", "US", "NET-TMO-US"), planCoverage("COV-JP", "JP", "NET-NTT-JP"), planCoverage("COV-AE", "AE", "NET-ETI-AE"), planCoverage("COV-AU", "AU", "NET-TEL-AU")],
  americas: [planCoverage("COV-US-AM", "US", "NET-TMO-US"), planCoverage("COV-CA", "CA", "NET-ROG-CA"), planCoverage("COV-MX", "MX", "NET-TEL-MX")],
  asiaPacific: [planCoverage("COV-JP-AP", "JP", "NET-NTT-JP"), planCoverage("COV-SG", "SG", "NET-SIN-SG"), planCoverage("COV-IN", "IN", "NET-AIR-IN"), planCoverage("COV-TH", "TH", "NET-AIS-TH")],
  middleEast: [planCoverage("COV-AE-ME", "AE", "NET-ETI-AE"), planCoverage("COV-QA", "QA", "NET-OOO-QA"), planCoverage("COV-SA", "SA", "NET-STC-SA")],
  nordics: [planCoverage("COV-SE", "SE", "NET-TEL-SE"), planCoverage("COV-NO", "NO", "NET-TEL-NO"), planCoverage("COV-DK", "DK", "NET-TDC-DK"), planCoverage("COV-FI", "FI", "NET-ELI-FI")],
  latinAmerica: [planCoverage("COV-BR", "BR", "NET-VIV-BR"), planCoverage("COV-AR", "AR", "NET-CLA-AR"), planCoverage("COV-CL", "CL", "NET-ENT-CL")],
  oceania: [planCoverage("COV-AU-OC", "AU", "NET-TEL-AU"), planCoverage("COV-NZ", "NZ", "NET-SPA-NZ")],
} satisfies Record<string, readonly PlanCoverage[]>;

export const mockCoverageCatalog = coverage;

export const mockPlans: readonly Plan[] = [
  { id: "PLAN-EU-20", name: "Europe Plus 20 GB", allowanceGb: 20, allowanceUnit: "GB", destination: "Europe", validity: 30, validityUnit: "Days", wholesaleCost: 6.8, retailPrice: 14.99, currency: "GBP", hotspotAllowed: true, status: "Active", coverage: coverage.europe, createdDate: "2025-08-12", updatedDate: "2026-07-18" },
  { id: "PLAN-GL-15", name: "Global 15 GB", allowanceGb: 15, allowanceUnit: "GB", destination: "Global", validity: 30, validityUnit: "Days", wholesaleCost: 12.2, retailPrice: 29.99, currency: "USD", hotspotAllowed: true, status: "Active", coverage: coverage.global, createdDate: "2025-09-04", updatedDate: "2026-08-03" },
  { id: "PLAN-AM-10", name: "Americas 10 GB", allowanceGb: 10, allowanceUnit: "GB", destination: "North America", validity: 30, validityUnit: "Days", wholesaleCost: 4.9, retailPrice: 12.99, currency: "USD", hotspotAllowed: true, status: "Active", coverage: coverage.americas, createdDate: "2025-10-19", updatedDate: "2026-06-26" },
  { id: "PLAN-AP-08", name: "Asia Pacific 8 GB", allowanceGb: 8, allowanceUnit: "GB", destination: "Asia Pacific", validity: 30, validityUnit: "Days", wholesaleCost: 3.8, retailPrice: 10.99, currency: "USD", hotspotAllowed: true, status: "Active", coverage: coverage.asiaPacific, createdDate: "2025-11-07", updatedDate: "2026-07-29" },
  { id: "PLAN-RG-05", name: "Regional 5 GB", allowanceGb: 5, allowanceUnit: "GB", destination: "Middle East", validity: 15, validityUnit: "Days", wholesaleCost: 2.4, retailPrice: 7.99, currency: "USD", hotspotAllowed: false, status: "Active", coverage: coverage.middleEast, createdDate: "2025-11-22", updatedDate: "2026-05-14" },
  { id: "PLAN-UK-03", name: "UK Essentials 3 GB", allowanceGb: 3, allowanceUnit: "GB", destination: "United Kingdom", validity: 15, validityUnit: "Days", wholesaleCost: 1.65, retailPrice: 5.99, currency: "GBP", hotspotAllowed: true, status: "Active", coverage: [coverage.global[0]], createdDate: "2026-01-15", updatedDate: "2026-07-09" },
  { id: "PLAN-NO-12", name: "Nordic Explorer 12 GB", allowanceGb: 12, allowanceUnit: "GB", destination: "Nordics", validity: 30, validityUnit: "Days", wholesaleCost: 5.4, retailPrice: 13.99, currency: "EUR", hotspotAllowed: true, status: "Active", coverage: coverage.nordics, createdDate: "2026-02-08", updatedDate: "2026-08-12" },
  { id: "PLAN-LA-07", name: "Latin America Connect 7 GB", allowanceGb: 7, allowanceUnit: "GB", destination: "Latin America", validity: 30, validityUnit: "Days", wholesaleCost: 3.65, retailPrice: 9.99, currency: "USD", hotspotAllowed: true, status: "Inactive", coverage: coverage.latinAmerica, createdDate: "2026-03-21", updatedDate: "2026-07-02" },
  { id: "PLAN-GCC-25", name: "GCC Business 25 GB", allowanceGb: 25, allowanceUnit: "GB", destination: "Middle East", validity: 90, validityUnit: "Days", wholesaleCost: 13.5, retailPrice: 29.99, currency: "USD", hotspotAllowed: true, status: "Active", coverage: coverage.middleEast, createdDate: "2026-04-17", updatedDate: "2026-08-16" },
  { id: "PLAN-OC-05", name: "Oceania Flex 5 GB", allowanceGb: 5, allowanceUnit: "GB", destination: "Oceania", validity: 30, validityUnit: "Days", wholesaleCost: 3.8, retailPrice: 9.99, currency: "USD", hotspotAllowed: false, status: "Archived", coverage: coverage.oceania, createdDate: "2026-01-28", updatedDate: "2026-06-11" },
] as const;

export const mockCustomers: readonly Customer[] = [
  { id: "CUS-1048", firstName: "Lena", lastName: "Ortiz", email: "lena@orbit.example", phone: "+351 912 482 106", countryId: "CTY-PT", status: "Active", joinedDate: "2025-09-18", lifetimeSpend: 1842.5 },
  { id: "CUS-1042", firstName: "Malik", lastName: "Taylor", email: "malik@orbit.example", phone: "+44 7700 900 184", countryId: "CTY-GB", status: "Active", joinedDate: "2025-10-06", lifetimeSpend: 3260 },
  { id: "CUS-1037", firstName: "Sofia", lastName: "Chen", email: "sofia@orbit.example", phone: "+81 80 4672 1180", countryId: "CTY-JP", status: "Active", joinedDate: "2025-11-12", lifetimeSpend: 980.4 },
  { id: "CUS-1029", firstName: "Noah", lastName: "Williams", email: "noah@orbit.example", phone: "+1 416 555 0138", countryId: "CTY-CA", status: "Active", joinedDate: "2025-12-02", lifetimeSpend: 1450 },
  { id: "CUS-1023", firstName: "Amira", lastName: "Haddad", email: "amira@orbit.example", phone: "+971 50 742 9183", countryId: "CTY-AE", status: "Active", joinedDate: "2026-01-14", lifetimeSpend: 870 },
  { id: "CUS-1018", firstName: "Jonas", lastName: "Weber", email: "jonas@orbit.example", phone: "+49 151 2874 6631", countryId: "CTY-DE", status: "Active", joinedDate: "2025-08-24", lifetimeSpend: 2140 },
  { id: "CUS-1012", firstName: "Emma", lastName: "Brooks", email: "emma@orbit.example", phone: "+1 415 555 0174", countryId: "CTY-US", status: "Active", joinedDate: "2026-02-19", lifetimeSpend: 1220 },
  { id: "CUS-1007", firstName: "Kai", lastName: "Lim", email: "kai@orbit.example", phone: "+65 8124 7609", countryId: "CTY-SG", status: "Inactive", joinedDate: "2025-07-30", lifetimeSpend: 1680 },
  { id: "CUS-1002", firstName: "Camille", lastName: "Martin", email: "camille@orbit.example", phone: "+33 6 82 41 76 03", countryId: "CTY-FR", status: "Active", joinedDate: "2026-03-08", lifetimeSpend: 760 },
  { id: "CUS-0997", firstName: "Yasmin", lastName: "Khan", email: "yasmin@orbit.example", phone: "+974 5512 0948", countryId: "CTY-QA", status: "Suspended", joinedDate: "2025-10-28", lifetimeSpend: 930 },
  { id: "CUS-0991", firstName: "Priya", lastName: "Shah", email: "priya@orbit.example", phone: "+91 98765 41280", countryId: "CTY-IN", status: "Active", joinedDate: "2026-07-11", lifetimeSpend: 450 },
  { id: "CUS-0986", firstName: "Lucas", lastName: "Silva", email: "lucas@orbit.example", phone: "+55 11 99842 7016", countryId: "CTY-BR", status: "Inactive", joinedDate: "2026-06-17", lifetimeSpend: 210 },
] as const;

export const mockEsims: readonly ESim[] = [
  { id: "ES-9821", label: "Lisbon field team", iccid: "8944501207256982141", customerId: "CUS-1048", planId: "PLAN-EU-20", networkId: "NET-MEO-PT", destination: "Europe", dataUsedGb: 9.2, status: "Active", activationDate: "2026-03-12", expiryDate: "2027-03-11", lastActivity: "12 minutes ago" },
  { id: "ES-9814", label: "Executive travel", iccid: "8944501207256982067", customerId: "CUS-1042", planId: "PLAN-GL-15", networkId: "NET-EE-GB", destination: "Global", dataUsedGb: 7.8, status: "Active", activationDate: "2026-04-03", expiryDate: "2027-04-02", lastActivity: "38 minutes ago" },
  { id: "ES-9798", label: "Tokyo launch", iccid: "8944501207256981936", customerId: "CUS-1037", planId: "PLAN-AP-08", networkId: "NET-NTT-JP", destination: "Asia Pacific", dataUsedGb: 2.4, status: "Inactive", activationDate: "2026-02-18", expiryDate: "2026-11-17", lastActivity: "8 days ago" },
  { id: "ES-9772", label: "Canada operations", iccid: "8944501207256981788", customerId: "CUS-1029", planId: "PLAN-AM-10", networkId: "NET-ROG-CA", destination: "North America", dataUsedGb: 8.7, status: "Suspended", activationDate: "2026-01-24", expiryDate: "2027-01-23", lastActivity: "3 days ago" },
  { id: "ES-9755", label: "Dubai partner kit", iccid: "8944501207256981642", customerId: "CUS-1023", planId: "PLAN-RG-05", networkId: "NET-ETI-AE", destination: "Middle East", dataUsedGb: 1.1, status: "Active", activationDate: "2026-05-08", expiryDate: "2026-11-07", lastActivity: "1 hour ago" },
  { id: "ES-9739", label: "Berlin support", iccid: "8944501207256981519", customerId: "CUS-1018", planId: "PLAN-EU-20", networkId: "NET-TMO-DE", destination: "Europe", dataUsedGb: 14.6, status: "Active", activationDate: "2025-12-14", expiryDate: "2026-12-13", lastActivity: "4 minutes ago" },
  { id: "ES-9718", label: "Unassigned inventory A", iccid: "8944501207256981393", customerId: null, planId: "PLAN-GL-15", networkId: "NET-TMO-US", destination: "Global", dataUsedGb: 0, status: "Pending", activationDate: "—", expiryDate: "—", lastActivity: "Not activated" },
  { id: "ES-9697", label: "California sales", iccid: "8944501207256981257", customerId: "CUS-1012", planId: "PLAN-AM-10", networkId: "NET-TMO-US", destination: "North America", dataUsedGb: 5.3, status: "Active", activationDate: "2026-06-01", expiryDate: "2027-05-31", lastActivity: "22 minutes ago" },
  { id: "ES-9681", label: "Singapore research", iccid: "8944501207256981126", customerId: "CUS-1007", planId: "PLAN-AP-08", networkId: "NET-SIN-SG", destination: "Asia Pacific", dataUsedGb: 7.6, status: "Inactive", activationDate: "2025-11-10", expiryDate: "2026-11-09", lastActivity: "19 days ago" },
  { id: "ES-9664", label: "Paris events", iccid: "8944501207256981043", customerId: "CUS-1002", planId: "PLAN-EU-20", networkId: "NET-ORA-FR", destination: "Europe", dataUsedGb: 3.9, status: "Active", activationDate: "2026-07-16", expiryDate: "2027-07-15", lastActivity: "Yesterday" },
  { id: "ES-9643", label: "Doha operations", iccid: "8944501207256980915", customerId: "CUS-0997", planId: "PLAN-RG-05", networkId: "NET-OOO-QA", destination: "Middle East", dataUsedGb: 4.7, status: "Suspended", activationDate: "2026-03-30", expiryDate: "2026-09-29", lastActivity: "6 days ago" },
  { id: "ES-9619", label: "Unassigned inventory B", iccid: "8944501207256980832", customerId: null, planId: "PLAN-RG-05", networkId: "NET-STC-SA", destination: "Europe", dataUsedGb: 0, status: "Inactive", activationDate: "—", expiryDate: "—", lastActivity: "Not activated" },
] as const;

export const mockApiApplications: readonly ApiApplication[] = [
  { id: "APIAPP-1012", name: "Nova", apiKey: "f7GH8KMzbmBk", apiSecret: "oHDBbdGhVaKcm8f346TvrJXUaId4X6wFrMk8QT2oKLs57IhiBcOHDgpyMRVRWb2C", createdAt: "2026-08-15T10:30:00.000Z" },
  { id: "APIAPP-1011", name: "Nova", apiKey: "a3TR6PXqvnHd", apiSecret: "jQ6uN8cW2bRx7PzF9mL4sD1kH5vY3tG0eA6nC8qB2wX7rM9pS4dK1fJ5hV3zT0u", createdAt: "2026-08-12T09:15:00.000Z" },
  { id: "APIAPP-1010", name: "Nova", apiKey: "m9LK4DWxpaJc", apiSecret: "cF8vR2mN6qW1xT5kP9bH3sD7jL0aG4yU8eZ2nM6rQ1wV5tX9pK3dS7hJ0fB4cY8", createdAt: "2026-08-08T14:05:00.000Z" },
  { id: "APIAPP-1009", name: "Nova", apiKey: "q2CE7NVwskRf", apiSecret: "tM5xK9cD3vH7bQ1nR6wF0pL4sY8aG2jU5eZ9mC3rT7kV1dX6qB0hN4fP8wS2yJ5", createdAt: "2026-08-03T11:45:00.000Z" },
  { id: "APIAPP-1008", name: "Nova", apiKey: "v5YU1GFzjeNt", apiSecret: "pD7nL2wR9cX4mK1tV8bF5qH0sG6yJ3eA7uN2rM9dW4xT1kP8vC5zQ0hS6fB3jL7", createdAt: "2026-07-29T16:20:00.000Z" },
  { id: "APIAPP-1007", name: "Nova", apiKey: "b8QA3HSrmgZx", apiSecret: "yR1kV6dP3mC8xT5qN0hF7sL2wB9jG4eU1aZ6vM3rK8pD5tX0cQ7nH2fS9yJ4bW1", createdAt: "2026-07-24T08:40:00.000Z" },
  { id: "APIAPP-1006", name: "Nova", apiKey: "k4XP9BMtcdLu", apiSecret: "wT3cQ8nH5fS0yJ7bW2rM9dP4kV1xL6aG3eU8zN5qB0hF7sC2mR9tD4vK1pX6jY3", createdAt: "2026-07-18T13:55:00.000Z" },
  { id: "APIAPP-1005", name: "Nova", apiKey: "d6ZR2CJvfhQs", apiSecret: "nH4fS9yJ6bW1rM8dP3kV0xL7aG2eU9zN4qB1hF6sC3mR8tD5vK0pX7jY2wT9cQ4", createdAt: "2026-07-12T10:10:00.000Z" },
  { id: "APIAPP-1004", name: "Nova", apiKey: "s1HN8VLybpEa", apiSecret: "bW2rM7dP4kV9xL6aG1eU8zN3qB0hF5sC2mR7tD4vK9pX6jY1wT8cQ3nH0fS5yJ2", createdAt: "2026-07-05T15:35:00.000Z" },
  { id: "APIAPP-1003", name: "Nova", apiKey: "x7FD5RQnkuWm", apiSecret: "mR8tD3vK0pX5jY2wT7cQ4nH9fS6yJ1bW8rM3dP0kV5xL2aG7eU4zN9qB6hF1sC8", createdAt: "2026-06-28T09:50:00.000Z" },
  { id: "APIAPP-1002", name: "Nova", apiKey: "p3WB6KTogaYi", apiSecret: "vK9pX4jY1wT6cQ3nH8fS5yJ0bW7rM2dP9kV4xL1aG6eU3zN8qB5hF0sC7mR2tD9", createdAt: "2026-06-20T12:25:00.000Z" },
  { id: "APIAPP-1001", name: "Nova", apiKey: "h9MJ1SEwlrGc", apiSecret: "xL0aG5eU2zN7qB4hF9sC6mR1tD8vK3pX0jY5wT2cQ7nH4fS9yJ6bW1rM8dP3kV0", createdAt: "2026-06-11T17:00:00.000Z" },
] as const;

export const mockOperations: readonly Operation[] = [
  { id: "OP-2408", type: "esim_activation", status: "completed", customerId: "CUS-1048", esimId: "ES-9821", planId: "PLAN-EU-20", networkId: "NET-MEO-PT", createdAt: "2026-08-23T09:12:08.000Z", completedAt: "2026-08-23T09:12:16.000Z", initiatedBy: "Orbit automation" },
  { id: "OP-2407", type: "plan_assignment", status: "completed", customerId: "CUS-1042", esimId: "ES-9814", planId: "PLAN-GL-15", networkId: "NET-EE-GB", createdAt: "2026-08-23T08:46:11.000Z", completedAt: "2026-08-23T08:46:15.000Z", initiatedBy: "Jane Doe" },
  { id: "OP-2406", type: "top_up", status: "completed", customerId: "CUS-1018", esimId: "ES-9739", planId: "PLAN-EU-20", networkId: "NET-TMO-DE", createdAt: "2026-08-23T08:18:42.000Z", completedAt: "2026-08-23T08:18:48.000Z", initiatedBy: "Orbit API" },
  { id: "OP-2405", type: "esim_activation", status: "failed", customerId: "CUS-1037", esimId: "ES-9798", planId: "PLAN-AP-08", networkId: "NET-NTT-JP", createdAt: "2026-08-23T07:54:02.000Z", completedAt: "2026-08-23T07:54:32.000Z", initiatedBy: "Jane Doe", errorCode: "PROVIDER_TIMEOUT", errorMessage: "The upstream connectivity provider did not respond within the allowed time.", failedStep: "Provider accepted request" },
  { id: "OP-2404", type: "esim_assignment", status: "processing", customerId: "CUS-1029", esimId: "ES-9772", planId: "PLAN-AM-10", networkId: "NET-ROG-CA", createdAt: "2026-08-23T07:31:20.000Z", initiatedBy: "Orbit automation" },
  { id: "OP-2403", type: "suspension", status: "completed", customerId: "CUS-0997", esimId: "ES-9643", planId: "PLAN-RG-05", networkId: "NET-OOO-QA", createdAt: "2026-08-23T06:48:14.000Z", completedAt: "2026-08-23T06:48:18.000Z", initiatedBy: "Jane Doe" },
  { id: "OP-2402", type: "reactivation", status: "pending", customerId: "CUS-1029", esimId: "ES-9772", planId: "PLAN-AM-10", networkId: "NET-ROG-CA", createdAt: "2026-08-23T06:20:05.000Z", initiatedBy: "Orbit automation" },
  { id: "OP-2401", type: "esim_created", status: "completed", esimId: "ES-9718", planId: "PLAN-GL-15", networkId: "NET-TMO-US", createdAt: "2026-08-23T05:42:31.000Z", completedAt: "2026-08-23T05:42:38.000Z", initiatedBy: "Jane Doe" },
  { id: "OP-2399", type: "esim_activation", status: "completed", customerId: "CUS-1002", esimId: "ES-9664", planId: "PLAN-EU-20", networkId: "NET-ORA-FR", createdAt: "2026-08-22T18:14:10.000Z", completedAt: "2026-08-22T18:14:21.000Z", initiatedBy: "Orbit automation" },
  { id: "OP-2394", type: "esim_assignment", status: "cancelled", customerId: "CUS-1007", esimId: "ES-9681", planId: "PLAN-AP-08", networkId: "NET-SIN-SG", createdAt: "2026-08-21T14:38:20.000Z", completedAt: "2026-08-21T14:39:02.000Z", initiatedBy: "Jane Doe" },
  { id: "OP-2388", type: "customer_created", status: "completed", customerId: "CUS-0991", createdAt: "2026-08-19T10:04:12.000Z", completedAt: "2026-08-19T10:04:13.000Z", initiatedBy: "Orbit API" },
  { id: "OP-2381", type: "top_up", status: "failed", customerId: "CUS-1023", esimId: "ES-9755", planId: "PLAN-RG-05", networkId: "NET-ETI-AE", createdAt: "2026-08-17T15:22:18.000Z", completedAt: "2026-08-17T15:22:24.000Z", initiatedBy: "Orbit API", errorCode: "BALANCE_AUTH_FAILED", errorMessage: "The top-up authorization could not be completed for this account.", failedStep: "Balance authorized" },
  { id: "OP-2366", type: "plan_assignment", status: "completed", customerId: "CUS-1012", esimId: "ES-9697", planId: "PLAN-AM-10", networkId: "NET-TMO-US", createdAt: "2026-08-12T11:07:54.000Z", completedAt: "2026-08-12T11:08:01.000Z", initiatedBy: "Jane Doe" },
  { id: "OP-2342", type: "suspension", status: "completed", customerId: "CUS-1007", esimId: "ES-9681", planId: "PLAN-AP-08", networkId: "NET-SIN-SG", createdAt: "2026-07-29T16:33:08.000Z", completedAt: "2026-07-29T16:33:12.000Z", initiatedBy: "Orbit automation" },
  { id: "OP-2318", type: "esim_created", status: "completed", customerId: "CUS-1023", esimId: "ES-9755", planId: "PLAN-RG-05", networkId: "NET-ETI-AE", createdAt: "2026-07-18T09:26:44.000Z", completedAt: "2026-07-18T09:26:51.000Z", initiatedBy: "Orbit API" },
] as const;

const operationLifecycle = (operation: Operation): OperationEvent[] => {
  const startedAt = new Date(new Date(operation.createdAt).getTime() + 1000).toISOString();
  if (operation.status === "failed") return [
    { id: `${operation.id}-EV-1`, operationId: operation.id, label: "Requested", detail: "Orbit accepted the operational request.", timestamp: operation.createdAt, status: "completed" },
    { id: `${operation.id}-EV-2`, operationId: operation.id, label: "Processing started", detail: "The request was sent to the provisioning workflow.", timestamp: startedAt, status: "completed" },
    { id: `${operation.id}-EV-3`, operationId: operation.id, label: operation.failedStep ?? "Provider rejected request", detail: operation.errorMessage ?? "The operation could not be completed.", timestamp: operation.completedAt ?? startedAt, status: "failed" },
    { id: `${operation.id}-EV-4`, operationId: operation.id, label: "Failed", detail: operation.errorCode ?? "Operation failed", timestamp: operation.completedAt ?? startedAt, status: "failed" },
  ];
  if (operation.status === "pending") return [{ id: `${operation.id}-EV-1`, operationId: operation.id, label: "Requested", detail: "The request is waiting for processing capacity.", timestamp: operation.createdAt, status: "pending" }];
  if (operation.status === "processing") return [
    { id: `${operation.id}-EV-1`, operationId: operation.id, label: "Requested", detail: "Orbit accepted the operational request.", timestamp: operation.createdAt, status: "completed" },
    { id: `${operation.id}-EV-2`, operationId: operation.id, label: "Processing started", detail: "The request is currently being processed.", timestamp: startedAt, status: "processing" },
  ];
  if (operation.status === "cancelled") return [
    { id: `${operation.id}-EV-1`, operationId: operation.id, label: "Requested", detail: "Orbit accepted the operational request.", timestamp: operation.createdAt, status: "completed" },
    { id: `${operation.id}-EV-2`, operationId: operation.id, label: "Cancelled", detail: "The request was cancelled before completion.", timestamp: operation.completedAt ?? startedAt, status: "failed" },
  ];
  const completedAt = operation.completedAt ?? startedAt;
  return [
    { id: `${operation.id}-EV-1`, operationId: operation.id, label: "Requested", detail: "Orbit accepted the operational request.", timestamp: operation.createdAt, status: "completed" },
    { id: `${operation.id}-EV-2`, operationId: operation.id, label: "Processing started", detail: "The request entered the provisioning workflow.", timestamp: startedAt, status: "completed" },
    { id: `${operation.id}-EV-3`, operationId: operation.id, label: operation.type === "esim_activation" ? "Provider accepted request" : "Change applied", detail: operation.type === "esim_activation" ? "The connectivity provider accepted the request." : "The requested domain change was applied.", timestamp: new Date(new Date(completedAt).getTime() - 1000).toISOString(), status: "completed" },
    { id: `${operation.id}-EV-4`, operationId: operation.id, label: "Completed", detail: "The operation completed successfully.", timestamp: completedAt, status: "completed" },
  ];
};

export const mockOperationEvents: readonly OperationEvent[] = mockOperations.flatMap(operationLifecycle);

const customerActivitySeed = mockCustomers.flatMap<ActivityEvent>((customer, customerIndex) => {
  const customerEsims = mockEsims.filter((esim) => esim.customerId === customer.id);
  const events: ActivityEvent[] = [{ id: `ACT-${customer.id}-CREATED`, entityType: "customer", entityId: customer.id, type: "customer-created", title: "Customer created", detail: `${customer.firstName} ${customer.lastName} joined Orbit.`, date: customer.joinedDate }];
  customerEsims.forEach((esim, index) => {
    const eventDate = esim.activationDate === "—" ? customer.joinedDate : esim.activationDate;
    events.push({ id: `ACT-${esim.id}-ASSIGNED`, entityType: "customer", entityId: customer.id, type: "esim-assigned", title: "eSIM assigned", detail: `${esim.label} (${esim.id}) was assigned.`, date: eventDate });
    if (esim.status !== "Pending") events.push({ id: `ACT-${esim.id}-PLAN`, entityType: "customer", entityId: customer.id, type: "plan-added", title: "Data plan added", detail: `${mockPlans.find((plan) => plan.id === esim.planId)?.name ?? "Orbit plan"} added to ${esim.id}.`, date: eventDate });
    if (esim.status === "Active") events.push({ id: `ACT-${esim.id}-ACTIVE`, entityType: "customer", entityId: customer.id, type: "esim-activated", title: "eSIM activated", detail: `${esim.label} connected successfully.`, date: eventDate });
    if (esim.status === "Suspended") events.push({ id: `ACT-${esim.id}-SUSPENDED`, entityType: "customer", entityId: customer.id, type: "esim-suspended", title: "eSIM suspended", detail: `${esim.label} was suspended by an administrator.`, date: "2026-08-15" });
    if ((customerIndex + index) % 2 === 0) events.push({ id: `ACT-${esim.id}-TOPUP`, entityType: "customer", entityId: customer.id, type: "top-up-completed", title: "Top-up completed", detail: `A 5 GB top-up was added to ${esim.label}.`, date: "2026-08-04" });
  });
  return events;
});

const planActivitySeed = mockPlans.flatMap<ActivityEvent>((plan, planIndex) => {
  const planEsims = mockEsims.filter((esim) => esim.planId === plan.id);
  const events: ActivityEvent[] = [
    { id: `PACT-${plan.id}-CREATED`, entityType: "plan", entityId: plan.id, type: "plan-created", title: "Plan created", detail: `${plan.name} was added to the Orbit catalog.`, date: plan.createdDate },
    { id: `PACT-${plan.id}-STATUS`, entityType: "plan", entityId: plan.id, type: plan.status === "Active" ? "plan-activated" : "plan-deactivated", title: plan.status === "Active" ? "Plan activated" : "Plan deactivated", detail: `${plan.name} was marked ${plan.status.toLocaleLowerCase()}.`, date: plan.updatedDate },
  ];
  if (planIndex % 2 === 0) events.push({ id: `PACT-${plan.id}-PRICE`, entityType: "plan", entityId: plan.id, type: "price-changed", title: "Retail price changed", detail: `Retail price updated to ${plan.currency} ${plan.retailPrice.toFixed(2)}.`, date: "2026-06-18" });
  if (plan.coverage.length > 2) events.push({ id: `PACT-${plan.id}-COVERAGE`, entityType: "plan", entityId: plan.id, type: "coverage-updated", title: "Coverage updated", detail: `${plan.coverage.length} coverage markets are now included.`, date: "2026-07-22" });
  planEsims.forEach((esim) => events.push({ id: `PACT-${plan.id}-${esim.id}`, entityType: "plan", entityId: plan.id, type: "plan-assigned", title: "Plan assigned to eSIM", detail: `${plan.name} was assigned to ${esim.label} (${esim.id}).`, date: esim.activationDate === "—" ? plan.updatedDate : esim.activationDate }));
  return events;
});

const networkActivitySeed = mockNetworks.flatMap<ActivityEvent>((networkEntity, networkIndex) => {
  const operator = mockOperators.find((item) => item.id === networkEntity.operatorId);
  const country = mockCountries.find((item) => item.id === networkEntity.countryId);
  const linkedPlans = mockPlans.filter((plan) => plan.coverage.some((entry) => entry.networkIds.includes(networkEntity.id)));
  const events: ActivityEvent[] = [
    { id: `NACT-${networkEntity.id}-ADDED`, entityType: "network", entityId: networkEntity.id, type: "network-added", title: "Network added", detail: `${operator?.name ?? "Operator"} in ${country?.name ?? "this market"} was added to Orbit coverage.`, date: networkEntity.createdDate },
  ];
  if (networkEntity.technologies.includes("5G")) events.push({ id: `NACT-${networkEntity.id}-5G`, entityType: "network", entityId: networkEntity.id, type: "5g-enabled", title: "5G enabled", detail: "5G capability became available for compatible Orbit plans.", date: "2026-04-18" });
  linkedPlans.forEach((plan) => events.push({ id: `NACT-${networkEntity.id}-${plan.id}`, entityType: "network", entityId: networkEntity.id, type: "plan-coverage-added", title: "Plan coverage added", detail: `${plan.name} now supports this network.`, date: "2026-06-24" }));
  if (networkIndex % 4 === 0) events.push({ id: `NACT-${networkEntity.id}-CONFIG`, entityType: "network", entityId: networkEntity.id, type: "operator-updated", title: "Operator configuration updated", detail: "Internal routing metadata was reviewed and updated.", date: "2026-07-11" });
  if (networkEntity.status === "Unavailable") events.push({ id: `NACT-${networkEntity.id}-DOWN`, entityType: "network", entityId: networkEntity.id, type: "network-unavailable", title: "Network temporarily unavailable", detail: "Mock operational telemetry indicates a temporary availability event.", date: "2026-08-21" });
  if (networkEntity.status === "Degraded") events.push({ id: `NACT-${networkEntity.id}-RESTORED`, entityType: "network", entityId: networkEntity.id, type: "network-restored", title: "Network partially restored", detail: "Availability improved after a temporary service event.", date: "2026-08-21" });
  if (networkEntity.status === "Disabled") events.push({ id: `NACT-${networkEntity.id}-DISABLED`, entityType: "network", entityId: networkEntity.id, type: "network-disabled", title: "Network disabled", detail: "The network was disabled for new Orbit assignments.", date: networkEntity.updatedDate });
  return events;
});

export const mockActivityEvents: readonly ActivityEvent[] = [...customerActivitySeed, ...planActivitySeed, ...networkActivitySeed];
