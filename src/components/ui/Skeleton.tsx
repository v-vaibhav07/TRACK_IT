export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse-soft rounded-[var(--radius-control)] bg-[var(--color-surface-3)] ${className}`}
      aria-hidden="true"
    />
  );
}
