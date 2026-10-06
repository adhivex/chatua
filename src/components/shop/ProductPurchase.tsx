"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "@/store/cart";
import { useSizes, useToast } from "@/store/ui";
import { type ProductLite, useSelectedVariant } from "./ProductControls";

/** Choose Size, quantity and "Add to Cart | ₹total". */
export function ProductPurchase({ product }: { product: ProductLite }) {
  const v = useSelectedVariant(product);
  const setSize = useSizes((s) => s.setSize);
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.show);
  const [qty, setQty] = useState(1);
  const max = Math.max(1, v?.maxQty ?? 1);
  const soldOut = !v || v.maxQty === 0;
  const q = Math.min(qty, max);

  return (
    <>
      <h2 className="mt-1.5 font-head text-base font-semibold">Choose Size</h2>
      <div role="radiogroup" aria-label="Choose size" className="mb-4 mt-2.5 grid grid-cols-2 gap-2.5">
        {product.variants.map((x) => {
          const on = x.size === v?.size;
          return (
            <button
              key={x.size}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSize(product.id, x.size)}
              className={cn("min-h-11 rounded-[15px] border-[1.5px] border-line bg-card p-3 text-center", on && "is-selected")}
            >
              <b className={cn("block font-head text-[17px] font-semibold", on && "text-clay-dark")}>{x.size}</b>
              <span className={cn("text-[13px]", on ? "text-clay-dark" : "text-muted")}>{x.maxQty === 0 ? "Sold out" : formatINR(x.price)}</span>
            </button>
          );
        })}
      </div>
      <div className="mb-4">
        <QuantityStepper value={q} onChange={setQty} max={max} label="Quantity" />
      </div>
      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={soldOut}
        onClick={() => {
          if (!v) return;
          add(product.id, v.size, q);
          setQty(1);
          toast(`${product.name} added to cart`);
        }}
      >
        {soldOut ? "Sold out" : <>Add to Cart &nbsp;|&nbsp; {formatINR(v.price * q)}</>}
      </button>
    </>
  );
}
