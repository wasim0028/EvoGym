import { Router } from 'express';
import { createOrder, verifyPayment, paymentHistory, mySubscription } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';

const router = Router();

router.post('/create-order', authenticate, validate(createOrderSchema), createOrder);
router.post('/verify', authenticate, validate(verifyPaymentSchema), verifyPayment);
router.get('/history', authenticate, paymentHistory);
router.get('/subscription/me', authenticate, mySubscription);

// Note: POST /webhook is registered directly in app.ts (needs raw body for
// Razorpay's HMAC signature check), not here.

export default router;
