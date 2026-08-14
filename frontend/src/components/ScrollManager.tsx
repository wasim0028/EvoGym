import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Routers don't manage scroll for you: reset to the top on navigation, and
 *  honour a #hash once the target section has actually rendered. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    // querySelector throws on a malformed selector, so never trust the hash.
    const find = () => {
      try {
        return document.querySelector(hash);
      } catch {
        return null;
      }
    };

    // When arriving from another route the section isn't mounted yet on this
    // tick, so a single lookup silently falls through to "scroll to top".
    // Retry over a few frames before giving up.
    let attempts = 0;
    let frame = 0;

    const attempt = () => {
      const target = find();
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempts++ < 20) {
        frame = window.requestAnimationFrame(attempt);
      }
    };

    attempt();
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
