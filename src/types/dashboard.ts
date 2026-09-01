import type { DailyActivity, DailyTask } from "./database";

export type CalendarDayStatus = "none" | "partial" | "complete" | "future";

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: CalendarDayStatus;
  activity: DailyActivity | null;
}

export interface DashboardStats {
  currentStreak: number;
  monthDaysActive: number;
  monthCompletionRate: number;
  todayTotal: number;
  todayCompleted: number;
}

export interface TaskDraft {
  title: string;
  description: string;
  category: string;
  difficulty: DailyTask["difficulty"];
  task_date: string;
  /** When true, this task repeats every day from task_date onward
   * (as a recurring_tasks template) until explicitly stopped. */
  repeatDaily: boolean;
}
