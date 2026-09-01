import { Card } from "../ui/Card";
import { safePercent } from "../../lib/dashboardUtils";

export function TodayProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = safePercent(completed, total);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
            Today's progress
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink)]">
            {completed} of {total} task{total === 1 ? "" : "s"} completed{" "}
            <span className="text-[var(--color-ink-muted)]">({pct}%)</span>
          </p>
        </div>
        {total === 0 && (
          <p className="text-sm font-medium text-[var(--color-accent-strong)]">
            Plan your day by adding tasks.
          </p>
        )}
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Today's task completion"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-strong)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
