import { CalendarDays, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import type { CalendarDay } from "../../types/dashboard";
import { getMonthLabel } from "../../lib/dateUtils";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const STATUS_STYLES: Record<CalendarDay["status"], string> = {
  none: "bg-[var(--color-surface-2)] text-[var(--color-ink-faint)]",
  partial:
    "bg-[var(--color-accent)]/25 text-[var(--color-ink)] border border-[var(--color-accent)]/40",
  complete: "bg-[var(--color-success)] text-[#06210f] font-semibold",
  future: "bg-transparent text-[var(--color-ink-faint)]/50",
};

export function MonthlyCalendar({
  monthAnchor,
  days,
  loading,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate,
  monthActiveDays,
  monthRate,
}: {
  monthAnchor: string;
  days: CalendarDay[];
  loading: boolean;
  selectedDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectDate: (date: string) => void;
  monthActiveDays: number;
  monthRate: number;
}) {
  return (
    <Card>
      <CardHeader
        icon={<CalendarDays className="h-4 w-4 text-[var(--color-accent-strong)]" />}
        title="Monthly Consistency"
      />

      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onToday}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            Today
          </button>
          <button
            onClick={onNextMonth}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs font-medium text-[var(--color-ink)]">
          {getMonthLabel(monthAnchor)}
        </span>
      </div>

      <div className="border-t border-[var(--color-border-soft)] px-4 py-4 sm:px-5">
        {loading ? (
          <Skeleton className="h-72" />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="pb-1 text-center text-[10px] font-medium tracking-wide text-[var(--color-ink-faint)]"
                >
                  {w}
                </div>
              ))}
              {days.map((day) => {
                const isSelected = day.date === selectedDate;
                return (
                  <button
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    disabled={day.status === "future"}
                    className={`relative flex aspect-square items-center justify-center rounded-[9px] text-xs transition-all disabled:cursor-not-allowed ${
                      day.isCurrentMonth ? "" : "opacity-40"
                    } ${STATUS_STYLES[day.status]} ${
                      isSelected ? "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-surface)]" : ""
                    } ${day.isToday && !isSelected ? "outline outline-1 outline-[var(--color-accent)]/60" : ""} hover:brightness-110`}
                    aria-label={`${day.date}${day.status === "complete" ? ", all tasks completed" : ""}`}
                    aria-current={day.isToday ? "date" : undefined}
                  >
                    {day.dayOfMonth}
                    {day.status === "complete" && (
                      <Check className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-soft)] pt-3">
              <div className="flex gap-4 text-xs">
                <span className="text-[var(--color-ink-muted)]">
                  This month:{" "}
                  <strong className="text-[var(--color-success)]">
                    {monthActiveDays} days
                  </strong>
                </span>
                <span className="text-[var(--color-ink-muted)]">
                  Rate: <strong className="text-[var(--color-ink)]">{monthRate}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[var(--color-ink-faint)]">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-surface-2)]" />
                  No activity
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-accent)]/40" />
                  Partial
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-success)]" />
                  Complete
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
