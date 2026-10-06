import { deliveryFee, type DeliveryMethod } from "./delivery";
import { MAX_QTY, type CartLineInput } from "./validators";

export type PricedVariant = {
  productId: string;
  productName: string;
  size: string;
  price: number;
  stock: number;
  active: boolean;
};

export type QuoteLine = { productId: string; name: string; size: string; unitPrice: number; qty: number; lineTotal: number };
export type Quote = { lines: QuoteLine[]; itemCount: number; subtotal: number; deliveryFee: number; total: number };

export class QuoteError extends Error {
  constructor(
    public code: "UNAVAILABLE" | "OUT_OF_STOCK" | "EMPTY",
    message: string,
  ) {
    super(message);
  }
}

/**
 * Prices a cart from database rows only. Client prices and totals are never used.
 * Duplicate lines for the same product and size are merged.
 */
export function buildQuote(items: CartLineInput[], variants: PricedVariant[], method: DeliveryMethod): Quote {
  const merged = new Map<string, CartLineInput>();
  for (const it of items) {
    const key = `${it.productId}:${it.size}`;
    const prev = merged.get(key);
    merged.set(key, { ...it, qty: Math.min(MAX_QTY, (prev?.qty ?? 0) + it.qty) });
  }
  if (merged.size === 0) throw new QuoteError("EMPTY", "Your cart is empty.");

  const lines: QuoteLine[] = [];
  for (const it of merged.values()) {
    const v = variants.find((x) => x.productId === it.productId && x.size === it.size);
    if (!v || !v.active) {
      throw new QuoteError("UNAVAILABLE", "One of the items in your cart is no longer available. Please review your cart.");
    }
    if (v.stock < it.qty) {
      throw new QuoteError(
        "OUT_OF_STOCK",
        v.stock > 0
          ? `Only ${v.stock} of ${v.productName} (${v.size}) left. Please reduce the quantity.`
          : `${v.productName} (${v.size}) is out of stock. Please remove it from your cart.`,
      );
    }
    lines.push({ productId: v.productId, name: v.productName, size: v.size, unitPrice: v.price, qty: it.qty, lineTotal: v.price * it.qty });
  }

  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  const fee = deliveryFee(subtotal, method);
  return { lines, itemCount: lines.reduce((a, l) => a + l.qty, 0), subtotal, deliveryFee: fee, total: subtotal + fee };
}
