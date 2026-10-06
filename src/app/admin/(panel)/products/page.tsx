import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await db.product.findMany({ include: { variants: { orderBy: { grams: "asc" } }, _count: { select: { images: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-head text-3xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary min-h-10 px-4 py-2 text-sm">
          Add product
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-card bg-card shadow-soft">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Sizes: price · stock</th>
              <th className="p-3">Photos</th>
              <th className="p-3">Shop</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-selected">
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="font-semibold text-clay underline-offset-2 hover:underline">
                    {p.name}
                  </Link>
                  {p.bestseller && <span className="ml-2 text-xs text-muted">Bestseller</span>}
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">
                  {p.variants.map((v) => (
                    <span key={v.id} className="mr-3 inline-block whitespace-nowrap">
                      {v.size}: {formatINR(v.price)} · <b className={v.stock < 15 ? "text-danger" : ""}>{v.stock}</b>
                    </span>
                  ))}
                </td>
                <td className="p-3">{p._count.images || "Placeholder"}</td>
                <td className="p-3"><span className={p.active ? "font-semibold text-leaf" : "text-muted"}>{p.active ? "Visible" : "Hidden"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
