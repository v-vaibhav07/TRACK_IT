import type { DailyActivity } from "../types/database";
import { addDays } from "./dateUtils";

/** A day "counts" toward a streak when the user completed every task
 * they planned for that day (and planned at least one task). */
function isQualifyingDay(activity: DailyActivity | undefined): boolean {
  if (!activity) return false;
  return (
    activity.had_activity &&
    activity.tasks_total > 0 &&
    activity.tasks_completed >= activity.tasks_total
  );
}

/**
 * Calculate the current consecutive-day streak.
 *
 * Rules implemented:
 * - Walk backwards day by day from `today`.
 * - If today already qualifies, include it and keep walking back.
 * - If today does NOT qualify yet, don't penalize it — start the walk
 *   from yesterday instead, so an in-progress (incomplete) today never
 *   breaks yesterday's streak.
 * - The first non-qualifying day (other than today) stops the count.
 * - Never looks at future dates.
 */
export function calculateStreak(
  activityByDate: Map<string, DailyActivity>,
  today: string
): number {
  let streak = 0;
  let cursor = today;

  if (isQualifyingDay(activityByDate.get(today))) {
    streak += 1;
    cursor = addDays(today, -1);
  } else {
    cursor = addDays(today, -1);
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const activity = activityByDate.get(cursor);
    if (!isQualifyingDay(activity)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

/** What the streak would become if the remaining tasks today were
 * completed. Used for the "extend your streak to N" banner copy. */
export function projectedStreakIfTodayCompleted(
  activityByDate: Map<string, DailyActivity>,
  today: string
): number {
  const withTodayCompleted = new Map(activityByDate);
  const existing = activityByDate.get(today);
  withTodayCompleted.set(today, {
    ...(existing ?? {
      id: "projected",
      user_id: "",
      activity_date: today,
      created_at: "",
      updated_at: "",
    }),
    activity_date: today,
    tasks_total: Math.max(existing?.tasks_total ?? 0, 1),
    tasks_completed: Math.max(existing?.tasks_total ?? 0, 1),
    completion_rate: 100,
    had_activity: true,
  });
  return calculateStreak(withTodayCompleted, today);
}
