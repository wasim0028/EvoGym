import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/auth-context";
import { Wordmark } from "./Wordmark";
import { Button, ButtonLink } from "./Button";

const links = [
  { to: "/", label: "Home" },
  { to: "/#programmes", label: "Programmes" },
  { to: "/#equipment", label: "Equipment" },
  { to: "/membership", label: "Membership" },
  { to: "/#trainers", label: "Trainers" },
  { to: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const signOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-4">
      <div className="shell">
        <nav
          className={[
            "flex items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300 sm:px-5",
            scrolled
              ? "border-line bg-ink-900/85 backdrop-blur-xl"
              : "border-transparent bg-transparent",
          ].join(" ")}
        >
          <Wordmark />

          <div className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-ash-400 transition-colors hover:bg-ink-700 hover:text-bone"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Link
                  to="/account"
                  className="rounded-full px-4 py-2 text-sm font-medium text-bone transition-colors hover:text-lime"
                >
                  {user.name?.split(" ")[0] ?? "Account"}
                </Link>
                <Button variant="dark" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <ButtonLink to="/login" variant="dark" size="sm">
                  Sign in
                </ButtonLink>
                <ButtonLink to="/register" size="sm">
                  Get Started
                </ButtonLink>
              </>
            )}
          </div>

          <button
            className="text-bone sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </nav>

        {open && (
          <div className="mt-2 rounded-3xl border border-line bg-ink-900/95 p-4 backdrop-blur-xl sm:hidden">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block rounded-xl px-3 py-3 text-base font-semibold text-bone"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-4">
              {user ? (
                <>
                  <ButtonLink to="/account" variant="dark" size="sm">
                    Account
                  </ButtonLink>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <ButtonLink to="/login" variant="dark" size="sm">
                    Sign in
                  </ButtonLink>
                  <ButtonLink to="/register" size="sm">
                    Get Started
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
