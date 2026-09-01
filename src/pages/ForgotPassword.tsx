import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { requestPasswordReset } from "../services/authService";
import { useToast } from "../hooks/useToast";
import { MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't send reset email.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a secure link to reset it."
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-success-soft)]">
            <MailCheck className="h-5 w-5 text-[var(--color-success)]" />
          </div>
          <p className="text-sm text-[var(--color-ink-muted)]">
            If an account exists for <strong className="text-[var(--color-ink)]">{email}</strong>,
            a reset link is on its way.
          </p>
          <Link
            to="/login"
            className="mt-1 text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Button type="submit" loading={loading} className="mt-1 w-full">
            Send reset link
          </Button>
          <Link
            to="/login"
            className="text-center text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent-strong)]"
          >
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
