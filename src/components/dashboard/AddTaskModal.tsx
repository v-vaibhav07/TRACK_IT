import { useState, type FormEvent } from "react";
import { Repeat } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { TaskDraft } from "../../types/dashboard";
import type { Difficulty } from "../../types/database";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export function AddTaskModal({
  open,
  onClose,
  onSubmit,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => Promise<void>;
  defaultDate: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [taskDate, setTaskDate] = useState(defaultDate);
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setCategory("");
    setDifficulty(null);
    setTaskDate(defaultDate);
    setRepeatDaily(false);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give your task a title.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty,
        task_date: taskDate,
        repeatDaily,
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add a task"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Two Sum on LeetCode"
          error={error}
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-description"
            className="text-xs font-medium text-[var(--color-ink-muted)]"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes about this task"
            rows={3}
            className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Category / Platform"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Arrays, LeetCode"
          />
          <Input
            label="Date"
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            Difficulty
          </span>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDifficulty(difficulty === d ? null : d)}
                className={`flex-1 rounded-[var(--radius-control)] border px-3 py-2 text-xs font-medium transition-colors ${
                  difficulty === d
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3">
          <input
            type="checkbox"
            checked={repeatDaily}
            onChange={(e) => setRepeatDaily(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[var(--color-border)] bg-[var(--color-surface-3)] accent-[var(--color-accent)]"
          />
          <span className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              <Repeat className="h-3.5 w-3.5 text-[var(--color-accent-strong)]" />
              Repeat daily
            </span>
            <span className="text-xs text-[var(--color-ink-faint)]">
              Automatically appears every day from {taskDate} onward, until you stop it.
            </span>
          </span>
        </label>

        <div className="mt-1 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting} className="flex-1">
            Add task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
