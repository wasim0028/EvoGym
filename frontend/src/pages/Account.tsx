import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useAuth } from "@/context/auth-context";
import { daysRemaining, formatDate, formatINR } from "@/lib/format";
import { NotchCard } from "@/components/NotchCard";
import { ButtonLink } from "@/components/Button";
import { Notice } from "@/components/Notice";
import type { Payment, Subscription } from "@/shared/types";
import { usePageTitle } from "@/hooks/usePageTitle";

const STATUS_TONE: Record<string, string> = {
  PAID: "text-lime",
  CREATED: "text-amber-400",
  FAILED: "text-red-400",
};

export default function Account() {
  usePageTitle("Your Account");
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [sub, history] = await Promise.all([
          api.payments.currentSubscription(),
          api.payments.history(),
        ]);
        if (cancelled) return;
        setSubscription(sub ?? null);
        setPayments(history ?? []);
      } catch {
        if (!cancelled)
          setError("Couldn't load your account. Refresh to try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pt-32 sm:pt-40">
      <div className="shell pb-24 sm:pb-32">
        <p className="eyebrow">Account</p>
        <h1 className="h-section mt-4">{user?.name ?? "Member"}</h1>
        <p className="mt-3 text-sm text-ash-400">{user?.email}</p>

        {error && (
          <div className="mt-8">
            <Notice tone="error">{error}</Notice>
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-ash-500">
            Membership
          </h2>

          {loading ? (
            <p className="mt-6 animate-pulse text-ash-500">Loading…</p>
          ) : subscription ? (
            <NotchCard className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-8 p-8">
                <div>
                  <p className="text-2xl font-extrabold text-bone">
                    {subscription.plan?.name ?? "Membership"}
                  </p>
                  <p className="mt-2 text-sm text-ash-400">
                    Active until {formatDate(subscription.endDate)}
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-lime/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-lime">
                    {subscription.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-5xl font-extrabold leading-none text-lime">
                    {daysRemaining(subscription.endDate)}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-ash-500">
                    Days left
                  </p>
                </div>
              </div>
            </NotchCard>
          ) : (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-line p-10 text-center">
              <p className="text-ash-400">
                No active membership. Pick a plan and you can train tomorrow
                morning.
              </p>
              <div className="mt-6">
                <ButtonLink to="/membership">Choose a plan</ButtonLink>
              </div>
            </div>
          )}
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-ash-500">
            Payments
          </h2>

          {!loading && payments.length === 0 ? (
            <p className="mt-6 text-ash-400">
              Nothing here yet. Payments show up the moment they&apos;re
              confirmed.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-line">
              <table className="w-full min-w-[540px] border-collapse text-left">
                <thead>
                  <tr className="bg-ink-800">
                    {["Date", "Plan", "Amount", "Status"].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-ash-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t border-line">
                      <td className="px-6 py-4 text-sm text-ash-400">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-bone">
                        {payment.plan?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-bone">
                        {formatINR(payment.amount)}
                      </td>
                      <td
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${
                          STATUS_TONE[payment.status] ?? "text-ash-400"
                        }`}
                      >
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-12 text-sm text-ash-500">
          Need something changed?{" "}
          <Link to="/" className="text-lime underline underline-offset-4">
            Talk to us
          </Link>
        </p>
      </div>
    </div>
  );
}
