import { NotebookPen } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import type { SaveState } from "../../hooks/useNotes";

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save",
};

export function NotesCard({
  content,
  onChange,
  loading,
  saveState,
}: {
  content: string;
  onChange: (value: string) => void;
  loading: boolean;
  saveState: SaveState;
}) {
  return (
    <Card>
      <CardHeader
        icon={<NotebookPen className="h-4 w-4 text-[var(--color-accent-strong)]" />}
        title="Daily Notes"
        action={
          SAVE_LABEL[saveState] && (
            <span
              className={`text-xs ${
                saveState === "error"
                  ? "text-[var(--color-danger)]"
                  : "text-[var(--color-ink-faint)]"
              }`}
            >
              {SAVE_LABEL[saveState]}
            </span>
          )
        }
      />
      <div className="p-4 sm:p-5">
        {loading ? (
          <Skeleton className="h-28" />
        ) : (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="What did I learn today? Thoughts, reflections..."
            rows={5}
            aria-label="Daily notes"
            className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--color-border-soft)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          />
        )}
      </div>
    </Card>
  );
}
