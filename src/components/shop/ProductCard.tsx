import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/types";
import { AddButton, SelectedPrice, SelectedSize, SizePills } from "./ProductControls";
import { ProductImage } from "./ProductImage";

const lite = (p: ProductDTO) => ({ id: p.id, name: p.name, variants: p.variants });

/** Grid card: image, name, selected size, price, round + button. */
export function ProductCard({ product, className, priority }: { product: ProductDTO; className?: string; priority?: boolean }) {
  return (
    <article className={cn("relative overflow-hidden rounded-card bg-card shadow-soft", className)}>
      <Link href={`/shop/${product.slug}`} className="block rounded-t-card">
        <ProductImage image={product.images[0]} product={product} sizes="(max-width: 460px) 50vw, 230px" className="h-[130px]" decorative priority={priority} />
        <div className="px-3.5 pb-3.5 pt-3">
          <h3 className="pr-1 font-head text-[15.5px] font-semibold leading-tight tracking-[-.1px]">{product.name}</h3>
          <small className="text-xs tracking-[.2px] text-muted">
            <SelectedSize product={lite(product)} />
          </small>
          <SelectedPrice product={lite(product)} className="mt-2.5 pr-10" />
        </div>
      </Link>
      <AddButton product={lite(product)} className="bottom-2.5 right-2.5" />
    </article>
  );
}

/** List row on the Shop screen with size pills. */
export function ProductRow({ product, priority }: { product: ProductDTO; priority?: boolean }) {
  return (
    <article className="relative flex overflow-hidden rounded-card bg-card text-left shadow-soft">
      <Link href={`/shop/${product.slug}`} aria-label={product.name} className="w-[118px] flex-none self-stretch">
        <ProductImage image={product.images[0]} product={product} sizes="118px" className="h-full min-h-32" decorative priority={priority} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col px-3 py-[11px]">
        <Link href={`/shop/${product.slug}`} className="rounded-md">
          <h2 className="font-head text-[17px] font-semibold tracking-[-.2px]">{product.name}</h2>
          <p className="mt-0.5 text-xs leading-[1.35] text-muted">{product.shortDesc}</p>
        </Link>
        <SizePills product={lite(product)} />
        <SelectedPrice product={lite(product)} className="mt-auto pr-12 pt-2" />
      </div>
      <AddButton product={lite(product)} size={38} className="bottom-3 right-3" />
    </article>
  );
}

