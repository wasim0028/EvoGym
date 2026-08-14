export type Role = "MEMBER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string | null;
  /** Stored in paise, matching what Razorpay expects. */
  price: number;
  durationDays: number;
  isActive?: boolean;
}

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface Subscription {
  id: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  plan?: MembershipPlan;
}

export type PaymentStatus = "CREATED" | "PAID" | "FAILED";

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  plan?: MembershipPlan;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  plan: { id: string; name: string; durationDays: number };
}
