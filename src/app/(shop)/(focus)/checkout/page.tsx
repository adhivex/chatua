import type { Metadata } from "next";
import { BackBar } from "@/components/layout/BackBar";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { paymentProvider } from "@/lib/config";
import { getProducts } from "@/server/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Delivery Details", robots: { index: false } };

export default async function CheckoutPage() {
  const products = await getProducts();
  return (
    <main id="main" className="app-main">
      <BackBar title="Delivery Details" fallback="/cart" />
      <CheckoutView catalog={products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, variants: p.variants }))} provider={paymentProvider()} />
    </main>
  );
}
