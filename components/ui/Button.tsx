import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  compact?: boolean;
}

export function Button({ className = "", variant = "secondary", compact = false, ...props }: ButtonProps) {
  return <button className={`orbit-button ${variant}${compact ? " compact" : ""}${className ? ` ${className}` : ""}`} {...props} />;
}
