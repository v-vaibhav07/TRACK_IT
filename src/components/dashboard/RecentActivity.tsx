import { History } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import type { DailyActivity } from "../../types/database";
import { formatLongDate } from "../../lib/dateUtils";

export function RecentActivity({
  items,
  loading,
}: {
  items: DailyActivity[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader
        icon={<History className="h-4 w-4 text-[var(--color-accent-strong)]" />}
        title="Recent Activity"
      />
      <div className="px-4 py-4 sm:px-5">
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
              <History className="h-4 w-4 text-[var(--color-ink-faint)]" />
            </div>
            <p className="text-xs text-[var(--color-ink-faint)]">
              Your completed days will show up here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--color-border-soft)]">
            {items.map((item) => {
              const isFull = item.tasks_completed >= item.tasks_total && item.tasks_total > 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {formatLongDate(item.activity_date)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      isFull
                        ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                        : "bg-[var(--color-surface-3)] text-[var(--color-ink-muted)]"
                    }`}
                  >
                    {item.tasks_completed}/{item.tasks_total}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
