# Decisions log

Record every non-obvious decision here with date and reason.

| Date | Decision | Reason |
|---|---|---|
| — | Stack: Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, Neon, Cloudinary, Vercel, pnpm | Matches the owner's other projects |
| — | Payments via Razorpay + COD | Covers UPI, cards, net banking in India (proposed; confirm with owner) |
| — | Guest checkout in v1, no login | Fastest path to first orders |
| — | Admin is a single-credential area in v1 | Keep scope small |
| 2026-10-06 | **Database: Supabase Postgres** (local Supabase stack `chatua-v3` on the VPS) instead of Neon; schema still managed by Prisma from the handoff `prisma/schema.prisma` | Owner asked to use Supabase. Prisma keeps the handoff schema, seed and migrations unchanged; moving to hosted Supabase or Neon later is a `DATABASE_URL` change |
| 2026-10-06 | Fresh Supabase project id `chatua-v3`; the older `supabase_db_chatua` volume (an earlier snake_case build, seed data only, no orders) is left untouched. Backup: `/opt/deploy/chatua-supabase-db-pre-revive-2026-10-06.sql`; its migrations are kept in `docs/reference/legacy-supabase-v3-attempt/` | Owner chose a new stack + handoff schema; preserves existing data |
| 2026-10-06 | RLS enabled (no policies) on all app tables, REST grants revoked from `anon`/`authenticated` | Supabase auto-exposes `public` through its REST API; the app reads Postgres directly through Prisma, so the API roles must see nothing |
| 2026-10-06 | **Images: Supabase Storage** bucket `product-images` instead of Cloudinary, served by the app at `/media/<path>` and optimised by `next/image`. `ProductImage.publicId` holds the storage path (or a `/public` path) | One provider (Supabase); the Supabase API stays private behind the firewall |
| 2026-10-06 | Schema additions: `Order.stockReleased`, indexes, CHECK constraints (totals add up, qty 1–20, phone/pincode format, positive prices) | Stock is restored exactly once on cancel/expiry; database guards against bugs |
| 2026-10-06 | Unpaid online orders hold stock for 45 minutes, then are cancelled (checked against Razorpay first). Late payments reinstate the order | Prevents abandoned payments from locking stock without losing real payments |
| 2026-10-06 | Checkout sends `expectedTotal`; if the server total differs the order is refused (409) and the page refreshes prices | Customers are never charged a different amount from what they saw; server stays the source of truth |
| 2026-10-06 | `PAYMENT_PROVIDER` = `razorpay` / `mock` / empty. Empty = COD only (online options shown as "Coming soon"); `mock` = simulated payments with clear "Test mode" labels for the preview | No Razorpay keys yet; the full flow can still be tested |
| 2026-10-06 | `muted` token darkened from #85715F to #76624F | #85715F is ~4.1:1 on cream, below the AA 4.5:1 the design system requires |
| 2026-10-06 | Added tokens for prototype colours that had none (`ivory`, `field`, `selected`, `gold-wash`, `gold-tint`, `clay-wash`, `danger`, `backdrop`) | Keep "no hex in components" |
| 2026-10-06 | shadcn generator not used; components hand-built to the tokens (icons ported from the prototype) | Avoid default shadcn styling; the prototype's icons and controls are custom |
| 2026-10-06 | Document scroll with fixed bars (not an inner scroll container); bottom nav and sticky CTA sizes via CSS variables | Native mobile scrolling, browser chrome collapse and scroll restoration |
| 2026-10-06 | Admin password: scrypt hash (`pnpm admin:hash`), HMAC-signed httpOnly cookie, 8 h expiry, 5 tries / 15 min | No extra dependencies; meets the v1 "single credential" plan |
| 2026-10-06 | Rate limits and stale-order expiry are in-process | Single Node process on the VPS; move to Redis/Upstash if scaled out or on serverless |
| 2026-10-06 | Policies page states only confirmed PRD rules; returns window, legal entity, GST and FSSAI are left for the owner (docs/LAUNCH-CHECKLIST.md) | Do not invent business or legal facts |
| 2026-10-06 | Hosting for now: VPS preview (systemd `webapp@chatua`, Caddy, sslip.io, noindex). Vercel/GitHub deferred | Owner asked to test on the VPS first and not push or deploy externally |
| 2026-10-07 | `vercel-build` script runs `prisma migrate deploy` and the create-only seed before `next build`; Node pinned to 24.x; site URL falls back to `VERCEL_PROJECT_PRODUCTION_URL` | First Vercel build failed: product pages pre-render from the database, which had no tables yet |
