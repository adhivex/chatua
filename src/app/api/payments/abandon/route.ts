import { fail, json, limit, readJson } from "@/lib/api";
import { orderAccessSchema } from "@/lib/validators";
import { getOrderForCustomer, settleUnpaidOrder } from "@/server/orders";

/**
 * The customer closed the payment window. If the provider has a successful payment we keep the
 * order as paid; otherwise we cancel it and release the stock. The cart stays on the device.
 */
export async function POST(req: Request) {
  const limited = limit(req, "abandon", 30, 10 * 60_000);
  if (limited) return limited;
  const body = await readJson(req, orderAccessSchema);
  if ("error" in body) return body.error;

  const order = await getOrderForCustomer(body.data.orderNumber, body.data.token);
  if (!order) return fail(404, "NOT_FOUND", "We could not find that order.");
  try {
    return json({ ok: true, status: await settleUnpaidOrder(order.id) });
  } catch (e) {
    console.error("[payments] abandon check failed", order.orderNumber, (e as Error).message);
    return json({ ok: true, status: "unchanged" });
  }
}
