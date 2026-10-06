import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/signature";
import { markOrderPaid, markPaymentFailed } from "@/server/orders";

type Event = {
  event: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } }; order?: { entity?: { id?: string } } };
};

/** Razorpay webhook (payment.captured, order.paid, payment.failed). Idempotent; signature required. */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const raw = await req.text();
  if (raw.length > 100_000) return new Response("Too large", { status: 413 });
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, sig, secret)) return new Response("Invalid signature", { status: 400 });

  let evt: Event;
  try {
    evt = JSON.parse(raw) as Event;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const payment = evt.payload?.payment?.entity;
  const rzpOrderId = payment?.order_id ?? evt.payload?.order?.entity?.id;
  if (!rzpOrderId) return new Response("ok");

  const order = await db.order.findUnique({ where: { razorpayOrderId: rzpOrderId }, select: { id: true, orderNumber: true } });
  if (!order) return new Response("ok"); // not ours, or created in another environment

  if (evt.event === "payment.captured" || evt.event === "order.paid" || evt.event === "payment.authorized") {
    await markOrderPaid(order.id, payment?.id ?? null);
  } else if (evt.event === "payment.failed") {
    await markPaymentFailed(order.id);
  }
  return new Response("ok");
}
