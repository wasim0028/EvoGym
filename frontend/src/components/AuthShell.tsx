import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";

export function AuthShell({
  eyebrow,
  title,
  highlight,
  lede,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  lede: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-lime/[0.08] blur-[130px]"
      />

      <div className="relative w-full max-w-md">
        <div className="relative">
          <div
            aria-hidden="true"
            className="notch-flag absolute right-0 top-0 z-10 h-[2.4rem] w-[2.4rem] bg-lime"
          />
          <div className="notch rounded-[1.75rem] border border-line bg-ink-800 p-8 sm:p-10">
            <Wordmark />

            <p className="eyebrow mt-8">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tightest text-bone">
              {title}{" "}
              <span className="text-lime">{highlight}</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ash-400">{lede}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-ash-400">{footer}</div>
      </div>
    </div>
  );
}
