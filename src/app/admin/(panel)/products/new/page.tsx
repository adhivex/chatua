import Link from "next/link";
import { ActionForm, inputCls, labelCls, Submit } from "@/components/admin/ActionForm";
import { ProductFields } from "@/components/admin/ProductFields";
import { createProduct } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { SIZES } from "@/lib/validators";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  const categories = (await db.product.findMany({ distinct: ["category"], select: { category: true } })).map((c) => c.category);
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-clay">
        ← All products
      </Link>
      <h1 className="mt-2 font-head text-3xl font-semibold">Add product</h1>
      <ActionForm action={createProduct} className="mt-5 rounded-card bg-card p-4 shadow-soft">
        <ProductFields categories={categories} />
        <div className="mt-3">
          <label className={labelCls} htmlFor="slug">Web address (optional, made from the name)</label>
          <input id="slug" name="slug" maxLength={60} placeholder="e.g. ragi-chatua" className={inputCls} />
        </div>
        <h2 className="mb-2 mt-5 font-head text-lg font-semibold">Sizes, prices and stock</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SIZES.map((s) => (
            <fieldset key={s} className="rounded-xl border border-line p-3">
              <legend className="px-1 text-sm font-semibold">{s}</legend>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls} htmlFor={`price_${s}`}>Price (₹)</label>
                  <input id={`price_${s}`} name={`price_${s}`} type="number" min={1} step={1} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`stock_${s}`}>In stock</label>
                  <input id={`stock_${s}`} name={`stock_${s}`} type="number" min={0} step={1} required defaultValue={0} className={inputCls} />
                </div>
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-4">
          <Submit>Create product</Submit>
        </div>
      </ActionForm>
    </>
  );
}
