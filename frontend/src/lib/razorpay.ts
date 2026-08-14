/** Minimal typing for the Razorpay Checkout global. */
export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loader: Promise<void> | null = null;

/** Loaded on demand rather than in index.html — no reason to make every
 *  visitor to the landing page pay for the checkout bundle. */
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  if (!loader) {
    loader = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`,
      );
      const script = existing ?? document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loader = null;
        reject(new Error("Couldn't reach Razorpay. Check your connection and try again."));
      };
      if (!existing) document.body.appendChild(script);
    });
  }

  return loader;
}

export function openCheckout(options: RazorpayOptions) {
  if (!window.Razorpay) throw new Error("Razorpay Checkout isn't loaded yet.");
  new window.Razorpay(options).open();
}
