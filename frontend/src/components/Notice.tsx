import type { ReactNode } from "react";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, string> = {
  error: "border-red-500/40 bg-red-500/10 text-red-300",
  success: "border-lime/40 bg-lime/10 text-lime",
  info: "border-line bg-ink-800 text-ash-200",
};

export function Notice({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-5 py-4 text-sm ${tones[tone]}`}
    >
      {children}
    </p>
  );
}
