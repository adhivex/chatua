import "../integration-setup";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { CheckoutInput } from "@/lib/validators";

const { db } = await import("@/lib/db");
const orders = await import("@/server/orders");

const address = { addressType: "Home", name: "Test Buyer", phone: "9876543210", line: "1 Test Lane", city: "Cuttack", pincode: "753001" } as const;
let productId = "";

async function stock(size = "500g") {
  return (await db.variant.findFirstOrThrow({ where: { productId, size } })).stock;
}

function input(over: Partial<CheckoutInput> = {}): CheckoutInput {
  return { items: [{ productId, size: "500g", qty: 2 }], address: { ...address }, deliveryMethod: "STANDARD", paymentMethod: "COD", ...over };
}

beforeEach(async () => {
  await db.order.deleteMany();
  await db.product.deleteMany();
  const p = await db.product.create({
    data: {
      slug: "test-chatua",
      name: "Test Chatua",
      category: "Classic",
      shortDesc: "x",
      longDesc: "y",
      variants: { create: [{ size: "500g", grams: 500, price: 180, stock: 5, sku: "T-500" }, { size: "1kg", grams: 1000, price: 340, stock: 5, sku: "T-1K" }] },
    },
  });
  productId = p.id;
});

afterAll(async () => {
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.$disconnect();
});

describe("createOrder", () => {
  it("re-prices on the server, snapshots items and takes stock", async () => {
    const o = await orders.createOrder(input());
    expect(o.orderNumber).toMatch(/^CHATUA\d{5,}$/);
    expect(o).toMatchObject({ subtotal: 360, deliveryFee: 40, total: 400, paymentStatus: "COD", status: "PLACED" });
    expect(o.accessToken.length).toBeGreaterThanOrEqual(32);
    const items = await db.orderItem.findMany({ where: { orderId: o.id } });
    expect(items).toEqual([expect.objectContaining({ name: "Test Chatua", size: "500g", unitPrice: 180, qty: 2 })]);
    expect(await stock()).toBe(3);
  });

  it("gives sequential order numbers", async () => {
    const a = await orders.createOrder(input({ items: [{ productId, size: "500g", qty: 1 }] }));
    const b = await orders.createOrder(input({ items: [{ productId, size: "500g", qty: 1 }] }));
    expect(b.seq).toBe(a.seq + 1);
  });

  it("refuses when the total the customer saw is out of date", async () => {
    await expect(orders.createOrder(input({ expectedTotal: 399 }))).rejects.toBeInstanceOf(orders.PriceChangedError);
    expect(await stock()).toBe(5);
  });

  it("never oversells under concurrent checkouts", async () => {
    const results = await Promise.allSettled(Array.from({ length: 4 }, () => orders.createOrder(input())));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(2);
    expect(await stock()).toBe(1);
  });

  it("rolls back stock when any line fails", async () => {
    await expect(orders.createOrder(input({ items: [{ productId, size: "500g", qty: 2 }, { productId, size: "1kg", qty: 9 }] }))).rejects.toThrow(/left/);
    expect(await stock("500g")).toBe(5);
  });
});

describe("payments and cancellation", () => {
  it("cancels once and restores stock once", async () => {
    const o = await orders.createOrder(input());
    expect(await orders.cancelOrder(o.id)).toBe(true);
    expect(await orders.cancelOrder(o.id)).toBe(false);
    expect(await stock()).toBe(5);
    expect(await orders.setOrderStatus(o.id, "PACKED")).toMatch(/cannot be reopened/);
  });

  it("marks online orders paid idempotently", async () => {
    const o = await orders.createOrder(input({ paymentMethod: "UPI" }));
    expect(o.paymentStatus).toBe("PENDING");
    expect(await orders.setOrderStatus(o.id, "PACKED")).toMatch(/not been paid/);
    expect(await orders.markOrderPaid(o.id, "pay_1")).toBe(true);
    expect(await orders.markOrderPaid(o.id, "pay_1")).toBe(false);
    expect(await db.order.findUniqueOrThrow({ where: { id: o.id } })).toMatchObject({ paymentStatus: "PAID", razorpayPaymentId: "pay_1" });
    expect(await orders.setOrderStatus(o.id, "PACKED")).toBeNull();
  });

  it("expires unpaid online orders and releases stock, but leaves COD alone", async () => {
    const online = await orders.createOrder(input({ paymentMethod: "CARD" }));
    const cod = await orders.createOrder(input({ items: [{ productId, size: "500g", qty: 1 }] }));
    await db.order.updateMany({ data: { createdAt: new Date(Date.now() - 2 * 3600_000) } });
    expect(await orders.expireStaleOrders()).toBe(1);
    expect((await db.order.findUniqueOrThrow({ where: { id: online.id } })).status).toBe("CANCELLED");
    expect((await db.order.findUniqueOrThrow({ where: { id: cod.id } })).status).toBe("PLACED");
    expect(await stock()).toBe(4);
  });

  it("reinstates an expired order if its payment arrives late", async () => {
    const o = await orders.createOrder(input({ paymentMethod: "UPI" }));
    await orders.cancelOrder(o.id, "FAILED");
    expect(await stock()).toBe(5);
    await orders.markOrderPaid(o.id, "pay_late");
    expect(await db.order.findUniqueOrThrow({ where: { id: o.id } })).toMatchObject({ status: "PLACED", paymentStatus: "PAID", stockReleased: false });
    expect(await stock()).toBe(3);
  });

  it("only returns an order for the right access token", async () => {
    const o = await orders.createOrder(input());
    expect(await orders.getOrderForCustomer(o.orderNumber, o.accessToken)).not.toBeNull();
    expect(await orders.getOrderForCustomer(o.orderNumber, "x".repeat(32))).toBeNull();
    expect(await orders.getOrderForCustomer(o.orderNumber, undefined)).toBeNull();
  });

  it("enforces database integrity checks", async () => {
    const o = await orders.createOrder(input());
    await expect(db.order.update({ where: { id: o.id }, data: { total: 1 } })).rejects.toThrow();
  });
});
