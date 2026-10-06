import { fail, json } from "@/lib/api";
import { safeEqual } from "@/lib/signature";
import { expireStaleOrders } from "@/server/orders";

/** Cancels unpaid online orders past their hold time. Call with "Authorization: Bearer $CRON_SECRET". */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (secret.length < 16 || !safeEqual(auth, `Bearer ${secret}`)) return fail(401, "UNAUTHORIZED", "Unauthorized.");
  return json({ ok: true, cancelled: await expireStaleOrders() });
}
