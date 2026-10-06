import { describe, expect, it } from "vitest";
import { buildQuote, QuoteError, type PricedVariant } from "@/lib/pricing";

const v = (productId: string, size: string, price: number, stock = 100, active = true): PricedVariant => ({ productId, productName: productId, size, price, stock, active });
const catalogue = [v("classic", "500g", 180), v("classic", "1kg", 340), v("protein", "500g", 260, 2), v("old", "500g", 200, 100, false)];

describe("buildQuote", () => {
  it("prices from the database and adds standard delivery below ₹499", () => {
    const q = buildQuote([{ productId: "classic", size: "500g", qty: 2 }], catalogue, "STANDARD");
    expect(q).toMatchObject({ subtotal: 360, deliveryFee: 40, total: 400, itemCount: 2 });
  });
  it("makes standard delivery free at ₹499 and above", () => {
    const q = buildQuote([{ productId: "classic", size: "1kg", qty: 1 }, { productId: "classic", size: "500g", qty: 1 }], catalogue, "STANDARD");
    expect(q).toMatchObject({ subtotal: 520, deliveryFee: 0, total: 520 });
  });
  it("never makes express free", () => {
    const q = buildQuote([{ productId: "classic", size: "1kg", qty: 3 }], catalogue, "EXPRESS");
    expect(q).toMatchObject({ subtotal: 1020, deliveryFee: 70, total: 1090 });
  });
  it("merges duplicate lines and caps at 20", () => {
    const q = buildQuote([{ productId: "classic", size: "500g", qty: 15 }, { productId: "classic", size: "500g", qty: 15 }], catalogue, "STANDARD");
    expect(q.lines).toHaveLength(1);
    expect(q.lines[0]?.qty).toBe(20);
  });
  it("rejects unknown and inactive products", () => {
    expect(() => buildQuote([{ productId: "nope", size: "500g", qty: 1 }], catalogue, "STANDARD")).toThrow(QuoteError);
    expect(() => buildQuote([{ productId: "old", size: "500g", qty: 1 }], catalogue, "STANDARD")).toThrow(/no longer available/);
  });
  it("rejects quantities above stock with a helpful message", () => {
    expect(() => buildQuote([{ productId: "protein", size: "500g", qty: 3 }], catalogue, "STANDARD")).toThrow("Only 2 of protein (500g) left. Please reduce the quantity.");
  });
});
