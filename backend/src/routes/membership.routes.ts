import { Router } from 'express';
import { listPlans, createPlan, updatePlan, deletePlan } from '../controllers/membership.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPlanSchema } from '../validators/membership.validator';

const router = Router();

router.get('/', listPlans);
router.post('/', authenticate, authorize('ADMIN'), validate(createPlanSchema), createPlan);
router.patch('/:id', authenticate, authorize('ADMIN'), updatePlan);
router.delete('/:id', authenticate, authorize('ADMIN'), deletePlan);

export default router;
