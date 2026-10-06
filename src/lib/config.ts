import "server-only";

export type PaymentProvider = "razorpay" | "mock" | "none";

let warned = false;

/** Which online payment provider is active. Without one, checkout offers Cash on Delivery only. */
export function paymentProvider(): PaymentProvider {
  const p = (process.env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
  if (p === "razorpay") {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) return "razorpay";
    if (!warned) console.error("[config] PAYMENT_PROVIDER=razorpay but RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are missing; online payments are off.");
    warned = true;
    return "none";
  }
  if (p === "mock") return "mock";
  return "none";
}

export function sessionSecret(): string | null {
  const s = process.env.SESSION_SECRET ?? "";
  return s.length >= 32 ? s : null;
}

/** Minutes an unpaid online order holds stock before it is cancelled. */
export const PENDING_ORDER_TTL_MINUTES = 45;
