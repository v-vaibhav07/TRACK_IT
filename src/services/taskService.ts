import { supabase } from "../lib/supabase";
import type { DailyTask } from "../types/database";
import type { TaskDraft } from "../types/dashboard";
import { fetchActiveRecurringTasks } from "./recurringTaskService";

async function fetchRawTasksForDate(
  userId: string,
  date: string
): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("task_date", date)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Ensures every active recurring template due by `date` has a
 * concrete daily_tasks occurrence for that date, creating any that
 * are missing (e.g. because the user never opened the app on that
 * day before). Safe to call repeatedly — a unique index on
 * (recurring_task_id, task_date) prevents duplicates under races. */
async function materializeRecurringOccurrences(
  userId: string,
  date: string,
  existing: DailyTask[]
): Promise<void> {
  const templates = await fetchActiveRecurringTasks(userId, date);
  if (templates.length === 0) return;

  const existingTemplateIds = new Set(
    existing.map((t) => t.recurring_task_id).filter(Boolean)
  );
  const missing = templates.filter((t) => !existingTemplateIds.has(t.id));
  if (missing.length === 0) return;

  const startPosition = existing.length;
  const rows = missing.map((template, i) => ({
    user_id: userId,
    task_date: date,
    title: template.title,
    description: template.description,
    category: template.category,
    difficulty: template.difficulty,
    recurring_task_id: template.id,
    position: startPosition + i,
  }));

  // Ignore duplicate-key races (unique index on recurring_task_id + task_date)
  // rather than failing the whole fetch — another tab may have just created it.
  const { error } = await supabase.from("daily_tasks").insert(rows);
  if (error && error.code !== "23505") throw error;
}

export async function fetchTasksForDate(
  userId: string,
  date: string
): Promise<DailyTask[]> {
  const initial = await fetchRawTasksForDate(userId, date);
  try {
    await materializeRecurringOccurrences(userId, date, initial);
  } catch {
    // If materialization fails, still return what we have rather than
    // blocking the whole day's task list.
    return initial;
  }
  return fetchRawTasksForDate(userId, date);
}

export async function createTask(
  userId: string,
  draft: TaskDraft,
  position: number,
  recurringTaskId: string | null = null
): Promise<DailyTask> {
  const { data, error } = await supabase
    .from("daily_tasks")
    .insert({
      user_id: userId,
      task_date: draft.task_date,
      title: draft.title,
      description: draft.description || null,
      category: draft.category || null,
      difficulty: draft.difficulty ?? null,
      position,
      recurring_task_id: recurringTaskId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setTaskCompletion(
  taskId: string,
  completed: boolean
): Promise<DailyTask> {
  const { data, error } = await supabase
    .from("daily_tasks")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from("daily_tasks").delete().eq("id", taskId);
  if (error) throw error;
}
