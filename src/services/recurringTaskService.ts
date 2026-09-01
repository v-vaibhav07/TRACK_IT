import { supabase } from "../lib/supabase";
import type { RecurringTask } from "../types/database";
import type { TaskDraft } from "../types/dashboard";

export async function fetchActiveRecurringTasks(
  userId: string,
  upToDate: string
): Promise<RecurringTask[]> {
  const { data, error } = await supabase
    .from("recurring_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .lte("start_date", upToDate);
  if (error) throw error;
  return data ?? [];
}

export async function createRecurringTask(
  userId: string,
  draft: TaskDraft
): Promise<RecurringTask> {
  const { data, error } = await supabase
    .from("recurring_tasks")
    .insert({
      user_id: userId,
      title: draft.title,
      description: draft.description || null,
      category: draft.category || null,
      difficulty: draft.difficulty ?? null,
      start_date: draft.task_date,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Stops future occurrences of a recurring task. History is preserved:
 * already-materialized daily_tasks rows have their recurring_task_id
 * set to null (via ON DELETE SET NULL) and remain as standalone tasks. */
export async function stopRecurringTask(recurringTaskId: string): Promise<void> {
  const { error } = await supabase
    .from("recurring_tasks")
    .delete()
    .eq("id", recurringTaskId);
  if (error) throw error;
}
