import type { ComponentType, SVGProps } from "react";

/** The floating lime chips that orbit the hero image. */
export function StatBadge({
  icon: Icon,
  label,
  value,
  className = "",
  tone = "lime",
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  className?: string;
  tone?: "lime" | "dark";
}) {
  const isLime = tone === "lime";

  return (
    <div
      className={[
        "animate-drift rounded-[1.4rem] px-4 py-3 shadow-lg backdrop-blur-sm",
        isLime
          ? "bg-lime text-void shadow-lime/20"
          : "border border-line bg-ink-800/90 text-bone",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={`h-3.5 w-3.5 ${isLime ? "text-void/70" : "text-lime"}`}
        />
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isLime ? "text-void/70" : "text-ash-400"
          }`}
        >
          {label}
        </span>
      </div>
      <p className="mt-0.5 text-lg font-extrabold leading-none tracking-tight">
        {value}
      </p>
    </div>
  );
}
