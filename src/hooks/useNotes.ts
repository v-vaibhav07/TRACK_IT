import { useCallback, useEffect, useRef, useState } from "react";
import { fetchNoteForDate, upsertNote } from "../services/noteService";
import { useToast } from "./useToast";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function useNotes(userId: string | null, date: string) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const { showToast } = useToast();
  const debounceRef = useRef<number | null>(null);
  const latestContentRef = useRef("");

  useEffect(() => {
    let active = true;
    if (!userId) return;
    setLoading(true);
    setSaveState("idle");
    fetchNoteForDate(userId, date)
      .then((note) => {
        if (!active) return;
        setContent(note?.content ?? "");
        latestContentRef.current = note?.content ?? "";
      })
      .catch(() => {
        if (active) showToast("Couldn't load today's notes.", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, date]);

  const scheduleSave = useCallback(
    (value: string) => {
      latestContentRef.current = value;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      setSaveState("saving");
      debounceRef.current = window.setTimeout(async () => {
        if (!userId) return;
        try {
          await upsertNote(userId, date, latestContentRef.current);
          setSaveState("saved");
        } catch {
          setSaveState("error");
          showToast("Couldn't save your note.", "error");
        }
      }, 800);
    },
    [userId, date, showToast]
  );

  const onChange = useCallback(
    (value: string) => {
      setContent(value);
      scheduleSave(value);
    },
    [scheduleSave]
  );

  return { content, onChange, loading, saveState };
}
