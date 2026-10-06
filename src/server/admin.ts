import "server-only";
import { db } from "@/lib/db";

export const PAGE_SIZE = 25;

export async function dashboardStats() {
  const since = new Date(Date.now() - 24 * 3600_000);
  const [today, toPack, shipped, awaitingPayment, lowStock, revenue] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } } }),
    db.order.count({ where: { status: "PLACED", OR: [{ paymentMethod: "COD" }, { paymentStatus: "PAID" }] } }),
    db.order.count({ where: { status: "SHIPPED" } }),
    db.order.count({ where: { status: "PLACED", paymentMethod: { not: "COD" }, paymentStatus: { in: ["PENDING", "FAILED"] } } }),
    db.variant.findMany({ where: { stock: { lt: 15 }, product: { active: true } }, include: { product: { select: { name: true, id: true } } }, orderBy: { stock: "asc" } }),
    db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: since }, status: { not: "CANCELLED" }, OR: [{ paymentMethod: "COD" }, { paymentStatus: "PAID" }] } }),
  ]);
  return { today, toPack, shipped, awaitingPayment, lowStock, revenue24h: revenue._sum.total ?? 0 };
}
