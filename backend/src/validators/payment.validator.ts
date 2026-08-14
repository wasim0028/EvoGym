import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    planId: z.string().uuid('Invalid plan id'),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
  }),
});
