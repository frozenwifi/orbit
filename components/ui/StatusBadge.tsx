export type StatusBadgeTone = "success" | "neutral" | "warning" | "danger" | "info";

interface StatusBadgeProps {
  label: string;
  tone?: StatusBadgeTone;
}

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`orbit-badge ${tone}`}><span className="orbit-badge-dot" aria-hidden="true" />{label}</span>;
}
