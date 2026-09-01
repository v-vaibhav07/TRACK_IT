import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { loginUser } from "../services/authService";
import { useToast } from "../hooks/useToast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!email || !password) {
      setErrors({
        email: !email ? "Email is required" : "",
        password: !password ? "Password is required" : "",
      });
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't sign in. Try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep your DSA streak alive."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
        />
        <div className="flex justify-end -mt-1">
          <Link
            to="/forgot-password"
            className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-accent-strong)]"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="mt-1 w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--color-ink-muted)]">
        New here?{" "}
        <Link
          to="/register"
          className="font-medium text-[var(--color-accent-strong)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
