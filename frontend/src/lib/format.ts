/** Prices come from the API in paise (₹999.00 => 99900). */
export const formatINR = (paise: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export const daysRemaining = (iso: string): number =>
  Math.max(
    0,
    Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

/** Membership length in months, used as the "weight" on each plate. */
export const plateWeight = (durationDays: number): number =>
  Math.max(1, Math.round(durationDays / 30));
