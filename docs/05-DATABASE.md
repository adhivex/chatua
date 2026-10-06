# 05 — Database (Prisma + Neon PostgreSQL)

## schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum OrderStatus {
  PLACED
  PACKED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  COD
  REFUNDED
}

enum PaymentMethod {
  UPI
  CARD
  NETBANKING
  COD
}

enum DeliveryMethod {
  STANDARD
  EXPRESS
}

model Product {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  category    String           // Classic | Multi-Grain | Jaggery | Protein
  shortDesc   String
  longDesc    String
  howToEnjoy  String?
  storage     String?
  bestseller  Boolean  @default(false)
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)
  images      ProductImage[]
  variants    Variant[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Variant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  size      String          // "500g" | "1kg"
  grams     Int
  price     Int             // INR rupees
  stock     Int     @default(0)
  sku       String  @unique
  @@unique([productId, size])
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  publicId  String          // Cloudinary public id
  alt       String
  position  Int     @default(0)
}

model Order {
  id            String   @id @default(cuid())
  seq           Int      @unique @default(autoincrement())
  orderNumber   String   @unique   // CHATUA00001
  accessToken   String   @unique   // for guest order page links
  status        OrderStatus   @default(PLACED)
  paymentStatus PaymentStatus @default(PENDING)
  paymentMethod PaymentMethod
  deliveryMethod DeliveryMethod
  subtotal      Int
  deliveryFee   Int
  total         Int
  customerName  String
  phone         String
  email         String?
  addressType   String   @default("Home")
  addressLine   String
  city          String
  state         String?
  pincode       String
  razorpayOrderId   String? @unique
  razorpayPaymentId String?
  items         OrderItem[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  name      String   // snapshot
  size      String   // snapshot
  unitPrice Int      // snapshot
  qty       Int
}

model Recipe {
  id       String @id @default(cuid())
  slug     String @unique
  title    String
  note     String
  category String   // Drinks | Breakfast | Snacks
  body     String
  imagePublicId String?
  sortOrder Int @default(0)
}
```

## Seed data
Products (all `active`, stock 100 each variant to start):
| slug | name | category | 500g | 1kg | flags |
|---|---|---|---|---|---|
| classic-chatua | Classic Chatua | Classic | 180 | 340 | bestseller |
| multi-grain-chatua | Multi-Grain Chatua | Multi-Grain | 220 | 420 | |
| jaggery-chatua | Jaggery Chatua | Jaggery | 240 | 450 | |
| protein-chatua | Protein Chatua | Protein | 260 | 490 | |

Short descriptions and long descriptions: copy from `docs/reference/chatua-prototype-v3.html` (`PRODUCTS` array). SKUs: `CHT-CLS-500`, `CHT-CLS-1K`, `CHT-MUL-500`, `CHT-MUL-1K`, `CHT-JAG-500`, `CHT-JAG-1K`, `CHT-PRO-500`, `CHT-PRO-1K`.

Recipes: Chatua Drink (Drinks), Chatua Breakfast Bowl (Breakfast), Chatua Ladoo (Snacks); text from the prototype `RECIPES` array.

## Rules
Order items snapshot name, size and price so history never changes when products are edited. Decrement stock in the same transaction as order creation; restore on cancellation.
