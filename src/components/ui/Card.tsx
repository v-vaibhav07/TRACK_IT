import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  icon,
  title,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-soft)] px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <h2 className="truncate text-sm font-semibold text-[var(--color-ink)]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
