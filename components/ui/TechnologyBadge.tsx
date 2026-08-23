import type { NetworkTechnology } from "@/types/domain";

interface TechnologyBadgeProps {
  technology: NetworkTechnology;
  label?: string;
}

export function TechnologyBadge({ technology, label = technology }: TechnologyBadgeProps) {
  return <span className={`technology-badge technology-${technology.toLocaleLowerCase()}`}>{label}</span>;
}
