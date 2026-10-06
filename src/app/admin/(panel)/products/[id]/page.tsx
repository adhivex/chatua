import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, inputCls, labelCls, Submit } from "@/components/admin/ActionForm";
import { ProductFields } from "@/components/admin/ProductFields";
import { deleteProductImage, moveProductImage, updateProduct, uploadProductImage } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { imageSrc, uploadsConfigured } from "@/lib/storage";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const p = await db.product.findUnique({ where: { id: (await params).id }, include: { variants: { orderBy: { grams: "asc" } }, images: { orderBy: { position: "asc" } } } });
  if (!p) notFound();
  const sp = await searchParams;
  const created = sp.created === "1";
  const removed = sp.removed === "1";
  const categories = (await db.product.findMany({ distinct: ["category"], select: { category: true } })).map((c) => c.category);

  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-clay">
        ← All products
      </Link>
      <div className="mt-2 flex flex-wrap items-baseline gap-3">
        <h1 className="font-head text-3xl font-semibold">{p.name}</h1>
        <Link href={`/shop/${p.slug}`} target="_blank" className="text-sm text-clay">
          /shop/{p.slug} ↗
        </Link>
      </div>
      {created && <p className="mt-2 text-sm font-semibold text-leaf">Product created. Add photos below.</p>}
      {removed && (
        <p role="status" className="mt-2 text-sm font-semibold text-leaf">
          Photo removed.
        </p>
      )}

      <ActionForm action={updateProduct} className="mt-5 rounded-card bg-card p-4 shadow-soft">
        <input type="hidden" name="id" value={p.id} />
        <ProductFields p={p} categories={categories} />
        <h2 className="mb-2 mt-5 font-head text-lg font-semibold">Sizes, prices and stock</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {p.variants.map((v) => (
            <fieldset key={v.id} className="rounded-xl border border-line p-3">
              <legend className="px-1 text-sm font-semibold">
                {v.size} <span className="font-normal text-muted">({v.sku})</span>
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls} htmlFor={`price_${v.id}`}>Price (₹)</label>
                  <input id={`price_${v.id}`} name={`price_${v.id}`} type="number" min={1} step={1} required defaultValue={v.price} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`stock_${v.id}`}>In stock</label>
                  <input id={`stock_${v.id}`} name={`stock_${v.id}`} type="number" min={0} step={1} required defaultValue={v.stock} className={inputCls} />
                </div>
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-4">
          <Submit>Save changes</Submit>
        </div>
      </ActionForm>

      <section className="mt-6 rounded-card bg-card p-4 shadow-soft">
        <h2 className="font-head text-lg font-semibold">Photos</h2>
        <p className="mt-1 text-xs text-muted">Square photos (1:1) in warm light work best. The first photo is used on cards. With no photos the shop shows the drawn illustration.</p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {p.images.map((img, i) => {
            const src = imageSrc(img.publicId);
            return (
              <li key={img.id} className="rounded-xl border border-line p-2 text-xs">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-sand">{src ? <Image src={src} alt={img.alt} fill sizes="200px" className="object-cover" /> : <span className="p-2">Not available</span>}</div>
                <p className="mt-1 line-clamp-2 text-muted">{img.alt}</p>
                <div className="mt-1 flex gap-1">
                  {i > 0 && (
                    <ActionForm action={moveProductImage}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="dir" value="up" />
                      <Submit variant="line" className="min-h-8 px-2 py-1 text-xs">←</Submit>
                    </ActionForm>
                  )}
                  {i < p.images.length - 1 && (
                    <ActionForm action={moveProductImage}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="dir" value="down" />
                      <Submit variant="line" className="min-h-8 px-2 py-1 text-xs">→</Submit>
                    </ActionForm>
                  )}
                  <ActionForm action={deleteProductImage} className="ml-auto">
                    <input type="hidden" name="imageId" value={img.id} />
                    <Submit variant="danger" className="min-h-8 px-2 py-1 text-xs">Remove</Submit>
                  </ActionForm>
                </div>
              </li>
            );
          })}
        </ul>
        {uploadsConfigured() ? (
          <ActionForm action={uploadProductImage} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <input type="hidden" name="id" value={p.id} />
            <div>
              <label className={labelCls} htmlFor="file">Photo (JPG, PNG, WebP, max 5 MB)</label>
              <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="text-sm" />
            </div>
            <div>
              <label className={labelCls} htmlFor="alt">Describe the photo</label>
              <input id="alt" name="alt" required maxLength={160} placeholder={`${p.name} in a wooden bowl`} className={inputCls} />
            </div>
            <Submit>Upload</Submit>
          </ActionForm>
        ) : (
          <p className="mt-3 text-sm text-muted">Photo uploads need SUPABASE_URL and SUPABASE_SECRET_KEY on the server.</p>
        )}
      </section>
    </>
  );
}
