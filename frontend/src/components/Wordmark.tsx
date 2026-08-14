import { Link } from "react-router-dom";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 ${className}`}
      aria-label="EvoGym — home"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M4 9h2.5v6H4zM17.5 9H20v6h-2.5zM7.5 7H10v10H7.5zM14 7h2.5v10H14zM10 11h4v2h-4z"
            fill="#0A0C07"
          />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-bone">
        Evo<span className="text-lime">Gym</span>
      </span>
    </Link>
  );
}
