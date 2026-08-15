import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon, TrophyIcon } from "@heroicons/react/24/solid";
import { api, ApiError } from "@/api/client";
import { useAuth } from "@/context/auth-context";
import { loadRazorpay, openCheckout } from "@/lib/razorpay";
import { formatDate, formatINR } from "@/lib/format";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { DEMO_PLANS, isStaticPreview } from "@/lib/demoPlans";
import type { MembershipPlan, Subscription } from "@/shared/types";
import { usePageTitle } from "@/hooks/usePageTitle";

const perks = [
  "Every programme included",
  "Unlimited coached sessions",
  "Progress tracking",
  "Guest passes",
];

export default function Membership() {
  usePageTitle("Membership Plans");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [current, setCurrent] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingFor, setPayingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Subscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await api.memberships.list();
        if (cancelled) return;
        setPlans(list ?? []);

        if (user) {
          const sub = await api.payments.currentSubscription();
          if (!cancelled) setCurrent(sub ?? null);
        }
      } catch {
        if (cancelled) return;
        if (isStaticPreview) {
          setPlans(DEMO_PLANS);
        } else {
          setError("Couldn't load membership plans. Refresh to try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const startCheckout = useCallback(
    async (plan: MembershipPlan) => {
      // Paying requires an account — send them to sign in, then straight back.
      if (!user) {
        navigate("/login", { state: { from: "/membership" } });
        return;
      }

      setError(null);
      setPayingFor(plan.id);

      try {
        const order = await api.payments.createOrder(plan.id);
        await loadRazorpay();

        openCheckout({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: "EvoGym",
          description: `${plan.name} membership`,
          theme: { color: "#C9F73E" },
          prefill: { name: user.name, email: user.email },
          modal: { ondismiss: () => setPayingFor(null) },
          handler: async (response) => {
            try {
              // Verified server-side before anything activates — the
              // browser's word alone isn't enough.
              const result = await api.payments.verify(response);
              setConfirmed(result.subscription);
              setCurrent(result.subscription);
            } catch (verifyError) {
              setError(
                verifyError instanceof ApiError
                  ? verifyError.message
                  : "Payment went through but we couldn't confirm it. Contact us and we'll sort it out.",
              );
            } finally {
              setPayingFor(null);
            }
          },
        });
      } catch (checkoutError) {
        setPayingFor(null);
        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : "Couldn't start checkout. Try again in a moment.",
        );
      }
    },
    [navigate, user],
  );

  return (
    <div className="pt-32 sm:pt-40">
      <div className="shell pb-24 sm:pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Membership</p>
          <h1 className="h-section mt-4">
            Pick Your Plan,
            <br />
            <span className="text-lime">Start This Week</span>
          </h1>
          <p className="lede mt-5">
            One membership covers every programme. Commit for longer and the
            monthly cost comes down.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {confirmed && (
            <Notice tone="success">
              You&apos;re in. Membership runs to {formatDate(confirmed.endDate)} —
              the receipt is in your account.
            </Notice>
          )}
          {current && !confirmed && (
            <Notice tone="info">
              Your current membership runs to {formatDate(current.endDate)}.
              Buying now extends from today.
            </Notice>
          )}
          {error && <Notice tone="error">{error}</Notice>}
        </div>

        {loading ? (
          <p className="mt-16 animate-pulse text-center text-ash-500">
            Loading plans…
          </p>
        ) : plans.length === 0 ? (
          <div className="mt-16 rounded-[1.75rem] border border-line px-6 py-14 text-center">
            <p className="text-ash-400">
              No plans are published yet. Seed the database, then reload.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {plans.map((plan, index) => {
              const featured = index === Math.min(1, plans.length - 1);
              const months = Math.max(1, Math.round(plan.durationDays / 30));

              return (
                <div key={plan.id} className="relative">
                  <div
                    aria-hidden="true"
                    className="notch-flag absolute right-0 top-0 z-10 h-[2.4rem] w-[2.4rem] bg-lime"
                  />
                  <article
                    className={[
                      "notch flex h-full flex-col rounded-[1.75rem] border p-7",
                      featured
                        ? "border-lime/40 bg-lime/[0.08]"
                        : "border-line bg-ink-800",
                    ].join(" ")}
                  >
                    {featured && (
                      <span className="mb-4 inline-flex w-fit rounded-full bg-lime px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-void">
                        Most popular
                      </span>
                    )}

                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime">
                      <TrophyIcon className="h-5 w-5 text-void" />
                    </span>

                    <h2 className="mt-5 text-xl font-extrabold text-bone">
                      {plan.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ash-400">
                      {plan.description ?? `${months} month commitment`}
                    </p>

                    <p className="mt-6 text-4xl font-extrabold tracking-tight text-bone">
                      {formatINR(plan.price)}
                    </p>
                    <p className="mt-1 text-xs text-ash-500">
                      {formatINR(plan.price / months)} / month ·{" "}
                      {plan.durationDays} days
                    </p>

                    <ul className="mt-6 flex-1 space-y-2.5">
                      {perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-center gap-2 text-sm text-ash-200"
                        >
                          <CheckIcon className="h-4 w-4 shrink-0 text-lime" />
                          {perk}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7">
                      <Button
                        variant={featured ? "primary" : "outline"}
                        className="w-full"
                        disabled={payingFor !== null}
                        onClick={() => void startCheckout(plan)}
                      >
                        {payingFor === plan.id
                          ? "Opening checkout…"
                          : user
                            ? "Pay with Razorpay"
                            : "Sign in to join"}
                      </Button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}

        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-ash-500">
          Payments are handled by Razorpay. Card details never touch our
          servers, and every payment is signature-verified before your
          membership activates.
        </p>
      </div>
    </div>
  );
}
