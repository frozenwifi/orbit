export interface AdminDataPlanRow {
  rowId: string;
  planId: string;
  region: string;
  displayId: string;
  name: string;
  wsp: number;
  rrp: number;
  dataGb: number;
  validityDays: number;
  wifiHotspot: boolean;
  coverageCountries: number;
}
