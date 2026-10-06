# 01 — Product Requirements (v1)

## Product
Chatua is an online store for Chatua, a traditional roasted-grain powder from Odisha (similar to sattu), delivered across India. The app must feel premium, trustworthy and rooted in Odisha's heritage.

## Users
- Health-conscious urban buyers who want a natural everyday food (main audience, mobile)
- Odia families abroad or outside Odisha who want a taste of home
- Gift buyers

## Goals for v1
1. A visitor understands what Chatua is within seconds.
2. A visitor can go from home to a paid order in under two minutes on a phone.
3. The shop is easy to extend with new products without code changes beyond the database.

## In scope (v1)
- Home, Shop (search + category filter), Product detail, Cart, Checkout (address, delivery option, payment), Order confirmation with Track Order, Recipes, What is Chatua?, Our Odisha Heritage, Account placeholder
- Guest checkout; cart saved on device
- Payments: Razorpay (UPI, cards, net banking) and Cash on Delivery
- Order emails/SMS are optional (Phase 5)
- Simple admin to manage products, prices, stock and order status (Phase 4)
- SEO basics: metadata, Open Graph, sitemap, product structured data
- Analytics: Vercel Analytics or Plausible

## Out of scope (v1)
User accounts and login, coupons, reviews, subscriptions, multi-language (Odia/Hindi is a planned v2), wishlist sync, delivery partner integrations (status is updated manually in admin).

## Catalogue
| Product | Category | 500g | 1kg |
|---|---|---|---|
| Classic Chatua | Classic | ₹180 | ₹340 |
| Multi-Grain Chatua | Multi-Grain | ₹220 | ₹420 |
| Jaggery Chatua | Jaggery | ₹240 | ₹450 |
| Protein Chatua | Protein | ₹260 | ₹490 |

Classic Chatua carries the "Bestseller" tag.

## Business rules
- Delivery: Standard ₹40 (3–5 days), free for item subtotal ≥ ₹499. Express ₹70 (2–3 days), never free.
- Order total = item subtotal + delivery fee. No tax line in v1 (prices are inclusive; confirm GST handling with the owner before launch).
- Quantity per line: 1 to 20.
- COD allowed for all pincodes in v1; revisit if serviceability data is added.
- Order statuses: `PLACED → PACKED → SHIPPED → DELIVERED`, plus `CANCELLED`. Payment statuses: `PENDING → PAID`, `FAILED`, `COD`.

## Validation
- Mobile number: 10 digits. Pincode: 6 digits. Name, address line and city required.

## Success metrics
Visit-to-add-to-cart rate, checkout completion rate, Lighthouse mobile performance ≥ 90, LCP < 2.5s on 4G.

## Open questions for the owner
GST registration and invoice format · shipping partner and packaging weights · FSSAI licence number to show in the footer · real product photography · return policy wording · WhatsApp support number.
