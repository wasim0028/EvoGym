import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { razorpayWebhook } from './controllers/payment.controller';
import { notFound, errorHandler } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Razorpay webhook needs the raw request body to verify the HMAC signature,
// so it's registered BEFORE the global express.json() parser below.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
