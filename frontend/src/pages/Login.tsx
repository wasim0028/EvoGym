import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/api/client";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const from = (location.state as { from?: string } | null)?.from ?? "/account";

  const onSubmit = async (values: LoginForm) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Couldn't reach the server. Try again in a moment.",
      );
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to"
      highlight="EvoGym"
      lede="Pick up where you left off — membership, sessions and receipts."
      footer={
        <>
          No account yet?{" "}
          <Link to="/register" className="font-semibold text-lime underline underline-offset-4">
            Get started
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}

        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", { required: "Enter your email address." })}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", { required: "Enter your password." })}
        />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
