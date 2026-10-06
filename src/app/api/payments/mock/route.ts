import { randomBytes } from "node:crypto";
import { z } from "zod";
import { fail, json, limit, readJson } from "@/lib/api";
import { paymentProvider } from "@/lib/config";
import { orderAccessSchema } from "@/lib/validators";
import { getOrderForCustomer, markOrderPaid, settleUnpaidOrder } from "@/server/orders";

const schema = orderAccessSchema.extend({ outcome: z.enum(["success", "failure"]) });

/** Test-mode stand-in for Razorpay. Only exists when PAYMENT_PROVIDER=mock. */
export async function POST(req: Request) {
  if (paymentProvider() !== "mock") return fail(404, "NOT_FOUND", "Not found.");
  const limited = limit(req, "mockpay", 30, 10 * 60_000);
  if (limited) return limited;
  const body = await readJson(req, schema);
  if ("error" in body) return body.error;

  const order = await getOrderForCustomer(body.data.orderNumber, body.data.token);
  if (!order || order.paymentMethod === "COD") return fail(404, "NOT_FOUND", "We could not find that order.");

  if (body.data.outcome === "success") {
    await markOrderPaid(order.id, `mock_${randomBytes(8).toString("hex")}`);
    return json({ ok: true, status: "paid" });
  }
  return json({ ok: true, status: await settleUnpaidOrder(order.id) });
}
