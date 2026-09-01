import type { DailyActivity } from "../types/database";
import type { CalendarDay, CalendarDayStatus } from "../types/dashboard";
import { getMonthGrid, getMonthKey, isSameMonth } from "./dateUtils";

export function buildCalendarDays(
  monthAnchor: string,
  today: string,
  activityByDate: Map<string, DailyActivity>
): CalendarDay[] {
  const grid = getMonthGrid(monthAnchor);

  return grid.map((date) => {
    const activity = activityByDate.get(date) ?? null;
    let status: CalendarDayStatus = "none";

    if (date > today) {
      status = "future";
    } else if (activity && activity.had_activity && activity.tasks_total > 0) {
      status =
        activity.tasks_completed >= activity.tasks_total
          ? "complete"
          : "partial";
    }

    return {
      date,
      dayOfMonth: Number(date.slice(-2)),
      isCurrentMonth: isSameMonth(date, monthAnchor),
      isToday: date === today,
      status,
      activity,
    };
  });
}

export function calculateMonthStats(
  monthAnchor: string,
  activityByDate: Map<string, DailyActivity>
): { activeDays: number; rate: number } {
  const monthKey = getMonthKey(monthAnchor);
  let activeDays = 0;
  let totalDaysConsidered = 0;

  for (const [date, activity] of activityByDate.entries()) {
    if (getMonthKey(date) !== monthKey) continue;
    if (!activity.had_activity || activity.tasks_total === 0) continue;
    totalDaysConsidered += 1;
    if (activity.tasks_completed >= activity.tasks_total) {
      activeDays += 1;
    }
  }

  const rate =
    totalDaysConsidered > 0
      ? Math.round((activeDays / totalDaysConsidered) * 100)
      : 0;

  return { activeDays, rate };
}

export function safePercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}
