import { Link } from "react-router-dom";
import { Wordmark } from "./Wordmark";

const socials = ["Facebook", "LinkedIn", "Instagram", "X"];

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-900">
      <div className="shell grid gap-12 py-16 sm:grid-cols-3">
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-xs text-sm leading-relaxed text-ash-400">
            Your go-to for personalised workouts, coached sessions, and a
            membership you can track to the day.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-bone">Follow us on</p>
          <ul className="mt-4 flex gap-3">
            {socials.map((name) => (
              <li key={name}>
                <a
                  href="#"
                  aria-label={name}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-xs font-bold text-ash-400 transition-colors hover:border-lime hover:text-lime"
                >
                  {name.charAt(0)}
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ash-400">
            <li>
              <Link to="/" className="hover:text-lime">Home</Link>
            </li>
            <li>
              <Link to="/membership" className="hover:text-lime">Membership</Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-lime">Account</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-bone">Contact</p>
          <dl className="mt-4 space-y-3 text-sm text-ash-400">
            <div>
              <dt className="text-ash-500">Monday–Sunday</dt>
              <dd className="text-ash-200">05:00 – 23:00</dd>
            </div>
            <div>
              <dt className="text-ash-500">Email</dt>
              <dd>
                <a href="mailto:hello@evogym.example" className="hover:text-lime">
                  hello@evogym.example
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-ash-500 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} EvoGym. All rights reserved.</span>
          <span>Payments secured by Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
