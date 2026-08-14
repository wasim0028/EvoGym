# gym-typescript backend

Node.js + Express + TypeScript API for the [gym-typescript](https://github.com/wasim0028/gym-typescript) frontend.

- **Auth**: JWT access tokens (returned in the response body, sent as `Authorization: Bearer <token>`) + refresh tokens (stored in an httpOnly cookie, hashed in the DB).
- **DB**: PostgreSQL via Prisma.
- **Payments**: Razorpay — create order → Razorpay Checkout on the frontend → server-side signature verification → subscription activated. A webhook endpoint is included as a safety net.

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — your Postgres connection string.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 64` (use two different values).
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from the [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys (use Test mode keys while developing).
- `RAZORPAY_WEBHOOK_SECRET` — optional but recommended, from Settings → Webhooks.

Run migrations and seed some starter plans + an admin user:

```bash
npx prisma migrate dev --name init
npm run seed
```

The seed is **idempotent** — it upserts on plan name, so running it twice
updates the existing plans instead of creating a second set.

### Already have duplicate plans?

An earlier version of the seed used `createMany({ skipDuplicates: true })`.
That only skips rows breaking a *unique constraint*, and `name` had none, so
each run inserted another three plans. If your membership page shows Monthly,
Monthly, Quarterly, Quarterly… run this **before** migrating:

```bash
npm run db:dedupe-plans     # keeps the oldest of each name
npx prisma migrate dev --name unique_plan_name
```

Order matters: the migration adds a unique constraint on `name` and will fail
while duplicates still exist. The dedupe script repoints any existing
subscriptions and payments at the surviving plan before deleting the extras,
so nobody loses a membership or a receipt.

Start the dev server (auto-restarts on file changes):

```bash
npm run dev
```

API is now live at `http://localhost:5000`, health check at `GET /health`.

Production build:

```bash
npm run build
npm start
```

## 2. API reference

All responses are shaped as `{ success, message, data }` (or `{ success: false, message, errors }` on failure).

### Auth — `/api/auth`
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/register` | – | `name, email, password, phone?` |
| POST | `/login` | – | `email, password` |
| POST | `/refresh` | refresh cookie | – |
| POST | `/logout` | – | – |
| GET | `/me` | Bearer token | – |

Register/login return `{ accessToken, user }` and set an httpOnly `refreshToken` cookie scoped to `/api/auth`. Keep the access token in memory on the frontend (e.g. React state/context), not localStorage, and call `/refresh` when it expires (short-lived, default 15m).

### Membership plans — `/api/memberships`
| Method | Route | Auth |
|---|---|---|
| GET | `/` | – (public) |
| POST | `/` | Bearer token, role `ADMIN` |
| PATCH | `/:id` | Bearer token, role `ADMIN` |
| DELETE | `/:id` | Bearer token, role `ADMIN` (soft delete) |

### Contact — `/api/contact`
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/` | – (public, 5/hour per IP) | `name, email, phone?, message?` |
| GET | `/` | Bearer token, role `ADMIN` | – (optional `?status=NEW`) |
| PATCH | `/:id` | Bearer token, role `ADMIN` | `status` |

Enquiries are stored in the `ContactEnquiry` table with a `NEW → CONTACTED →
CLOSED` status. Nothing is emailed yet — the queue is read via the admin
endpoint. Adding email notifications is a matter of calling your provider
inside `createEnquiry`.

### Payments — `/api/payments`
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/create-order` | Bearer token | `planId` |
| POST | `/verify` | Bearer token | `razorpay_order_id, razorpay_payment_id, razorpay_signature` |
| GET | `/history` | Bearer token | – |
| GET | `/subscription/me` | Bearer token | – |
| POST | `/webhook` | Razorpay signature | raw Razorpay event |

## 3. Frontend integration (React)

1. Load Razorpay's checkout script once, e.g. in `index.html`:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```
2. Flow for a "Join now" / "Buy plan" button:
   ```ts
   // 1. create an order
   const { data } = await api.post('/payments/create-order', { planId });

   // 2. open Razorpay Checkout
   const rzp = new (window as any).Razorpay({
     key: data.data.keyId,
     amount: data.data.amount,
     currency: data.data.currency,
     order_id: data.data.orderId,
     name: 'EvoGym',
     handler: async (response: any) => {
       // 3. verify on the server
       await api.post('/payments/verify', response);
     },
     prefill: { name: user.name, email: user.email },
   });
   rzp.open();
   ```
3. Attach the access token to every request:
   ```ts
   axios.interceptors.request.use((config) => {
     if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
     return config;
   });
   ```
4. Set `axios.defaults.withCredentials = true` (or `credentials: 'include'` with `fetch`) so the refresh cookie is sent to `/api/auth/refresh`.

Also set `CLIENT_URL` in `.env` to wherever the frontend runs (`http://localhost:5173` in dev) — CORS is locked to that origin with credentials enabled.

## 4. Notes

- Prices are stored in **paise** (smallest currency unit), matching what Razorpay expects — e.g. ₹999 = `99900`.
- Roles are `MEMBER` (default) and `ADMIN`. Promote a user to admin directly in the DB (or via Prisma Studio: `npm run prisma:studio`) until an admin-management endpoint is needed.
- The seed script creates an admin at `admin@evogym.com` / `ChangeMe123!` — change this password immediately in any real deployment.
