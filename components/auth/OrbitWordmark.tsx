type OrbitWordmarkProps = {
  className?: string;
  label?: string;
};

export function OrbitWordmark({ className = "", label = "Orbit" }: OrbitWordmarkProps) {
  return (
    <span
      className={`orbit-wordmark ${className}`.trim()}
      role="img"
      aria-label={label}
    />
  );
}
