import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { inputCls } from "@/components/admin/ActionForm";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { PAGE_SIZE } from "@/server/admin";
import { maybeExpireStaleOrders, ORDER_STATUSES } from "@/server/orders";

export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await maybeExpireStaleOrders();
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? { OR: [{ orderNumber: { contains: q.replace(/^#/, "").toUpperCase() } }, { phone: { contains: q.replace(/\D/g, "") || q } }, { customerName: { contains: q, mode: "insensitive" } }] }
      : {}),
  };
  const [orders, total] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, include: { _count: { select: { items: true } } } }),
    db.order.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    const merged = { status, q: q || undefined, page: undefined, ...p };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") u.set(k, String(v));
    return `/admin/orders${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <h1 className="font-head text-3xl font-semibold">Orders</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[undefined, ...ORDER_STATUSES].map((s) => (
          <Link key={s ?? "all"} href={link({ status: s })} className={cn("rounded-full border px-3 py-1.5 text-sm", status === s ? "border-espresso bg-espresso text-gold-light" : "border-line")}>
            {s ? s.charAt(0) + s.slice(1).toLowerCase() : "All"}
          </Link>
        ))}
        <form className="ml-auto flex gap-2" action="/admin/orders">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="q" className="sr-only">
            Search orders
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Order ID, phone or name" className={cn(inputCls, "w-56")} />
          <button className="btn btn-line min-h-10 px-3 py-2 text-sm">Search</button>
        </form>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card bg-card shadow-soft">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Placed</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-selected">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-clay underline-offset-2 hover:underline">
                    #{o.orderNumber}
                  </Link>
                  <span className="block text-xs text-muted">{o._count.items} line(s)</span>
                </td>
                <td className="p-3">
                  {o.customerName}
                  <span className="block text-xs text-muted">
                    {o.city} · {o.phone}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted">{formatDateTime(o.createdAt)}</td>
                <td className="p-3">
                  <StatusBadge value={o.status} />
                </td>
                <td className="p-3">
                  <StatusBadge value={o.paymentStatus} />
                  <span className="block text-xs text-muted">{o.paymentMethod}</span>
                </td>
                <td className="p-3 text-right font-semibold">{formatINR(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          {total} order{total === 1 ? "" : "s"}
        </span>
        <span className="flex gap-2">
          {page > 1 && (
            <Link className="btn btn-line min-h-10 px-3 py-2 text-sm" href={link({ page: page - 1 })}>
              Previous
            </Link>
          )}
          {page < pages && (
            <Link className="btn btn-line min-h-10 px-3 py-2 text-sm" href={link({ page: page + 1 })}>
              Next
            </Link>
          )}
        </span>
      </div>
    </>
  );
}
