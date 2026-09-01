import { supabase } from "../lib/supabase";
import type { DailyNote } from "../types/database";

export async function fetchNoteForDate(
  userId: string,
  date: string
): Promise<DailyNote | null> {
  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("note_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertNote(
  userId: string,
  date: string,
  content: string
): Promise<DailyNote> {
  const { data, error } = await supabase
    .from("daily_notes")
    .upsert(
      { user_id: userId, note_date: date, content },
      { onConflict: "user_id,note_date" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
