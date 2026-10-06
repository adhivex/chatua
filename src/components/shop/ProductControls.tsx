"use client";

import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import type { VariantDTO } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useSizes, useToast } from "@/store/ui";
import { PlusIcon } from "@/components/ui/icons";

export type ProductLite = { id: string; name: string; variants: VariantDTO[] };

export function defaultSize(variants: VariantDTO[]): string {
  return (variants.find((v) => v.maxQty > 0) ?? variants[0])?.size ?? "500g";
}

/** The size chosen for a product anywhere in the app (defaults to the first in-stock size). */
export function useSelectedVariant(p: ProductLite): VariantDTO | undefined {
  const chosen = useSizes((s) => s.sizes[p.id]);
  return p.variants.find((v) => v.size === chosen) ?? p.variants.find((v) => v.size === defaultSize(p.variants));
}

export function SelectedSize({ product }: { product: ProductLite }) {
  return <>{useSelectedVariant(product)?.size}</>;
}

export function SelectedPrice({ product, className }: { product: ProductLite; className?: string }) {
  const v = useSelectedVariant(product);
  if (!v) return null;
  return (
    <div className={cn("font-head text-xl font-semibold", className)}>
      {formatINR(v.price)}
      {v.maxQty === 0 && <span className="ml-2 font-body text-xs font-semibold text-danger">Sold out</span>}
    </div>
  );
}

export function SizePills({ product }: { product: ProductLite }) {
  const v = useSelectedVariant(product);
  const setSize = useSizes((s) => s.setSize);
  return (
    <div role="radiogroup" aria-label={`${product.name} size`} className="mt-2 flex gap-1.5">
      {product.variants.map((x) => {
        const on = x.size === v?.size;
        return (
          <button
            key={x.size}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setSize(product.id, x.size)}
            className={cn(
              "relative rounded-[9px] border px-[11px] py-[5px] text-xs before:absolute before:-inset-x-0.5 before:-inset-y-2 before:content-['']",
              on ? "border-gold bg-gold-tint font-bold text-clay-dark" : "border-line bg-paper text-muted",
            )}
          >
            {x.size}
          </button>
        );
      })}
    </div>
  );
}

export function AddButton({ product, className, size = 34 }: { product: ProductLite; className?: string; size?: number }) {
  const v = useSelectedVariant(product);
  const add = useCart((s) => s.add);
  const show = useToast((s) => s.show);
  const soldOut = !v || v.maxQty === 0;
  return (
    <button
      type="button"
      aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} ${v?.size ?? ""} to cart`}
      disabled={soldOut}
      onClick={() => {
        if (!v) return;
        add(product.id, v.size, 1);
        show(`${product.name} added to cart`);
      }}
      className={cn("btn-plus absolute disabled:opacity-40 before:absolute before:-inset-1.5 before:content-['']", className)}
      style={{ width: size, height: size }}
    >
      <PlusIcon />
    </button>
  );
}
