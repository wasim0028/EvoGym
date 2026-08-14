import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }),
  JWT_ACCESS_SECRET: z.string({ required_error: 'JWT_ACCESS_SECRET is required' }),
  JWT_REFRESH_SECRET: z.string({ required_error: 'JWT_REFRESH_SECRET is required' }),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  RAZORPAY_KEY_ID: z.string({ required_error: 'RAZORPAY_KEY_ID is required' }),
  RAZORPAY_KEY_SECRET: z.string({ required_error: 'RAZORPAY_KEY_SECRET is required' }),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
