import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { api, ApiError } from "@/api/client";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";

interface ContactFormValues {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

/* One form, used in two places: the section at the bottom of the landing page
   and the standalone /contact route. Sharing it means the two can't drift
   apart in wording or behaviour. */
export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>();

  const onSubmit = async (values: ContactFormValues) => {
    setFormError(null);
    try {
      await api.contact.create({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message || undefined,
      });
      reset();
      setSent(true);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Couldn't send that just now. Try again, or email us directly.",
      );
    }
  };

  if (sent) {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime/15">
          <CheckCircleIcon className="h-9 w-9 text-lime" />
        </span>
        <h3 className="mt-6 text-2xl font-extrabold text-bone">
          Message received
        </h3>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ash-400">
          Thanks for getting in touch. Our team will contact you on the email
          you gave us within one working day.
        </p>
        <div className="mt-8">
          <Button variant="outline" onClick={() => setSent(false)}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <ChatBubbleLeftRightIcon className="h-5 w-5 text-lime" />
        <h3 className="text-lg font-extrabold text-bone">Send us a message</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}

        <Field
          label="Name"
          autoComplete="name"
          placeholder="Your full name"
          error={errors.name?.message}
          {...register("name", {
            required: "Tell us who we're replying to.",
            minLength: { value: 2, message: "That's a little short." },
          })}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hint="This is where we'll reply."
          error={errors.email?.message}
          {...register("email", {
            required: "We need an email to reply to.",
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
          {...register("phone")}
        />

        {!compact && (
          <div className="space-y-2">
            <label
              htmlFor="message"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-ash-400"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="What are you training for?"
              className="w-full rounded-2xl border border-line bg-ink-900 px-5 py-3.5 text-bone placeholder:text-ash-500 focus:border-ink-600 focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-2 focus:ring-offset-void"
              {...register("message")}
            />
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Request a callback"}
        </Button>

        <p className="text-center text-xs text-ash-500">
          We only use your details to reply. No marketing lists.
        </p>
      </form>
    </>
  );
}
