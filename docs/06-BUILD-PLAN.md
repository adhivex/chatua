# 06 — Build Plan

Work phase by phase. Stop at the end of each phase, run `pnpm lint && pnpm typecheck && pnpm build`, report, and wait for "next phase".

## Phase 0 — Project setup
- [ ] `pnpm create next-app` (TypeScript, Tailwind, App Router, src dir, ESLint). Add `typecheck` script.
- [ ] Install and init shadcn/ui; add Zod, Zustand, React Hook Form, lucide-react.
- [ ] Tokens: copy `starter/tokens.css` to `src/styles/tokens.css` and `starter/tailwind.preset.ts` into the Tailwind config (see `02-DESIGN-SYSTEM.md`). Fonts via `next/font` (Fraunces, Hanken Grotesk).
- [ ] Prisma + Neon: use `prisma/schema.prisma`, write `prisma/seed.ts` reading `prisma/seed-data.json`, run migration and seed.
- [ ] `.env.example` check, README with setup steps for WSL2, `docs/DECISIONS.md` created.
- [ ] Git init, first commit.

## Phase 1 — Shell and storefront (static data OK first)
- [ ] AppShell (460px column, safe areas, dvh), TopBar (default + over), BackBar, BottomNav, Logo.
- [ ] Shared components from the design system, including `ProductImage` with vignette and SVG fallback.
- [ ] Home, Shop (search + chips + size pills), Product detail (gallery, accordion, quantity).
- [ ] Zustand cart store persisted to localStorage; toast; cart badge.
- [ ] Match the prototype visually at 390px; compare side by side.

## Phase 2 — Cart and checkout
- [ ] Cart page with free-delivery nudge, add-more, summary, empty state.
- [ ] Copy `starter/lib/delivery.ts`, `money.ts` and `delivery.test.ts` into `src/lib/`; set up Vitest and make the tests pass. Checkout form with validation, delivery and payment options.
- [ ] `POST /api/checkout`: validate, recompute prices, create order in a transaction, COD flow end to end.
- [ ] Order placed page with confetti, copy ID, Track Order timeline, "You might also like".

## Phase 3 — Payments
- [ ] Razorpay order creation, client checkout, signature verification, webhook (idempotent).
- [ ] Failure and retry handling; keep cart on failure.
- [ ] Test in Razorpay test mode for UPI, card and net banking.

## Phase 4 — Content, admin and SEO
- [ ] Recipes, About, Heritage pages from DB/content.
- [ ] Admin: login, products and prices, stock, orders list, status updates (revalidates storefront).
- [ ] Metadata, Open Graph, sitemap, robots, product JSON-LD.
- [ ] Cloudinary integration; swap placeholder illustrations for real photos.

## Phase 5 — Polish and launch
- [ ] Order confirmation email/SMS (optional), WhatsApp support link.
- [ ] Playwright E2E, Lighthouse pass, accessibility pass (keyboard, contrast, labels).
- [ ] Security headers, rate limiting, error tracking, analytics.
- [ ] Vercel deployment, domain, production env vars, smoke test with a real COD order.

## Later (v2)
Customer accounts with phone OTP, saved addresses, coupons, reviews, subscriptions, Odia and Hindi, shipping partner integration, GST invoices.
