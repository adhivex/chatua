import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, inputCls, labelCls, Submit } from "@/components/admin/ActionForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { updateOrderStatus, updatePaymentStatus } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { siteUrl } from "@/lib/site";
import { ORDER_STATUSES } from "@/server/orders";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: PageProps<"/admin/orders/[id]">) {
  const order = await db.order.findUnique({ where: { id: (await params).id }, include: { items: true } });
  if (!order) notFound();
  const cod = order.paymentMethod === "COD";
  const payOptions = cod ? ["COD", "PAID", "REFUNDED"] : ["PENDING", "PAID", "FAILED", "REFUNDED"];
  const customerLink = `${siteUrl()}/order/${order.orderNumber}?t=${order.accessToken}`;

  return (
    <>
      <Link href="/admin/orders" className="text-sm font-semibold text-clay">
        ← All orders
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-head text-3xl font-semibold">#{order.orderNumber}</h1>
        <StatusBadge value={order.status} />
        <StatusBadge value={order.paymentStatus} />
      </div>
      <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)} · last updated {formatDateTime(order.updatedAt)}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-card bg-card p-4 shadow-soft">
          <h2 className="font-head text-lg font-semibold">Items</h2>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-line">
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2">
                    {it.name} · {it.size}
                  </td>
                  <td className="py-2 text-muted">
                    {it.qty} × {formatINR(it.unitPrice)}
                  </td>
                  <td className="py-2 text-right">{formatINR(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2" colSpan={2}>
                  Delivery ({order.deliveryMethod === "EXPRESS" ? "Express 2–3 days" : "Standard 3–5 days"})
                </td>
                <td className="py-2 text-right">{order.deliveryFee ? formatINR(order.deliveryFee) : "Free"}</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2" colSpan={2}>
                  Total
                </td>
                <td className="py-2 text-right">{formatINR(order.total)}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">
            Payment: {order.paymentMethod}
            {order.razorpayPaymentId && <> · {order.razorpayPaymentId}</>}
            {order.razorpayOrderId && <> · {order.razorpayOrderId}</>}
          </p>
        </section>

        <section className="rounded-card bg-card p-4 shadow-soft">
          <h2 className="font-head text-lg font-semibold">Deliver to</h2>
          <address className="mt-2 text-sm not-italic leading-relaxed">
            <b>{order.customerName}</b> ({order.addressType})
            <br />
            {order.addressLine}
            <br />
            {order.city} {order.pincode}
            <br />
            <a className="font-semibold text-clay" href={`tel:+91${order.phone}`}>
              +91 {order.phone}
            </a>
          </address>
          <p className="mt-3 break-all text-xs text-muted">
            Customer&apos;s order page: <a href={customerLink} className="text-clay" target="_blank" rel="noreferrer">{customerLink}</a>
          </p>
        </section>

        <section className="rounded-card bg-card p-4 shadow-soft">
          <h2 className="font-head text-lg font-semibold">Order status</h2>
          {order.status === "CANCELLED" ? (
            <p className="mt-2 text-sm text-muted">This order is cancelled and its stock has been returned.{order.paymentStatus === "PAID" && " It was paid online: refund it in the Razorpay dashboard, then set payment to Refunded."}</p>
          ) : (
            <ActionForm action={updateOrderStatus} className="mt-2">
              <input type="hidden" name="id" value={order.id} />
              <label htmlFor="status" className={labelCls}>
                Move the order to
              </label>
              <div className="flex gap-2">
                <select id="status" name="status" defaultValue={order.status} className={inputCls}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <Submit>Update</Submit>
              </div>
              <p className="mt-2 text-xs text-muted">The customer sees this on their Track Order timeline. Cancelling returns the items to stock.</p>
            </ActionForm>
          )}
        </section>

        <section className="rounded-card bg-card p-4 shadow-soft">
          <h2 className="font-head text-lg font-semibold">Payment status</h2>
          <ActionForm action={updatePaymentStatus} className="mt-2">
            <input type="hidden" name="id" value={order.id} />
            <label htmlFor="paymentStatus" className={labelCls}>
              {cod ? "Mark as paid once the cash is collected" : "Online payments update automatically; change only to correct a mistake"}
            </label>
            <div className="flex gap-2">
              <select id="paymentStatus" name="paymentStatus" defaultValue={order.paymentStatus} className={inputCls}>
                {payOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "COD" ? "Cash on delivery (not collected)" : s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <Submit>Update</Submit>
            </div>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
