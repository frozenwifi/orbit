import type { Operator } from "@/types/domain";

export function OperatorLogo({ operator }: Readonly<{ operator: Operator }>) {
  if (operator.logoAsset) return <span className={`network-operator-logo${operator.name === "Setar GSM" ? " network-operator-logo--setar" : ""}`}><img src={operator.logoAsset} alt={`${operator.name} logo`} /></span>;
  return <span className="network-operator-logo network-operator-wordmark" aria-label={`${operator.name} logo`}>{operator.name}</span>;
}
