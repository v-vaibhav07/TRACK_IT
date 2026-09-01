import { Flame, Calendar, TrendingUp, ListChecks } from "lucide-react";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import type { DashboardStats } from "../../types/dashboard";

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <Card className="p-4 hover:border-[var(--color-ink-faint)] sm:p-5">
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <span className="text-xs font-medium text-[var(--color-ink-muted)]">
          {label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-[26px]">
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-[var(--color-ink-faint)]">
        {sublabel}
      </p>
    </Card>
  );
}

export function StatCards({
  stats,
  loading,
}: {
  stats: DashboardStats;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={<Flame className="h-3.5 w-3.5 text-[var(--color-warning)]" />}
        iconBg="var(--color-warning-soft)"
        label="Current Streak"
        value={`${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`}
        sublabel={
          stats.currentStreak > 0
            ? `${stats.currentStreak} consecutive completed day${stats.currentStreak === 1 ? "" : "s"}`
            : "Complete a full day to start"
        }
      />
      <StatCard
        icon={<Calendar className="h-3.5 w-3.5 text-[var(--color-success)]" />}
        iconBg="var(--color-success-soft)"
        label="This Month"
        value={`${stats.monthDaysActive} day${stats.monthDaysActive === 1 ? "" : "s"}`}
        sublabel="Fully completed days"
      />
      <StatCard
        icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--color-accent-strong)]" />}
        iconBg="var(--color-accent-soft)"
        label="Completion Rate"
        value={`${stats.monthCompletionRate}%`}
        sublabel="Of active days this month"
      />
      <StatCard
        icon={<ListChecks className="h-3.5 w-3.5 text-[var(--color-info)]" />}
        iconBg="var(--color-info-soft)"
        label="Today"
        value={`${stats.todayCompleted}/${stats.todayTotal}`}
        sublabel={
          stats.todayTotal === 0
            ? "No tasks planned yet"
            : `${stats.todayTotal - stats.todayCompleted} task${stats.todayTotal - stats.todayCompleted === 1 ? "" : "s"} remaining`
        }
      />
    </div>
  );
}
