# EvoGym — frontend

React + TypeScript + Vite + Tailwind. Talks to the Express API (`backend/`) for
authentication, membership plans and Razorpay payments.

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

`npm run dev` proxies `/api` to `http://localhost:5000`, so start the backend
alongside it and the two work together with no extra configuration.

To point at a different API, set `VITE_API_URL`:

```bash
VITE_API_URL=https://staging.evogym.example.com/api npm run build
```

Vite inlines env vars at build time, so this is a **build-time** value, not a
runtime one — which is why the CI pipeline passes it as a Docker build arg.
The default (`/api`) is correct for the deployed setup, where the frontend and
backend share a single ALB.

## Routes

| Route | Access | What it does |
|---|---|---|
| `/` | public | Landing — programmes, membership preview, trial request |
| `/membership` | public | Plans; paying requires an account |
| `/login`, `/register` | public | Authentication |
| `/account` | members | Membership status, days remaining, receipts |

## How auth works

The access token is held **in memory only** — never `localStorage`. The
long-lived refresh token lives in an httpOnly cookie the browser sends
automatically, so an XSS bug can't walk off with a durable session.

`src/api/client.ts` handles the rest: a 401 triggers one silent refresh and a
retry, concurrent 401s share a single refresh request, and a failed refresh
drops the app back to signed-out cleanly. On page load `AuthProvider` trades
the cookie for a token so a hard refresh doesn't sign you out.

## Payment flow

1. `POST /payments/create-order` → returns a Razorpay order and the public key
2. Razorpay Checkout opens (script loaded on demand, not in `index.html`)
3. `POST /payments/verify` → the server checks the HMAC signature before
   activating anything

The browser never decides whether a payment succeeded.

## Design notes

Dark, high-contrast, lime-accented — the current fitness-brand idiom.

**Palette.** A near-black with an olive cast (`void #0A0C07`) rather than
neutral grey, so the lime accent (`#C9F73E`) reads as part of the same family
instead of sitting on top of it. Lime is the only saturated colour on the page.

**Photography** is desaturated by default and returns to colour on hover, which
keeps the lime as the single point of saturation.

**The recurring shape** is a card with its top-right corner sliced off and a
lime triangle showing through the gap (`.notch` + `.notch-flag` in
`index.css`). It appears on programme cards, plan cards, trainer cards and the
auth panels.

**The hero** layers a masked photo over the headline with lime stat chips
orbiting it. The mask (`.fade-base`) fades the bottom of a rectangular photo
into the page so a framed shot reads like a cutout.

**Type** is Plus Jakarta Sans throughout — 800 for headlines set tight, 400–600
for everything else. Headlines run two lines, white then lime.

Motion is limited to scroll reveals, a slow drift on the hero chips, and the
partner marquee. All of it is disabled under `prefers-reduced-motion`.

## Static preview

To hand a clickable preview to a client without running a server:

```bash
npm run preview:static
```

Produces `preview/index.html` — a single file with the JS, CSS and all images
inlined, which opens by double-clicking with no server.

Three things make that work, and all three are required:

- **Hash routing** (`VITE_STATIC_PREVIEW=1`), since there's no server to
  resolve paths.
- **An IIFE bundle with `type="module"` stripped.** Browsers block module
  scripts over `file://` for CORS reasons — a normal Vite build opened from
  disk shows a blank page.
- **Scripts moved to the end of `<body>`.** Classic scripts run as soon as
  they're parsed, and Vite puts the entry in `<head>`, so React would find no
  `#root` to mount into.

## What still needs wiring

- The trial-request form opens the visitor's mail client. Add a
  `POST /api/contact` endpoint if you'd rather it submit server-side.
- Address and phone in the Visit section are placeholders.
- Class booking is described in the copy but has no backend yet.
