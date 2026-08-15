import { useEffect } from "react";

const SUFFIX = "EvoGym";

/** Sets the document title for a page and restores the previous one on
 *  unmount, so a single-page app still gets meaningful tab labels. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — ${SUFFIX}` : previous;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
