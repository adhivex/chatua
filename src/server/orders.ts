import "server-only";
import { randomBytes } from "node:crypto";
import { Prisma, type OrderStatus, type PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { PENDING_ORDER_TTL_MINUTES, paymentProvider } from "@/lib/config";
import { formatOrderNumber } from "@/lib/order-number";
import { buildQuote, QuoteError, type Quote } from "@/lib/pricing";
import { fetchOrderPayments } from "@/lib/razorpay";
import { safeEqual } from "@/lib/signature";
import type { CheckoutInput } from "@/lib/validators";

type Tx = Prisma.TransactionClient;

export class PriceChangedError extends Error {
  constructor(public quote: Quote) {
    super("Prices or delivery charges have changed. Please review your order total.");
  }
}

/** Server-side quote for a cart, from current database prices and stock. */
export async function quoteCart(items: CheckoutInput["items"], method: CheckoutInput["deliveryMethod"], tx: Tx = db): Promise<Quote> {
  const ids = [...new Set(items.map((i) => i.productId))];
  const variants = await tx.variant.findMany({
    where: { productId: { in: ids } },
    include: { product: { select: { name: true, active: true } } },
  });
  return buildQuote(
    items,
    variants.map((v) => ({ productId: v.productId, productName: v.product.name, size: v.size, price: v.price, stock: v.stock, active: v.product.active })),
    method,
  );
}

/**
 * Creates an order in one transaction: re-prices from the database, checks the customer saw the
 * same total, takes stock (conditionally, so concurrent buyers cannot oversell) and snapshots items.
 */
export async function createOrder(input: CheckoutInput) {
  return db.$transaction(async (tx) => {
    const quote = await quoteCart(input.items, input.deliveryMethod, tx);
    if (input.expectedTotal !== undefined && input.expectedTotal !== quote.total) throw new PriceChangedError(quote);

    for (const l of quote.lines) {
      const { count } = await tx.variant.updateMany({
        where: { productId: l.productId, size: l.size, stock: { gte: l.qty } },
        data: { stock: { decrement: l.qty } },
      });
      if (count !== 1) throw new QuoteError("OUT_OF_STOCK", `${l.name} (${l.size}) just sold out. Please review your cart.`);
    }

    const rows = await tx.$queryRaw<{ seq: bigint }[]>`SELECT nextval(pg_get_serial_sequence('"Order"', 'seq')) AS seq`;
    const n = Number(rows[0]?.seq);
    const a = input.address;

    return tx.order.create({
      data: {
        seq: n,
        orderNumber: formatOrderNumber(n),
        accessToken: randomBytes(24).toString("base64url"),
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "COD" ? "COD" : "PENDING",
        deliveryMethod: input.deliveryMethod,
        subtotal: quote.subtotal,
        deliveryFee: quote.deliveryFee,
        total: quote.total,
        customerName: a.name,
        phone: a.phone,
        addressType: a.addressType,
        addressLine: a.line,
        city: a.city,
        pincode: a.pincode,
        items: { create: quote.lines.map((l) => ({ productId: l.productId, name: l.name, size: l.size, unitPrice: l.unitPrice, qty: l.qty })) },
      },
    });
  });
}

async function restoreStock(tx: Tx, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const it of items) {
    await tx.variant.updateMany({ where: { productId: it.productId, size: it.size }, data: { stock: { increment: it.qty } } });
  }
}

/** Cancels an order and puts its stock back exactly once. Returns false if it was already cancelled. */
export async function cancelOrder(orderId: string, paymentStatus?: PaymentStatus): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, stockReleased: false, status: { not: "DELIVERED" } },
      data: { status: "CANCELLED", stockReleased: true, ...(paymentStatus ? { paymentStatus } : {}) },
    });
    if (count === 1) await restoreStock(tx, orderId);
    return count === 1;
  });
}

/**
 * Marks an online order paid. Idempotent (callback, webhook and expiry checks may all report the
 * same payment). If the order had already expired, it is reinstated and its stock taken again.
 */
export async function markOrderPaid(orderId: string, razorpayPaymentId: string | null): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentMethod === "COD") return false;
    if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") return false;

    const reinstate = order.status === "CANCELLED" && order.stockReleased;
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: razorpayPaymentId ?? order.razorpayPaymentId,
        ...(reinstate ? { status: "PLACED", stockReleased: false } : {}),
      },
    });
    if (reinstate) {
      console.warn(`[orders] ${order.orderNumber} was paid after it expired; reinstated. Check stock.`);
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const it of items) {
        await tx.variant.updateMany({ where: { productId: it.productId, size: it.size }, data: { stock: { decrement: it.qty } } });
      }
    }
    return true;
  });
}

export async function markPaymentFailed(orderId: string) {
  await db.order.updateMany({ where: { id: orderId, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED" } });
}

/** Looks up an order for the guest order page; the token must match. */
export async function getOrderForCustomer(orderNumber: string, token: string | undefined) {
  if (!token) return null;
  const order = await db.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!order || !safeEqual(order.accessToken, token)) return null;
  return order;
}

/**
 * Resolves an unpaid online order the customer walked away from: if Razorpay has a successful
 * payment for it we mark it paid, otherwise we cancel it and release the stock.
 */
export async function settleUnpaidOrder(orderId: string): Promise<"paid" | "cancelled" | "unchanged"> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentMethod === "COD" || order.paymentStatus === "PAID") return "unchanged";
  if (order.status === "CANCELLED") return "unchanged";

  if (order.razorpayOrderId && paymentProvider() === "razorpay") {
    const payments = await fetchOrderPayments(order.razorpayOrderId);
    const ok = payments.find((p) => p.status === "captured" || p.status === "authorized");
    if (ok) {
      await markOrderPaid(order.id, ok.id);
      return "paid";
    }
  }
  return (await cancelOrder(order.id, "FAILED")) ? "cancelled" : "unchanged";
}

/** Cancels online orders left unpaid for longer than the hold time. Safe to call often. */
export async function expireStaleOrders(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - PENDING_ORDER_TTL_MINUTES * 60_000);
  const stale = await db.order.findMany({
    where: { paymentMethod: { not: "COD" }, paymentStatus: { in: ["PENDING", "FAILED"] }, status: "PLACED", createdAt: { lt: cutoff } },
    select: { id: true },
    take: 50,
  });
  let n = 0;
  for (const o of stale) {
    try {
      if ((await settleUnpaidOrder(o.id)) === "cancelled") n++;
    } catch (e) {
      console.error("[orders] expiry check failed", o.id, (e as Error).message);
    }
  }
  return n;
}

let lastExpiry = 0;
/** Runs expireStaleOrders at most once a minute (called from checkout and admin). */
export async function maybeExpireStaleOrders() {
  if (Date.now() - lastExpiry < 60_000) return;
  lastExpiry = Date.now();
  await expireStaleOrders().catch((e) => console.error("[orders] expiry failed", (e as Error).message));
}

/* ---------------------------------------------------------------- admin */

export const ORDER_STATUSES: OrderStatus[] = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
export const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "COD", "REFUNDED"];

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<string | null> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return "Order not found.";
  if (order.status === status) return null;
  if (order.status === "CANCELLED") return "A cancelled order cannot be reopened. Ask the customer to order again.";
  if (status === "CANCELLED") {
    if (order.status === "DELIVERED") return "A delivered order cannot be cancelled.";
    await cancelOrder(orderId);
    return null;
  }
  if (order.paymentMethod !== "COD" && order.paymentStatus !== "PAID") return "This order has not been paid yet.";
  await db.order.update({ where: { id: orderId }, data: { status } });
  return null;
}

export async function setPaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<string | null> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return "Order not found.";
  const allowed: Record<string, PaymentStatus[]> = {
    COD: ["COD", "PAID", "REFUNDED"],
    ONLINE: ["PENDING", "PAID", "FAILED", "REFUNDED"],
  };
  if (!allowed[order.paymentMethod === "COD" ? "COD" : "ONLINE"]!.includes(paymentStatus)) return "That payment status does not apply to this order.";
  await db.order.update({ where: { id: orderId }, data: { paymentStatus } });
  return null;
}
