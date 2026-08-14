# EvoGym

A gym membership platform: React frontend, Express API, and the AWS
infrastructure and pipelines to run all of it.

```
React + Vite  ──►  Express + Prisma  ──►  PostgreSQL
     │                    │
     │                    └──►  Razorpay (payments)
     │
     └──►  one ALB routes /api to the backend, everything else to the SPA
```

| Part | Location | Stack |
|---|---|---|
| Frontend | `frontend/` | React 18, TypeScript, Vite, Tailwind |
| Backend | `backend/` | Node 20, Express, Prisma, PostgreSQL, JWT, Razorpay |
| Infrastructure | `devops/` | Terraform, EKS on Fargate, RDS, ECR, ALB, Argo CD |
| Pipelines | `.github/workflows/` | GitHub Actions with OIDC (no AWS keys) |

Each part has its own README with the detail:
[frontend](./frontend/README.md) · [backend](./backend/README.md) ·
[infrastructure](./devops/README.md).

## Running locally

Two terminals. **Backend first:**

```bash
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT secrets, Razorpay keys
npx prisma migrate dev --name init
npm run seed                # 3 membership plans + an admin user
npm run dev                 # http://localhost:5000
```

**Then the frontend:**

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The dev server proxies `/api` to `localhost:5000`, so the two work together
with no extra configuration. The seeded admin is
`admin@evogym.com` / `ChangeMe123!` — change it before deploying anywhere.

You'll need PostgreSQL running locally and a Razorpay **test mode** key pair
from the [Razorpay dashboard](https://dashboard.razorpay.com/).

## What works

- **Accounts** — register, sign in, sign out. Access tokens are short-lived and
  held in memory; the refresh token is an httpOnly cookie, so an XSS bug can't
  steal a durable session.
- **Membership** — plans are public; buying one requires an account.
- **Payments** — Razorpay Checkout, with the signature verified server-side
  before a subscription activates. A webhook covers the case where the browser
  never reports back.
- **Account page** — current membership, days remaining, and payment history.

## Deploying

Summarised here; the full walkthrough is in [`devops/README.md`](./devops/README.md).

```bash
cd devops/scripts && ./bootstrap-state-backend.sh   # once per AWS account
cd ../terraform/global/shared && terraform init && terraform apply
cd ../../environments/dev && terraform init && terraform apply
aws eks update-kubeconfig --region ap-south-1 --name evogym-dev
kubectl apply -f devops/argocd/bootstrap/root-app-dev.yaml
```

After that, pushing to a branch is the whole deployment process:

| Branch | Environment | Argo CD |
|---|---|---|
| `develop` | dev | syncs automatically |
| `staging` | staging | syncs automatically |
| `main` | prod | waits for a manual promote |

GitHub Actions builds the image, pushes it to ECR tagged with the commit SHA,
and commits the new tag into the matching Kustomize overlay. Argo CD notices
and rolls it out — running `prisma migrate deploy` first, so the schema is
always ahead of the code that needs it.

## Not built yet

- **HTTPS** — both Ingresses listen on port 80. Add an ACM certificate and a
  443 listener once you have a domain.
- **Contact endpoint** — the trial-request form opens the visitor's mail client
  rather than posting to an API.
- **Class booking** — described in the landing copy, no backend behind it.
- **Admin UI** — plan management is API-only (`POST /api/memberships`, admin
  role required).
- **Tests** — neither app has a test suite; CI runs type-checking and linting.
