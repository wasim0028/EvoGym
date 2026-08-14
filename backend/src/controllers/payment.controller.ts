import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { razorpay } from '../services/razorpay.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

// Step 1: client picks a plan -> we create a Razorpay order and a local
// Payment record with status CREATED, then hand the order id to the client
// so it can open Razorpay's Checkout widget.
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { planId } = req.body;
  const userId = req.user!.id;

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw new ApiError(404, 'Membership plan not found');

  const order = await razorpay.orders.create({
    amount: plan.price,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: { userId, planId },
  });

  await prisma.payment.create({
    data: {
      userId,
      planId,
      razorpayOrderId: order.id,
      amount: plan.price,
      currency: 'INR',
      status: 'CREATED',
    },
  });

  res.status(201).json(
    new ApiResponse('Order created', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      plan: { id: plan.id, name: plan.name, durationDays: plan.durationDays },
    })
  );
});

// Step 2: after Razorpay Checkout succeeds on the client, it returns
// order id / payment id / signature. We verify the signature server-side
// before trusting the payment, then activate a subscription.
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user!.id;

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
  if (!payment || payment.userId !== userId) throw new ApiError(404, 'Payment record not found');

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    throw new ApiError(400, 'Payment verification failed');
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { id: payment.planId } });
  if (!plan) throw new ApiError(404, 'Membership plan not found');

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.create({
    data: { userId, planId: plan.id, startDate, endDate, status: 'ACTIVE' },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'PAID',
      subscriptionId: subscription.id,
    },
  });

  res.status(200).json(new ApiResponse('Payment verified, subscription activated', { subscription }));
});

// Razorpay server-to-server webhook, kept as a safety net in case the
// client never calls /verify (closed tab, network drop, etc). Mounted with
// express.raw() in app.ts so the raw bytes are available for HMAC checking.
export const razorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  const secret = env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    // Webhook secret not configured — acknowledge but do nothing, so
    // Razorpay doesn't keep retrying. /verify remains the primary path.
    return res.status(200).json({ received: true });
  }

  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (expected !== signature) throw new ApiError(400, 'Invalid webhook signature');

  const payload = JSON.parse(req.body.toString());

  if (payload.event === 'payment.failed') {
    const orderId = payload.payload?.payment?.entity?.order_id;
    if (orderId) {
      await prisma.payment.updateMany({ where: { razorpayOrderId: orderId }, data: { status: 'FAILED' } });
    }
  }

  res.status(200).json({ received: true });
});

export const paymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json(new ApiResponse('Payment history fetched', payments));
});

export const mySubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId: req.user!.id, status: 'ACTIVE', endDate: { gte: new Date() } },
    include: { plan: true },
    orderBy: { endDate: 'desc' },
  });
  res.status(200).json(new ApiResponse('Subscription fetched', subscription));
});
