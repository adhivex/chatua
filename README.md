# Chatua

Mobile-first store for Chatua, Odisha's traditional grain food. Built from handoff package v3 (`CLAUDE.md`, `docs/`, `docs/reference/chatua-prototype-v3.html`).

**Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind CSS 4 (handoff preset) · Prisma 6 · Supabase Postgres + Storage · Razorpay + Cash on Delivery · Zod · Zustand · React Hook Form · Vitest · Playwright · pnpm.
Departures from the handoff stack (Supabase instead of Neon/Cloudinary, VPS instead of Vercel) are logged in `docs/DECISIONS.md`.

## What is built

| Area | Routes |
|---|---|
| Storefront | `/` · `/shop` (live search, category chips, size pills) · `/shop/[slug]` (gallery, size, quantity, accordions, JSON-LD) · `/cart` · `/checkout` · `/order/[orderNumber]?t=…` (confetti, copy ID, Track Order) · `/recipes` · `/about` · `/heritage` · `/account` · `/policies` |
| API | `POST /api/checkout` · `POST /api/payments/verify` · `POST /api/payments/abandon` · `POST /api/payments/mock` (test mode only) · `POST /api/razorpay/webhook` · `GET /api/orders/[orderNumber]?t=` · `POST /api/cron/expire-orders` · `GET /media/[...path]` |
| Admin | `/admin` dashboard · orders (filter, search, status, payment status) · products (details, prices, stock, photos, new product) · recipes |
| SEO | per-page metadata, Open Graph image, `sitemap.xml`, `robots.txt`, product JSON-LD, app icons, manifest |

Business rules (see `docs/01-PRD.md`): prices are integer rupees and always recomputed on the server; standard delivery ₹40, free from ₹499; express ₹70; quantity 1–20; order IDs `#CHATUA00001`; guest checkout; stock is taken in the order transaction and restored once on cancellation.

## Local development

Requires Node 20.9+, Docker and corepack (pnpm 9).

```bash
corepack pnpm install
corepack pnpm db:up                 # local Supabase stack "chatua-v3" (Postgres 54622, API 54621, Studio 54623)
cp .env.example .env.local          # then fill in; see comments in the file
corepack pnpm exec prisma migrate deploy
corepack pnpm db:seed               # create-only: never overwrites admin edits
corepack pnpm admin:hash 'a long password'   # paste into ADMIN_PASSWORD_HASH
corepack pnpm dev
```

Checks (run before every deploy):

```bash
corepack pnpm lint && corepack pnpm typecheck && corepack pnpm test && corepack pnpm build
corepack pnpm test:e2e              # builds and serves its own copy against the chatua_e2e database
```

`pnpm test` runs unit tests plus integration tests against `TEST_DATABASE_URL` (a `*_test` database). `pnpm test:e2e` uses a `*_e2e` database; both refuse other database names.

## VPS preview

| | |
|---|---|
| URL | https://chatua.187-126-118-80.sslip.io (noindex) · admin at `/admin` |
| Admin login | `/opt/deploy/env/chatua-admin.txt` (root only) |
| App | `/opt/apps/chatua` → `/opt/projects/chatua/app`, systemd `webapp@chatua`, port 3007 |
| Env | `/opt/deploy/env/chatua.env` (root only) |
| Database | Supabase stack `chatua-v3`, database `postgres` (Studio: `ssh -L 54623:127.0.0.1:54623 root@<server>`) |
| Cron | `chatua-cron.timer` cancels unpaid online orders every 10 minutes |
| Payments | `PAYMENT_PROVIDER=mock`: online payments are simulated and labelled "Test mode" |

Deploy a change (from this repo, as root):

```bash
./scripts/deploy-vps.sh
```

It syncs the source (no `.env*`), installs from the lockfile, runs `prisma migrate deploy` and the create-only seed, builds, and restarts `webapp@chatua`. Logs: `/opt/deploy/logs/build-chatua.log`, `journalctl -u webapp@chatua`.

## Vercel

Vercel runs `pnpm vercel-build` (not `build`): `prisma migrate deploy` → create-only seed → `next build`, so an empty database is set up on the first deploy. Set these in Vercel → Settings → Environment Variables (the Supabase/Neon integrations' `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` also work). The build log prints which database host it uses (`[db] using …`, no password):

| Variable | Value (Supabase) |
|---|---|
| `DATABASE_URL` | Pooled connection, port 6543, ending `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Optional. Direct connection (port 5432) used by migrations; if unset it is derived (Supabase pooler session mode, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING`, or `DATABASE_URL`) |
| `NEXT_PUBLIC_SITE_URL` | Final domain, e.g. `https://chatua.in` (falls back to the Vercel production domain) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | Admin sign-in (`pnpm admin:hash`) |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | Photo storage (bucket `product-images`, public) |
| `PAYMENT_PROVIDER` + Razorpay keys | Leave `PAYMENT_PROVIDER` empty for Cash on Delivery only |

Production uses the Supabase integration (`chatua-db`, Mumbai), connected to the Production environment only, so preview builds have no database and fail until one is connected for them. Functions run in `bom1` (vercel.json). Every deployment migrates the database it points at. Rate limits are per serverless instance on Vercel; unpaid-order expiry runs on checkout and admin visits (Hobby plans only allow daily crons).

## Going live

See `docs/LAUNCH-CHECKLIST.md`: owner details (GST, FSSAI, returns, WhatsApp, photos), Razorpay keys and webhook, domain, and a hardened or hosted database.
