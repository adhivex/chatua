import { fail, json, limit, readJson } from "@/lib/api";
import { paymentProvider } from "@/lib/config";
import { db } from "@/lib/db";
import { QuoteError } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";
import { checkoutSchema } from "@/lib/validators";
import { cancelOrder, createOrder, maybeExpireStaleOrders, PriceChangedError } from "@/server/orders";

/** Creates an order from the cart. Prices, delivery fee and total are computed here, never taken from the client. */
export async function POST(req: Request) {
  const limited = limit(req, "checkout", 12, 10 * 60_000);
  if (limited) return limited;

  const body = await readJson(req, checkoutSchema);
  if ("error" in body) return body.error;
  const input = body.data;

  const provider = paymentProvider();
  if (input.paymentMethod !== "COD" && provider === "none") {
    return fail(400, "PAYMENT_UNAVAILABLE", "Online payment is not available yet. Please choose Cash on Delivery.");
  }

  await maybeExpireStaleOrders();

  let order;
  try {
    order = await createOrder(input);
  } catch (e) {
    if (e instanceof PriceChangedError) {
      return fail(409, "PRICE_CHANGED", e.message, { total: e.quote.total, subtotal: e.quote.subtotal, deliveryFee: e.quote.deliveryFee });
    }
    if (e instanceof QuoteError) return fail(409, e.code, e.message);
    console.error("[checkout] order creation failed", (e as Error).message);
    return fail(500, "SERVER_ERROR", "We could not place your order. Please try again in a moment.");
  }

  const done = { ok: true, orderNumber: order.orderNumber, token: order.accessToken, total: order.total };
  if (order.paymentMethod === "COD") return json(done, 201);

  if (provider === "mock") return json({ ...done, payment: { provider: "mock", amount: order.total } }, 201);

  try {
    const rzp = await createRazorpayOrder({ amountRupees: order.total, receipt: order.orderNumber, notes: { orderNumber: order.orderNumber } });
    await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.id } });
    return json(
      {
        ...done,
        payment: {
          provider: "razorpay",
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
          orderId: rzp.id,
          amount: rzp.amount,
          currency: rzp.currency,
          method: { UPI: "upi", CARD: "card", NETBANKING: "netbanking" }[order.paymentMethod],
          prefill: { name: order.customerName, contact: `+91${order.phone}` },
        },
      },
      201,
    );
  } catch (e) {
    console.error("[checkout] Razorpay order failed", (e as Error).message);
    await cancelOrder(order.id, "FAILED");
    return fail(502, "PAYMENT_START_FAILED", "We could not start the payment. Please try again, or choose Cash on Delivery.");
  }
}
