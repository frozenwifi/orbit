interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  compact?: boolean;
}

export function ProgressBar({ value, max, label, compact = false }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <span className={`orbit-progress${compact ? " compact" : ""}`}>
      <span className="orbit-progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value.toFixed(1)} GB of ${max} GB used`}>
        <span className="orbit-progress-value" style={{ width: `${percentage}%` }} />
      </span>
    </span>
  );
}
