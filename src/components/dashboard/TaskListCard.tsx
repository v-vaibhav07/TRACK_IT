import { useState } from "react";
import {
  ListTodo,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw,
  Repeat,
  Ban,
} from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import type { DailyTask } from "../../types/database";
import { formatLongDate } from "../../lib/dateUtils";
import { AddTaskModal } from "./AddTaskModal";
import type { TaskDraft } from "../../types/dashboard";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-[var(--color-success)] bg-[var(--color-success-soft)]",
  Medium: "text-[var(--color-warning)] bg-[var(--color-warning-soft)]",
  Hard: "text-[var(--color-danger)] bg-[var(--color-danger-soft)]",
};

export function TaskListCard({
  selectedDate,
  today,
  tasks,
  loading,
  mutatingIds,
  onPrevDay,
  onNextDay,
  onToday,
  onToggle,
  onDelete,
  onAdd,
  onRefresh,
  onStopRecurring,
}: {
  selectedDate: string;
  today: string;
  tasks: DailyTask[];
  loading: boolean;
  mutatingIds: Set<string>;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onToggle: (task: DailyTask) => void;
  onDelete: (task: DailyTask) => void;
  onAdd: (draft: TaskDraft) => Promise<void>;
  onRefresh: () => void;
  onStopRecurring: (task: DailyTask) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const isToday = selectedDate === today;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <Card>
      <CardHeader
        icon={<ListTodo className="h-4 w-4 text-[var(--color-accent-strong)]" />}
        title="Daily DSA Work"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              aria-label="Sync tasks"
              className="hidden items-center gap-1 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] sm:flex"
            >
              <RefreshCw className="h-3 w-3" />
              Sync
            </button>
            <span className="text-xs text-[var(--color-ink-faint)]">
              {completedCount}/{tasks.length}
            </span>
          </div>
        }
      />

      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <span className="truncate text-xs text-[var(--color-ink-muted)]">
          {formatLongDate(selectedDate)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevDay}
            aria-label="Previous day"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onToday}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isToday
                ? "text-[var(--color-accent-strong)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Today
          </button>
          <button
            onClick={onNextDay}
            aria-label="Next day"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--color-border-soft)] px-4 py-4 sm:px-5">
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
              <ListTodo className="h-5 w-5 text-[var(--color-ink-faint)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">
                No tasks planned for {isToday ? "today" : "this day"}.
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                Add your first DSA task to get started and build your streak.
              </p>
            </div>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Platform
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`group flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border-soft)] bg-[var(--color-surface-2)] px-3.5 py-3 transition-opacity ${
                  mutatingIds.has(task.id) ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggle(task)}
                  aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[var(--color-border)] bg-[var(--color-surface-3)] accent-[var(--color-accent)]"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      task.completed
                        ? "text-[var(--color-ink-faint)] line-through"
                        : "text-[var(--color-ink)]"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {task.recurring_task_id && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent-strong)]">
                        <Repeat className="h-2.5 w-2.5" />
                        Repeats
                      </span>
                    )}
                    {task.category && (
                      <span className="rounded-full bg-[var(--color-surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink-muted)]">
                        {task.category}
                      </span>
                    )}
                    {task.difficulty && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLORS[task.difficulty]}`}
                      >
                        {task.difficulty}
                      </span>
                    )}
                    {task.completed_at && (
                      <span className="text-[10px] text-[var(--color-ink-faint)]">
                        Done{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(task.completed_at))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  {task.recurring_task_id && (
                    <button
                      onClick={() => onStopRecurring(task)}
                      aria-label={`Stop "${task.title}" from repeating`}
                      title="Stop repeating (keeps past history)"
                      className="rounded-md p-1.5 text-[var(--color-ink-faint)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-accent-strong)]"
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(task)}
                    aria-label={`Delete "${task.title}"`}
                    className="rounded-md p-1.5 text-[var(--color-ink-faint)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
            <button
              onClick={() => setModalOpen(true)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] py-2.5 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another task
            </button>
          </ul>
        )}
      </div>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={onAdd}
        defaultDate={selectedDate}
      />
    </Card>
  );
}
