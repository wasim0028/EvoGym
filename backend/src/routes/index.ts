import { Router } from 'express';
import authRoutes from './auth.routes';
import membershipRoutes from './membership.routes';
import paymentRoutes from './payment.routes';
import contactRoutes from './contact.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/memberships', membershipRoutes);
router.use('/payments', paymentRoutes);
router.use('/contact', contactRoutes);

export default router;
