import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

const VARIANTS: Record<string, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] focus-visible:ring-[var(--color-accent-soft)]",
  secondary:
    "bg-[var(--color-surface-3)] text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] focus-visible:ring-[var(--color-accent-soft)]",
  ghost:
    "bg-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] focus-visible:ring-[var(--color-accent-soft)]",
  danger:
    "bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] focus-visible:ring-[var(--color-danger-soft)]",
};

const SIZES: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] font-medium transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
