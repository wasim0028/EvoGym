import type { ReactNode } from "react";

/** The recurring shape of this layout: a rounded card with its top-right
 *  corner sliced off, and a lime triangle showing through the gap. */
export function NotchCard({
  children,
  className = "",
  flag = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  flag?: boolean;
  as?: "div" | "article" | "li";
}) {
  return (
    <div className="relative">
      {flag && (
        <div
          aria-hidden="true"
          className="notch-flag absolute right-0 top-0 h-[2.4rem] w-[2.4rem] bg-lime"
        />
      )}
      <Tag
        className={`notch relative overflow-hidden rounded-[1.75rem] border border-line bg-ink-800 ${className}`}
      >
        {children}
      </Tag>
    </div>
  );
}
