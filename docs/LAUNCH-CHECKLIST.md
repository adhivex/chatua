# Launch checklist

Everything the owner must supply or decide before real customers. Nothing below has been invented in code.

## Owner information
- [ ] GST: are prices inclusive? Invoice format (PRD open question). No tax line is shown today.
- [ ] FSSAI licence number and legal entity name/address (footer/policies).
- [ ] Return and refund policy wording (the policies page currently says "contact us").
- [ ] WhatsApp support number → `NEXT_PUBLIC_WHATSAPP_NUMBER` (shows "Chat with us" links when set).
- [ ] Support email → `NEXT_PUBLIC_SUPPORT_EMAIL`.
- [ ] Real product photography (Admin → Products → Photos). Until then the drawn illustration shows.
- [ ] Real logo file (the app icon is a placeholder gold "C").
- [ ] Shipping partner and packaging weights (status is updated manually in Admin for v1).

## Payments (Razorpay)
- [ ] Create a Razorpay account; complete KYC (needs the policy pages above).
- [ ] Set `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- [ ] Dashboard → Webhooks: `https://<domain>/api/razorpay/webhook`, events `payment.captured`, `payment.failed`, `order.paid`; put the secret in `RAZORPAY_WEBHOOK_SECRET`.
- [ ] Dashboard → enable automatic capture.
- [ ] Test mode: one UPI, one card and one net-banking order; close the window mid-payment and retry. Check each order shows Paid in Admin and the webhook shows 200.

## Infrastructure
- [ ] Domain: point `chatua.in` A record at the server, add it to the Caddy site block, drop `noindex`, set `NEXT_PUBLIC_SITE_URL` and redeploy.
- [ ] Database for launch: the local Supabase stack uses the CLI's default secrets (safe only while firewalled to localhost). Move to hosted Supabase (or harden the stack) and set `DATABASE_URL` (pooled) / `DIRECT_URL` (direct), then `prisma migrate deploy` + `prisma db seed`.
- [ ] Back up the database daily (`pg_dump`) and test a restore.
- [ ] Change the preview admin password (`pnpm admin:hash`) and keep `SESSION_SECRET` secret.
- [ ] Optional: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` for analytics; error tracking (Sentry) if wanted.
- [ ] Delete or keep the cancelled "Smoke Test" orders CHATUA00001–00004 on the preview database (or start production on a fresh database).

## Before switching on
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` all green.
- [ ] PageSpeed Insights (mobile) on Home and Product ≥ 90.
- [ ] Place one real COD order end to end and cancel it in Admin.
