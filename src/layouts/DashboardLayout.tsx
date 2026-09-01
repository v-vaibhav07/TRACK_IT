import type { ReactNode } from "react";
import { Braces, Flame, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { useState } from "react";

export function DashboardLayout({
  children,
  streak,
}: {
  children: ReactNode;
  streak: number;
}) {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.full_name || profile?.username || user?.email || "there";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch {
      showToast("Couldn't sign out. Try again.", "error");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border-soft)] bg-[var(--color-bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <Braces className="h-4 w-4 text-[var(--color-accent-strong)]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[var(--color-ink)] hidden sm:inline">
              DSA Tracker
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)]">
              <Flame className="h-3.5 w-3.5 text-[var(--color-warning)]" />
              <span>
                {streak} day{streak === 1 ? "" : "s"} streak
              </span>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-3)] text-xs font-semibold text-[var(--color-ink-muted)]">
                {initials || <UserIcon className="h-4 w-4" />}
              </div>
              <span className="max-w-[140px] truncate text-sm text-[var(--color-ink)]">
                {displayName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
