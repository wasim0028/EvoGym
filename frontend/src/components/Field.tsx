import { forwardRef, type InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/* forwardRef is REQUIRED here, not optional polish. react-hook-form's
   register() returns a ref, and React silently drops `ref` when it's spread
   onto a plain function component — so RHF would never attach to the input,
   would read every value as empty, and would fire "required" errors on
   fields the user had clearly filled in. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-ash-400"
      >
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-2xl border bg-ink-900 px-5 py-3.5 text-bone placeholder:text-ash-500",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-2 focus:ring-offset-void",
          error ? "border-red-500/70" : "border-line focus:border-ink-600",
        ].join(" ")}
        {...rest}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-ash-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
