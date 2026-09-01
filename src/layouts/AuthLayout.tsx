import type { ReactNode } from "react";
import { Braces } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4 py-12">
      {/* subtle backdrop grid + glow, single deliberate moment */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <Braces className="h-5 w-5 text-[var(--color-accent-strong)]" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">
            {subtitle}
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl shadow-black/20">
          {children}
        </div>
      </div>
    </div>
  );
}
