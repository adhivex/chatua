import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductImage } from "@/components/shop/ProductImage";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { Accordion } from "@/components/ui/Accordion";
import { LeafIcon, LockIcon, NoPreservativesIcon, NutritionIcon, ReturnIcon, TruckIcon } from "@/components/ui/icons";
import { TrustRow } from "@/components/ui/TrustRow";
import { siteUrl } from "@/lib/site";
import { getProductBySlug, getProducts } from "@/server/products";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Product not found" };
  const from = Math.min(...p.variants.map((v) => v.price));
  return {
    title: p.name,
    description: `${p.shortDesc} From ₹${from}. ${p.longDesc}`.slice(0, 160),
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { title: `${p.name} · Chatua`, description: p.shortDesc, url: `/shop/${p.slug}`, images: p.images[0] ? [{ url: p.images[0].src, alt: p.images[0].alt }] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();

  const url = `${siteUrl()}/shop/${p.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.longDesc,
    category: p.category,
    brand: { "@type": "Brand", name: "Chatua" },
    url,
    image: p.images.map((i) => (i.src.startsWith("http") ? i.src : `${siteUrl()}${i.src}`)),
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      name: `${p.name} ${v.size}`,
      price: v.price,
      priceCurrency: "INR",
      availability: v.maxQty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    })),
  };

  const slides = p.images.length ? p.images.slice(0, 5) : [null, null, null];
  return (
    <main id="main" className="app-main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductGallery productId={p.id} name={p.name} bestseller={p.bestseller}>
        {slides.map((img, i) => (
          <ProductImage key={i} image={img} product={p} variant={i} sizes="(max-width: 460px) 100vw, 460px" priority={i === 0} className="h-full" />
        ))}
      </ProductGallery>
      <div className="relative z-[3] -mt-[22px] rounded-t-sheet bg-paper px-5 pb-6 pt-7 shadow-[0_-14px_30px_-14px_rgba(34,19,10,.45)]">
        <h1 className="font-head text-[31px] font-semibold tracking-[-.8px]">{p.name}</h1>
        <p className="mb-3.5 mt-1 text-sm text-muted">{p.shortDesc}</p>
        <TrustRow
          items={[
            { icon: <LeafIcon />, label: ["100%", "Natural"] },
            { icon: <NutritionIcon />, label: ["Rich in", "Nutrition"] },
            { icon: <NoPreservativesIcon />, label: ["No Added", "Preservatives"] },
          ]}
        />
        <ProductPurchase product={{ id: p.id, name: p.name, variants: p.variants }} />
        <TrustRow
          className="mt-3.5"
          items={[
            { icon: <TruckIcon />, label: ["Pan India", "Delivery"] },
            { icon: <LockIcon />, label: ["Secure", "Payment"] },
            { icon: <ReturnIcon />, label: ["Easy", "Returns"] },
          ]}
        />
        <Accordion title="Product Details" defaultOpen>
          <p>{p.longDesc}</p>
        </Accordion>
        {p.howToEnjoy && (
          <Accordion title="How to enjoy">
            <p>{p.howToEnjoy}</p>
          </Accordion>
        )}
        {p.storage && (
          <Accordion title="Storage">
            <p>{p.storage}</p>
          </Accordion>
        )}
      </div>
    </main>
  );
}
