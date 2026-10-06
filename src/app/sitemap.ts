import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getProducts } from "@/server/products";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();
  const pages = ["", "/shop", "/recipes", "/about", "/heritage", "/policies"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  return [...pages, ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.9 }))];
}
