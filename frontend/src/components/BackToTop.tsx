import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";

/** Floating "back to top" control. Hidden until the user has scrolled past
 *  roughly one screen, so it never sits over the hero. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    // Honour the OS "reduce motion" setting rather than always animating.
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      // Kept in the DOM and faded out, so the transition works both ways.
      // `invisible` also takes it out of the tab order while hidden.
      className={[
        "fixed bottom-6 right-5 z-40 grid h-12 w-12 place-items-center rounded-full",
        "bg-lime text-void shadow-lg shadow-lime/20 transition-all duration-300",
        "hover:bg-lime-600 focus-visible:ring-2 focus-visible:ring-lime",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-void sm:bottom-8 sm:right-8",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none invisible translate-y-3 opacity-0",
      ].join(" ")}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
