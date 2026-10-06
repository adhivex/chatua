import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { imageSrc } from "@/lib/storage";
import { MAX_QTY } from "@/lib/validators";
import type { ProductDTO } from "@/lib/types";

const include = {
  variants: { orderBy: { grams: "asc" } },
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

export function toProductDTO(p: ProductRow): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    shortDesc: p.shortDesc,
    longDesc: p.longDesc,
    howToEnjoy: p.howToEnjoy,
    storage: p.storage,
    bestseller: p.bestseller,
    variants: p.variants.map((v) => ({ size: v.size, grams: v.grams, price: v.price, maxQty: Math.max(0, Math.min(MAX_QTY, v.stock)) })),
    images: p.images.flatMap((i) => {
      const src = imageSrc(i.publicId);
      return src ? [{ src, alt: i.alt }] : [];
    }),
  };
}

/** Active products in display order (deduplicated per request). */
export const getProducts = cache(async (): Promise<ProductDTO[]> => {
  const rows = await db.product.findMany({ where: { active: true }, include, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return rows.map(toProductDTO);
});

export const getProductBySlug = cache(async (slug: string): Promise<ProductDTO | null> => {
  const row = await db.product.findFirst({ where: { slug, active: true }, include });
  return row ? toProductDTO(row) : null;
});

/** Category chips: "All" plus categories that have active products, in product order. */
export function categoriesOf(products: ProductDTO[]): string[] {
  return ["All", ...new Set(products.map((p) => p.category))];
}
