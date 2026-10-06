# 03 — Screens and Behaviour

Routes use the Next.js App Router. All screens are mobile-first. Bottom nav (Home, Shop, Recipes, Cart, Account) shows on main screens; hidden on product, checkout, About and Heritage.

| Route | Screen |
|---|---|
| `/` | Home |
| `/shop` | Shop |
| `/shop/[slug]` | Product detail |
| `/cart` | Cart |
| `/checkout` | Delivery details + payment |
| `/order/[orderNumber]` | Order placed |
| `/recipes` | Recipes |
| `/about` | What is Chatua? |
| `/heritage` | Our Odisha Heritage |
| `/account` | Account placeholder |
| `/admin/*` | Admin (Phase 4) |

## Home
- Transparent top bar over a dark espresso hero (light logo, search and cart icons). Hero: headline "The Goodness of Grains, In Every Spoon.", copy "A traditional Odisha food, made from natural grains for everyday nourishment.", gold button "Shop Chatua".
- Content sheet slides over the hero (30px top radius): trust row (100% Natural, Rich in Nutrition, No Added Preservatives, Pan India Delivery), dark heritage card "Chatua from Odisha" with link "Learn More" to `/heritage`, "Shop Our Chatua" with "View All" and two featured product cards, then a "What is Chatua?" row linking to `/about`.
- Search icon goes to `/shop` and focuses the search field.

## Shop
- Search field (filters live by name and description), category chips: All, Classic, Multi-Grain, Jaggery, Protein.
- Product rows: image, name, short description, size pills (500g / 1kg, default 500g), price for selected size, round "+" button adds one to cart and shows toast "{name} added to cart".
- Empty state: "No Chatua found. Try a different name, or see all our blends." with button "Show all Chatua".

## Product detail
- Full-bleed swipeable gallery (3 images, scroll-snap, dots), back, favourite and share buttons floating, "Bestseller" tag when flagged.
- Sheet: title, short description, trust row (3), "Choose Size" two options with prices, quantity stepper (1–20), button "Add to Cart | ₹{price × qty}", delivery/payment/returns trust row, accordions: Product Details (open), How to enjoy, Storage.
- Share uses the Web Share API with a clipboard fallback. Favourites are local only in v1.

## Cart
- Items: image, name, size, quantity stepper, line price, remove. Removing at quantity 1 or tapping the bin removes the line.
- Free delivery nudge: "Add ₹X more for free standard delivery." or "You get free standard delivery."
- "Add more to your cart" horizontal cards (products not in cart). Order Summary: item count, delivery, total. Sticky "Proceed to Checkout".
- Empty state: "Your cart is empty" with "Shop Chatua".

## Checkout
- Address type toggle Home/Work, fields: full name, mobile, house/street/area, city, pincode. Inline errors, field highlight, summary message "Please complete the highlighted fields. Mobile needs 10 digits and pincode needs 6 digits."
- Delivery options: Standard (3–5 days, ₹40 or Free), Express (2–3 days, ₹70).
- Payment methods: UPI, Credit/Debit Card, Net Banking, Cash on Delivery. Online methods open Razorpay Checkout; COD places the order directly.
- Sticky "Pay ₹{total}" (shows "Pay in cash when your order arrives" for COD).

## Order placed
- Animated green tick with gold ring and small confetti. "Order Placed Successfully!", "Thank you for choosing Chatua. Your order has been confirmed."
- Card: Order ID with copy button, estimated delivery, total. "Track Order" toggles a status timeline: Order confirmed, Packed fresh in Odisha, Out for delivery, Delivered (driven by order status).
- "You might also like" two products not in the order.
- Order page is accessible by link with an unguessable token (`/order/[orderNumber]?t=...`) so guests can return.

## Recipes
Chips All, Drinks, Breakfast, Snacks. Expandable rows: Chatua Drink, Chatua Breakfast Bowl, Chatua Ladoo, each with a short method. Content is managed in the database (Recipe table).

## What is Chatua? / Heritage
Editorial pages with the copy from the prototype (replace images with real ones). Heritage page ends with "Shop Chatua".

## Account (placeholder)
Welcome card ("Sign in to track orders and save addresses. Coming soon.") and a menu: What is Chatua?, Our Odisha Heritage, Recipes, My Cart.

## Global behaviours
- Toasts for cart actions. Cart badge on top bar and nav.
- Loading: skeletons for lists; button loading states during payment.
- Errors: plain language, say what went wrong and how to fix it. Payment failure keeps the cart and returns to checkout with a message.
- SEO: unique title and description per page, product JSON-LD, sitemap, robots.
