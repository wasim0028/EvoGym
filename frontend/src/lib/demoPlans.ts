import type { MembershipPlan } from "@/shared/types";

/* Only used by the static preview build (VITE_STATIC_PREVIEW=1), which runs
   with no API behind it. The live app always shows real plans from the
   database — this exists so a client can see the full page offline. */
export const DEMO_PLANS: MembershipPlan[] = [
  {
    id: "demo-monthly",
    name: "Monthly",
    description: "Full access, billed monthly. Cancel whenever you like.",
    price: 99900,
    durationDays: 30,
  },
  {
    id: "demo-quarterly",
    name: "Quarterly",
    description: "Three months of full access at a lower monthly rate.",
    price: 269900,
    durationDays: 90,
  },
  {
    id: "demo-annual",
    name: "Annual",
    description: "A full year, our best rate, plus four guest passes.",
    price: 999900,
    durationDays: 365,
  },
];

export const isStaticPreview = Boolean(import.meta.env.VITE_STATIC_PREVIEW);

/* When the API can't be reached we still want a complete-looking page during
   local development and in the offline client preview — an empty gap where
   the pricing should be is worse than sample figures. A production build
   talking to a real API never hits this. */
export const fallbackPlans = (): MembershipPlan[] =>
  isStaticPreview || import.meta.env.DEV ? DEMO_PLANS : [];
