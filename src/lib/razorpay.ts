import "server-only";

// Minimal Razorpay REST client (Orders and Payments APIs). Amounts are in paise.
const API = "https://api.razorpay.com/v1";

function auth() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Razorpay keys are not configured");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: auth(), "Content-Type": "application/json", ...init?.headers },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) {
    // Never log request bodies or payment data; status and Razorpay's error code are enough.
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; description?: string } } | null;
    throw new Error(`Razorpay ${path} failed: ${res.status} ${body?.error?.code ?? ""}`.trim());
  }
  return (await res.json()) as T;
}

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string };
export type RazorpayPayment = { id: string; order_id: string; status: "created" | "authorized" | "captured" | "refunded" | "failed"; method: string; amount: number };

export function createRazorpayOrder(input: { amountRupees: number; receipt: string; notes?: Record<string, string> }) {
  return call<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ amount: input.amountRupees * 100, currency: "INR", receipt: input.receipt, notes: input.notes }),
  });
}

export async function fetchOrderPayments(razorpayOrderId: string): Promise<RazorpayPayment[]> {
  const res = await call<{ items: RazorpayPayment[] }>(`/orders/${encodeURIComponent(razorpayOrderId)}/payments`);
  return res.items;
}

export function fetchPayment(paymentId: string) {
  return call<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}
