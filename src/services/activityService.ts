import { supabase } from "../lib/supabase";
import type { DailyActivity } from "../types/database";

/** Fetch a range of activity rows (inclusive) for building the calendar
 * and streak calculations. Range should comfortably cover the visible
 * month plus enough lookback for streaks (~45 days is generous). */
export async function fetchActivityRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyActivity[]> {
  const { data, error } = await supabase
    .from("daily_activity")
    .select("*")
    .eq("user_id", userId)
    .gte("activity_date", startDate)
    .lte("activity_date", endDate)
    .order("activity_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecentActivity(
  userId: string,
  limit = 6
): Promise<DailyActivity[]> {
  const { data, error } = await supabase
    .from("daily_activity")
    .select("*")
    .eq("user_id", userId)
    .eq("had_activity", true)
    .order("activity_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Recalculates + upserts the activity roll-up for a given date via the
 * `recalculate_daily_activity` Postgres function (runs under RLS as the
 * calling user, so it can only ever touch that user's own row). */
export async function recalculateActivity(
  date: string
): Promise<DailyActivity> {
  const { data, error } = await supabase.rpc("recalculate_daily_activity", {
    p_date: date,
  });
  if (error) throw error;
  return data as DailyActivity;
}
