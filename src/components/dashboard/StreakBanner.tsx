import { Flame, CheckCircle2, Sparkles } from "lucide-react";

export function StreakBanner({
  todayTotal,
  todayCompleted,
  projectedStreak,
}: {
  todayTotal: number;
  todayCompleted: number;
  projectedStreak: number;
}) {
  if (todayTotal === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
        <Sparkles className="h-4 w-4 shrink-0 text-[var(--color-accent-strong)]" />
        <span>Add your first task to start building your streak.</span>
      </div>
    );
  }

  const remaining = todayTotal - todayCompleted;
  const allDone = remaining <= 0;

  if (allDone) {
    return (
      <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] px-4 py-3 text-sm text-[var(--color-ink)]">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
        <span>Great work! Today's goals are complete.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-warning)]/25 bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-ink)]">
      <Flame className="h-4 w-4 shrink-0 text-[var(--color-warning)]" />
      <span>
        Complete today's remaining {remaining} task{remaining === 1 ? "" : "s"} to extend your streak to {projectedStreak}.
      </span>
    </div>
  );
}
