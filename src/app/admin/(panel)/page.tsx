import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { dashboardStats } from "@/server/admin";
import { maybeExpireStaleOrders } from "@/server/orders";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await maybeExpireStaleOrders();
  const [s, recent] = await Promise.all([dashboardStats(), db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 })]);
  const tiles = [
    { label: "Orders (last 24h)", value: s.today, href: "/admin/orders" },
    { label: "Sales (last 24h)", value: formatINR(s.revenue24h), href: "/admin/orders" },
    { label: "To pack", value: s.toPack, href: "/admin/orders?status=PLACED" },
    { label: "Shipped, not delivered", value: s.shipped, href: "/admin/orders?status=SHIPPED" },
  ];
  return (
    <>
      <h1 className="font-head text-3xl font-semibold">Dashboard</h1>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-card bg-card p-4 shadow-soft hover:shadow-lift">
            <p className="text-xs font-semibold text-muted">{t.label}</p>
            <p className="mt-1 font-head text-3xl font-semibold">{t.value}</p>
          </Link>
        ))}
      </div>
      {s.awaitingPayment > 0 && (
        <p className="mt-3 text-sm text-muted">
          {s.awaitingPayment} online order{s.awaitingPayment > 1 ? "s are" : " is"} waiting for payment; unpaid orders are cancelled automatically after 45 minutes.
        </p>
      )}

      <section className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-3 font-head text-xl font-semibold">Latest orders</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-card bg-card shadow-soft">
            {recent.length === 0 && <li className="p-4 text-sm text-muted">No orders yet.</li>}
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3 text-sm hover:bg-selected">
                  <b>#{o.orderNumber}</b>
                  <span className="text-muted">{o.customerName}</span>
                  <span className="ml-auto font-semibold">{formatINR(o.total)}</span>
                  <span className="flex w-full gap-1.5 text-xs text-muted">
                    <StatusBadge value={o.status} /> <StatusBadge value={o.paymentStatus} /> <span className="ml-auto">{formatDateTime(o.createdAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-head text-xl font-semibold">Low stock</h2>
          <ul className="divide-y divide-line rounded-card bg-card text-sm shadow-soft">
            {s.lowStock.length === 0 && <li className="p-4 text-muted">All sizes have 15 or more in stock.</li>}
            {s.lowStock.map((v) => (
              <li key={v.id}>
                <Link href={`/admin/products/${v.product.id}`} className="flex justify-between p-3 hover:bg-selected">
                  <span>
                    {v.product.name} · {v.size}
                  </span>
                  <b className={v.stock <= 0 ? "text-danger" : ""}>{v.stock}</b>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
