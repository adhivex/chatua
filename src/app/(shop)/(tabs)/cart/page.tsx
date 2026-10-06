import type { Metadata } from "next";
import { BackBar } from "@/components/layout/BackBar";
import { CartView } from "@/components/shop/CartView";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductImage } from "@/components/shop/ProductImage";
import { getProducts } from "@/server/products";

export const revalidate = 300;
export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default async function CartPage() {
  const products = await getProducts();
  return (
    <main id="main" className="app-main">
      <BackBar title="Your Cart" fallback="/shop" />
      <CartView
        catalog={products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, variants: p.variants }))}
        thumbs={Object.fromEntries(products.map((p) => [p.id, <ProductImage key={p.id} image={p.images[0]} product={p} sizes="78px" className="size-[78px] rounded-xl" decorative />]))}
        cards={Object.fromEntries(products.map((p) => [p.id, <ProductCard key={p.id} product={p} className="flex-[0_0_46%]" />]))}
      />
    </main>
  );
}
