import { useCallback, useEffect, useState } from "react";
import type { DailyTask } from "../types/database";
import type { TaskDraft } from "../types/dashboard";
import {
  createTask,
  deleteTask,
  fetchTasksForDate,
  setTaskCompletion,
} from "../services/taskService";
import { createRecurringTask, stopRecurringTask } from "../services/recurringTaskService";
import { recalculateActivity } from "../services/activityService";
import { useToast } from "./useToast";

export function useTasks(userId: string | null, date: string) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingIds, setMutatingIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchTasksForDate(userId, date);
      setTasks(data);
    } catch {
      showToast("Couldn't load tasks. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, date, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(
    async (draft: TaskDraft, onActivityChanged: () => void) => {
      if (!userId) return;
      try {
        const nextPosition = tasks.length;
        let created: DailyTask;
        if (draft.repeatDaily) {
          const template = await createRecurringTask(userId, draft);
          created = await createTask(userId, draft, nextPosition, template.id);
        } else {
          created = await createTask(userId, draft, nextPosition);
        }
        setTasks((prev) => [...prev, created]);
        if (draft.task_date === date) {
          await recalculateActivity(date).catch(() => {});
        }
        onActivityChanged();
        showToast(
          draft.repeatDaily ? "Recurring task added." : "Task added.",
          "success"
        );
      } catch {
        showToast("Couldn't add task. Please try again.", "error");
      }
    },
    [userId, tasks.length, date, showToast]
  );

  const stopRecurring = useCallback(
    async (task: DailyTask) => {
      if (!task.recurring_task_id) return;
      const templateId = task.recurring_task_id;
      // Detach locally so the UI reflects "no longer recurring" immediately.
      setTasks((prev) =>
        prev.map((t) =>
          t.recurring_task_id === templateId
            ? { ...t, recurring_task_id: null }
            : t
        )
      );
      try {
        await stopRecurringTask(templateId);
        showToast("Stopped repeating. Past days are unaffected.", "info");
      } catch {
        showToast("Couldn't stop the recurring task. Try again.", "error");
        load();
      }
    },
    [showToast, load]
  );

  const toggleTask = useCallback(
    async (task: DailyTask, onActivityChanged: () => void) => {
      const nextCompleted = !task.completed;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                completed: nextCompleted,
                completed_at: nextCompleted ? new Date().toISOString() : null,
              }
            : t
        )
      );
      setMutatingIds((prev) => new Set(prev).add(task.id));
      try {
        const updated = await setTaskCompletion(task.id, nextCompleted);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
        await recalculateActivity(date).catch(() => {});
        onActivityChanged();
      } catch {
        // rollback
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        showToast("Couldn't update task. Reverted.", "error");
      } finally {
        setMutatingIds((prev) => {
          const next = new Set(prev);
          next.delete(task.id);
          return next;
        });
      }
    },
    [date, showToast]
  );

  const removeTask = useCallback(
    async (task: DailyTask, onActivityChanged: () => void) => {
      const prevTasks = tasks;
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      try {
        await deleteTask(task.id);
        await recalculateActivity(date).catch(() => {});
        onActivityChanged();
        showToast("Task removed.", "info");
      } catch {
        setTasks(prevTasks);
        showToast("Couldn't remove task. Reverted.", "error");
      }
    },
    [tasks, date, showToast]
  );

  return {
    tasks,
    loading,
    mutatingIds,
    addTask,
    toggleTask,
    removeTask,
    stopRecurring,
    reload: load,
  };
}
