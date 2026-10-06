# 04 — Architecture

## Stack
Next.js App Router · TypeScript strict · Tailwind CSS · shadcn/ui · Prisma · Neon PostgreSQL · Cloudinary · Razorpay · Vercel · pnpm. Zod for validation, Zustand for the client cart (persisted to localStorage), React Hook Form for checkout, Vitest + Playwright for tests.

## Folder structure
```
src/
  app/
    (shop)/            # public storefront routes
      page.tsx         # home
      shop/            # list + [slug]
      cart/ checkout/ order/[orderNumber]/
      recipes/ about/ heritage/ account/
    admin/             # protected admin (Phase 4)
    api/
      checkout/route.ts          # create order + Razorpay order
      razorpay/webhook/route.ts  # verify signature, mark paid
      orders/[orderNumber]/route.ts
    layout.tsx globals.css sitemap.ts robots.ts
  components/
    ui/        # shadcn primitives restyled to tokens
    shop/      # ProductCard, ProductRow, SizeOption, CartItem, ...
    layout/    # TopBar, BackBar, BottomNav, Logo, AppShell
  lib/
    db.ts money.ts delivery.ts order-number.ts razorpay.ts cloudinary.ts validators.ts
  server/
    products.ts orders.ts recipes.ts   # data access, server-only
  store/cart.ts
  styles/tokens.css
prisma/ schema.prisma seed.ts
docs/ ...
```

## Key decisions
1. **App shell:** a centred max-width 460px column on wide screens, full width on phones. Use `100dvh`, safe-area insets, and a scrollable content region with fixed bars.
2. **Server-side pricing:** the client sends `{productId, size, qty}[]`; the server loads prices, computes subtotal, delivery fee and total, and ignores any client totals.
3. **Delivery logic** lives in `lib/delivery.ts`: `fee(subtotal, method)`; unit-tested.
4. **Payments:** create a Razorpay order for online methods, verify the signature on the client callback and via webhook (idempotent). COD creates the order with payment status `COD`.
5. **Order numbers:** database sequence, formatted `CHATUA` + 5 digits.
6. **Images:** Cloudinary with `next/image`, responsive sizes, WebP/AVIF, art-directed hero. `ProductImage` handles vignette overlay and fallback.
7. **Caching:** product and recipe pages statically generated with on-demand revalidation when admin edits.
8. **Admin auth:** single admin credential in v1 (env hash, signed session cookie), upgrade to proper auth later.
9. **Security:** Zod on every route, rate-limit checkout, verify Razorpay signatures, never log payment data, security headers in `next.config`.
10. **Observability:** Vercel Analytics, error tracking (Sentry optional).

## Tailwind setup
Expose design tokens in `tailwind.config.ts` (colours, radii, shadows, font families) and as CSS variables in `styles/tokens.css`. Do not hardcode hex values in components.

## Testing
Unit: delivery fee, money formatting, cart reducer, validators. E2E (Playwright, mobile viewport): add to cart → checkout (COD) → order page.

## Performance targets
Lighthouse mobile ≥ 90, LCP < 2.5s, CLS < 0.05, JS on home < 150kB gzipped.
