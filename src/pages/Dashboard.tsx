import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import { useNotes } from "../hooks/useNotes";
import { useActivity } from "../hooks/useActivity";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { StatCards } from "../components/dashboard/StatCards";
import { StreakBanner } from "../components/dashboard/StreakBanner";
import { TodayProgress } from "../components/dashboard/TodayProgress";
import { TaskListCard } from "../components/dashboard/TaskListCard";
import { NotesCard } from "../components/dashboard/NotesCard";
import { MonthlyCalendar } from "../components/dashboard/MonthlyCalendar";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import {
  addDays,
  addMonths,
  formatLongDate,
  todayInTimezone,
  DEFAULT_TIMEZONE,
} from "../lib/dateUtils";
import { buildCalendarDays, calculateMonthStats } from "../lib/dashboardUtils";
import { calculateStreak, projectedStreakIfTodayCompleted } from "../lib/streakUtils";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const timezone = profile?.timezone || DEFAULT_TIMEZONE;
  const today = useMemo(() => todayInTimezone(timezone), [timezone]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [monthAnchor, setMonthAnchor] = useState(today);

  const userId = user?.id ?? null;

  const {
    tasks,
    loading: tasksLoading,
    mutatingIds,
    addTask,
    toggleTask,
    removeTask,
    stopRecurring,
    reload: reloadTasks,
  } = useTasks(userId, selectedDate);

  const notes = useNotes(userId, selectedDate);

  const {
    activityByDate,
    recent,
    loading: activityLoading,
    reload: reloadActivity,
  } = useActivity(userId, monthAnchor, today);

  const handleActivityChanged = () => {
    reloadActivity();
  };

  const todayActivity = activityByDate.get(today);
  const todayTotal =
    selectedDate === today ? tasks.length : todayActivity?.tasks_total ?? 0;
  const todayCompleted =
    selectedDate === today
      ? tasks.filter((t) => t.completed).length
      : todayActivity?.tasks_completed ?? 0;

  const currentStreak = useMemo(
    () => calculateStreak(activityByDate, today),
    [activityByDate, today]
  );

  const projectedStreak = useMemo(
    () => projectedStreakIfTodayCompleted(activityByDate, today),
    [activityByDate, today]
  );

  const monthStats = useMemo(
    () => calculateMonthStats(monthAnchor, activityByDate),
    [monthAnchor, activityByDate]
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(monthAnchor, today, activityByDate),
    [monthAnchor, today, activityByDate]
  );

  const stats = {
    currentStreak,
    monthDaysActive: monthStats.activeDays,
    monthCompletionRate: monthStats.rate,
    todayTotal,
    todayCompleted,
  };

  return (
    <DashboardLayout streak={currentStreak}>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-[28px]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {formatLongDate(today)}
        </p>
      </div>

      <div className="mt-5">
        <StatCards stats={stats} loading={activityLoading && tasksLoading} />
      </div>

      <div className="mt-4">
        <StreakBanner
          todayTotal={todayTotal}
          todayCompleted={todayCompleted}
          projectedStreak={projectedStreak}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Left column */}
        <div className="flex flex-col gap-5 min-w-0">
          <TodayProgress completed={todayCompleted} total={todayTotal} />

          <TaskListCard
            selectedDate={selectedDate}
            today={today}
            tasks={tasks}
            loading={tasksLoading}
            mutatingIds={mutatingIds}
            onPrevDay={() => setSelectedDate((d) => addDays(d, -1))}
            onNextDay={() => setSelectedDate((d) => addDays(d, 1))}
            onToday={() => setSelectedDate(today)}
            onToggle={(task) => toggleTask(task, handleActivityChanged)}
            onDelete={(task) => removeTask(task, handleActivityChanged)}
            onAdd={(draft) => addTask(draft, handleActivityChanged)}
            onRefresh={reloadTasks}
            onStopRecurring={stopRecurring}
          />

          <NotesCard
            content={notes.content}
            onChange={notes.onChange}
            loading={notes.loading}
            saveState={notes.saveState}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 min-w-0">
          <MonthlyCalendar
            monthAnchor={monthAnchor}
            days={calendarDays}
            loading={activityLoading}
            selectedDate={selectedDate}
            onPrevMonth={() => setMonthAnchor((m) => addMonths(m, -1))}
            onNextMonth={() => setMonthAnchor((m) => addMonths(m, 1))}
            onToday={() => {
              setMonthAnchor(today);
              setSelectedDate(today);
            }}
            onSelectDate={(date) => setSelectedDate(date)}
            monthActiveDays={monthStats.activeDays}
            monthRate={monthStats.rate}
          />

          <RecentActivity items={recent} loading={activityLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
