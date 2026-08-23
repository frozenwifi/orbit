import type { ApiApplication } from "@/types/domain";

export const filterApiApplications = (applications: readonly ApiApplication[], query: string) => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [...applications];
  return applications.filter((application) => [application.name, application.apiKey].some((value) => value.toLocaleLowerCase().includes(normalized)));
};

export const maskApiSecret = () => "••••••••••••••••";
