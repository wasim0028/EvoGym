import type {
  CreateOrderResponse,
  MembershipPlan,
  Payment,
  Subscription,
  User,
} from "@/shared/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

/** Every backend response is shaped { success, message, data }. */
interface Envelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/* The access token is deliberately kept in memory rather than localStorage —
   the long-lived refresh token lives in an httpOnly cookie the JS can't read,
   so an XSS bug can't walk away with a durable session. */
let accessToken: string | null = null;
let onAuthLost: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;
export const setAuthLostHandler = (handler: (() => void) | null) => {
  onAuthLost = handler;
};

/** Refreshes are shared: ten parallel 401s trigger one refresh, not ten. */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return null;
        const body = (await res.json()) as Envelope<{ accessToken: string }>;
        const token = body.data?.accessToken ?? null;
        accessToken = token;
        return token;
      } catch {
        return null;
      } finally {
        // Cleared on the next tick so concurrent callers share this result.
        setTimeout(() => {
          refreshInFlight = null;
        }, 0);
      }
    })();
  }
  return refreshInFlight;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  /** Internal: prevents a refreshed request from looping forever. */
  _retried?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, _retried = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // An expired access token gets one silent refresh-and-retry.
  if (res.status === 401 && auth && !_retried) {
    const token = await refreshAccessToken();
    if (token) return request<T>(path, { ...options, _retried: true });
    onAuthLost?.();
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await res.json()) as Envelope<T>;
  } catch {
    /* Non-JSON response (a gateway error page, say) — fall through. */
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.message ?? `Request failed (${res.status})`,
      payload?.errors,
    );
  }

  return payload?.data as T;
}

export const api = {
  auth: {
    register: (input: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) =>
      request<{ accessToken: string; user: User }>("/auth/register", {
        method: "POST",
        body: input,
      }),

    login: (input: { email: string; password: string }) =>
      request<{ accessToken: string; user: User }>("/auth/login", {
        method: "POST",
        body: input,
      }),

    logout: () => request<null>("/auth/logout", { method: "POST" }),

    me: () => request<User>("/auth/me", { auth: true }),

    forgotPassword: (email: string) =>
      request<null>("/auth/forgot-password", {
        method: "POST",
        body: { email },
      }),

    resetPassword: (input: { token: string; password: string }) =>
      request<null>("/auth/reset-password", { method: "POST", body: input }),

    /** Restores a session on page load using the refresh cookie. */
    restore: refreshAccessToken,
  },

  contact: {
    /** Public enquiry form — no auth, rate-limited server-side. */
    create: (input: {
      name: string;
      email: string;
      phone?: string;
      message?: string;
    }) =>
      request<{ id: string }>("/contact", { method: "POST", body: input }),
  },

  memberships: {
    list: () => request<MembershipPlan[]>("/memberships"),
  },

  payments: {
    createOrder: (planId: string) =>
      request<CreateOrderResponse>("/payments/create-order", {
        method: "POST",
        body: { planId },
        auth: true,
      }),

    verify: (input: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) =>
      request<{ subscription: Subscription }>("/payments/verify", {
        method: "POST",
        body: input,
        auth: true,
      }),

    history: () => request<Payment[]>("/payments/history", { auth: true }),

    currentSubscription: () =>
      request<Subscription | null>("/payments/subscription/me", { auth: true }),
  },
};
