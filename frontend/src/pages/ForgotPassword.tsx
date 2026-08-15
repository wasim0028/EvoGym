import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { api, ApiError } from "@/api/client";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { usePageTitle } from "@/hooks/usePageTitle";

interface ForgotForm {
  email: string;
}

export default function ForgotPassword() {
  usePageTitle("Reset Your Password");
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>();

  const onSubmit = async (values: ForgotForm) => {
    setFormError(null);
    try {
      await api.auth.forgotPassword(values.email);
      setSent(true);
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
      eyebrow="Password reset"
      title="Forgot your"
      highlight="password?"
      lede="Enter the email on your account and we'll send a link to set a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-semibold text-lime underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="py-2 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime/15">
            <EnvelopeIcon className="h-7 w-7 text-lime" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-bone">
            Check your inbox
          </h2>
          {/* Deliberately not confirming whether the address is registered —
              that would let anyone test which emails have accounts. */}
          <p className="mt-3 text-sm leading-relaxed text-ash-400">
            If <span className="text-bone">{getValues("email")}</span> is
            registered, a reset link is on its way. It expires in 30 minutes.
          </p>
          <p className="mt-4 text-xs text-ash-500">
            Nothing after a few minutes? Check spam, or try again.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {formError && <Notice tone="error">{formError}</Notice>}

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

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
