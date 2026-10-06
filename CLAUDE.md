# CLAUDE.md — Chatua

> Handoff package **v3** · supersedes v1/v2 handoffs · design reference: premium prototype v3 (espresso hero, Fraunces + Hanken Grotesk, gold hairlines).

Chatua is a mobile-first e-commerce web app selling Chatua (traditional Odisha grain powder) across India. Brand line: "Odisha's Traditional Food". Built by OrangeKite for Bharat.

Read this file first, then the docs listed below. Do not start coding before reading them.

## Source of truth
- `docs/01-PRD.md` — scope, users, features, business rules
- `docs/02-DESIGN-SYSTEM.md` — colours, type, spacing, components (follow exactly)
- `docs/03-SCREENS.md` — every screen, states and behaviour
- `docs/04-ARCHITECTURE.md` — stack, folder structure, conventions
- `docs/05-DATABASE.md` — Prisma schema and seed data
- `docs/06-BUILD-PLAN.md` — phased tasks; work through them in order
- `docs/reference/chatua-prototype-v3.html` — approved visual prototype. Open it in a browser (use the 390px mobile width) and match its look and behaviour. It uses drawn SVG placeholders instead of photos; replace those with real images through the `ProductImage` component.

## Stack
Next.js (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui (restyled to our tokens) · Prisma · Neon PostgreSQL · Cloudinary · Razorpay · Vercel · pnpm

## Non-negotiables
1. Mobile web first (360–430px), then tablet, then desktop. Desktop shows the same app in a centred column up to 460px at launch; wider layouts come later.
2. Premium feel: serif headings (Fraunces), ivory background, burnt-clay primary, gold hairlines, espresso for dark surfaces. Never use flat default shadcn styling or generic grey.
3. All prices in INR, stored as integers (rupees). Format with `Intl.NumberFormat('en-IN')`.
4. Never trust the client for prices, totals or delivery fees. Recompute on the server from the database.
5. Accessibility floor: visible focus, labels on inputs, 44px touch targets, `prefers-reduced-motion` respected.
6. Copy: plain, sentence case, active voice. Keep the exact wording used in the prototype for buttons and labels.
7. No secrets in the repo. Use `.env.local`; keep `.env.example` current.

## Business rules (do not change without asking)
- Products: Classic, Multi-Grain, Jaggery, Protein. Sizes: 500g and 1kg. Prices are in `docs/05-DATABASE.md` seed.
- Delivery: Standard 3–5 days, ₹40, free when the item subtotal is ₹499 or more. Express 2–3 days, ₹70 (never free).
- Payments: UPI, Credit/Debit Card, Net Banking (via Razorpay) and Cash on Delivery.
- Order ID format: `CHATUA` + zero-padded sequence, shown as `#CHATUA00001`.
- Cart persists on the device and merges into the order at checkout. Guest checkout in v1 (no login).

## Working agreements
- Use pnpm only. Dev machine is Windows with WSL2 and Docker: run everything inside WSL2, keep the repo on the Linux filesystem (not `/mnt/c`), and avoid installing global packages.
- Small, reviewable commits using Conventional Commits (`feat:`, `fix:`, `chore:`).
- After each phase in `docs/06-BUILD-PLAN.md`: run `pnpm lint && pnpm typecheck && pnpm build`, then summarise what changed and what is next.
- If a requirement is unclear or conflicts with the docs, ask before inventing. Record decisions in `docs/DECISIONS.md`.
- Use the placeholder illustration only as a fallback when a product has no image.

## Commands
```
pnpm dev            # local dev
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm build          # production build
pnpm prisma migrate dev
pnpm prisma db seed
```
