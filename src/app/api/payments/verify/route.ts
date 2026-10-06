import { z } from "zod";
import { fail, json, limit, readJson } from "@/lib/api";
import { paymentProvider } from "@/lib/config";
import { verifyPaymentSignature } from "@/lib/signature";
import { orderAccessSchema } from "@/lib/validators";
import { getOrderForCustomer, markOrderPaid } from "@/server/orders";

const schema = orderAccessSchema.extend({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

/** Razorpay Checkout success callback: verify the signature, then mark the order paid. */
export async function POST(req: Request) {
  const limited = limit(req, "verify", 20, 10 * 60_000);
  if (limited) return limited;
  const body = await readJson(req, schema);
  if ("error" in body) return body.error;
  const b = body.data;

  if (paymentProvider() !== "razorpay") return fail(400, "PAYMENT_UNAVAILABLE", "Online payment is not available.");
  const order = await getOrderForCustomer(b.orderNumber, b.token);
  if (!order || order.razorpayOrderId !== b.razorpay_order_id) return fail(404, "NOT_FOUND", "We could not find that order.");

  if (!verifyPaymentSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature, process.env.RAZORPAY_KEY_SECRET!)) {
    console.warn(`[payments] bad signature for ${order.orderNumber}`);
    return fail(400, "BAD_SIGNATURE", "We could not confirm this payment. If money was deducted, it will be refunded automatically.");
  }
  await markOrderPaid(order.id, b.razorpay_payment_id);
  return json({ ok: true, orderNumber: order.orderNumber });
}
