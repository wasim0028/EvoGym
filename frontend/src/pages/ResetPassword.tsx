import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { api, ApiError } from "@/api/client";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { usePageTitle } from "@/hooks/usePageTitle";

interface ResetForm {
  password: string;
  confirm: string;
}

export default function ResetPassword() {
  usePageTitle("Choose a New Password");
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();

  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>();

  const onSubmit = async (values: ResetForm) => {
    setFormError(null);
    try {
      await api.auth.resetPassword({ token, password: values.password });
      setDone(true);
      // Give the confirmation a beat to be read before moving on.
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Couldn't reach the server. Try again in a moment.",
      );
    }
  };

  // A link with no token can't work — say so up front rather than after
  // the user has typed a new password twice.
  if (!token) {
    return (
      <AuthShell
        eyebrow="Password reset"
        title="This link is"
        highlight="incomplete"
        lede="The reset link is missing its token. It may have been cut short by your email client."
        footer={
          <Link
            to="/forgot-password"
            className="font-semibold text-lime underline underline-offset-4"
          >
            Request a new link
          </Link>
        }
      >
        <Notice tone="error">
          Open the link directly from the email, or request a fresh one.
        </Notice>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Choose a new"
      highlight="password"
      lede="Pick something you don't use anywhere else. You'll be signed out of other devices."
      footer={
        <>
          Changed your mind?{" "}
          <Link
            to="/login"
            className="font-semibold text-lime underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      {done ? (
        <div className="py-2 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime/15">
            <CheckCircleIcon className="h-8 w-8 text-lime" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-bone">
            Password updated
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ash-400">
            Taking you to the sign-in page…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {formError && <Notice tone="error">{formError}</Notice>}

          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register("password", {
              required: "Choose a new password.",
              minLength: { value: 6, message: "Use at least 6 characters." },
            })}
          />
          <Field
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Type it again"
            error={errors.confirm?.message}
            {...register("confirm", {
              required: "Confirm your new password.",
              validate: (value) =>
                value === watch("password") || "Those passwords don't match.",
            })}
          />

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
