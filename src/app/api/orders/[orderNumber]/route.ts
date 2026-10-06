import { fail, json, limit } from "@/lib/api";
import { ORDER_NUMBER_RE } from "@/lib/order-number";
import { getOrderForCustomer } from "@/server/orders";

/** Order status for the guest order page (token required). */
export async function GET(req: Request, ctx: RouteContext<"/api/orders/[orderNumber]">) {
  const limited = limit(req, "order-status", 60, 60_000);
  if (limited) return limited;
  const { orderNumber } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t") ?? undefined;
  if (!ORDER_NUMBER_RE.test(orderNumber)) return fail(404, "NOT_FOUND", "Order not found.");
  const o = await getOrderForCustomer(orderNumber, token);
  if (!o) return fail(404, "NOT_FOUND", "Order not found.");
  return json({ ok: true, orderNumber: o.orderNumber, status: o.status, paymentStatus: o.paymentStatus, total: o.total });
}
