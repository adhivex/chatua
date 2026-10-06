import type { Metadata } from "next";
import { TopBar } from "@/components/layout/TopBar";
import { ProductRow } from "@/components/shop/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { categoriesOf, getProducts } from "@/server/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop Chatua",
  description: "Classic, Multi-Grain, Jaggery and Protein Chatua in 500g and 1kg packs. Natural grain blends from Odisha, delivered across India.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <main id="main" className="app-main">
      <TopBar />
      <h1 className="sr-only">Shop Chatua</h1>
      <ShopFilters
        categories={categoriesOf(products)}
        index={products.map((p) => ({ id: p.id, category: p.category, text: `${p.name} ${p.shortDesc}`.toLowerCase() }))}
      >
        {products.map((p, i) => (
          <div key={p.id} data-product={p.id}>
            <ProductRow product={p} priority={i < 2} />
          </div>
        ))}
      </ShopFilters>
    </main>
  );
}
