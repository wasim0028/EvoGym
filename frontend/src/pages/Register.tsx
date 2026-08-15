import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/api/client";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { usePageTitle } from "@/hooks/usePageTitle";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export default function Register() {
  usePageTitle("Create an Account");
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const onSubmit = async (values: RegisterForm) => {
    setFormError(null);
    try {
      await createAccount({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      });
      navigate("/membership", { replace: true });
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
      eyebrow="Get started"
      title="Create your"
      highlight="account"
      lede="Set up your account first, then choose a membership — takes about a minute."
      footer={
        <>
          Already a member?{" "}
          <Link to="/login" className="font-semibold text-lime underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}

        <Field
          label="Name"
          autoComplete="name"
          placeholder="Your full name"
          error={errors.name?.message}
          {...register("name", {
            required: "Enter your name.",
            minLength: { value: 2, message: "That's a little short." },
          })}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Enter your email address.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "That email address doesn't look right.",
            },
          })}
        />
        <Field
          label="Phone"
          type="tel"
          autoComplete="tel"
          placeholder="Optional"
          hint="Used only for class reminders."
          {...register("phone")}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Choose a password.",
            minLength: { value: 6, message: "Use at least 6 characters." },
          })}
        />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
