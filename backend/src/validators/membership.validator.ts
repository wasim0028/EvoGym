import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().int().positive('Price must be a positive integer, in paise'),
    durationDays: z.number().int().positive(),
  }),
});
