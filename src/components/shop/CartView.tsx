"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { amountForFreeDelivery, deliveryFee } from "@/lib/delivery";
import { formatINR } from "@/lib/money";
import type { VariantDTO } from "@/lib/types";
import { useCart, useCartHydrated } from "@/store/cart";
import { ArrowIcon, CartIcon, TrashIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { StickyCta } from "@/components/ui/StickyCta";
import { OrderSummary } from "./OrderSummary";

export type CatalogItem = { id: string; slug: string; name: string; variants: VariantDTO[] };

/** Joins the device cart with current catalogue prices (display only; checkout re-prices on the server). */
export function useCartLines(catalog: CatalogItem[]) {
  const lines = useCart((s) => s.lines);
  const prune = useCart((s) => s.prune);
  const hydrated = useCartHydrated();

  useEffect(() => {
    if (!hydrated) return;
    prune((l) => catalog.find((p) => p.id === l.productId)?.variants.find((v) => v.size === l.size)?.maxQty ?? 0);
  }, [hydrated, catalog, prune]);

  return useMemo(() => {
    const rows = lines.flatMap((l) => {
      const p = catalog.find((x) => x.id === l.productId);
      const v = p?.variants.find((x) => x.size === l.size);
      return p && v ? [{ ...l, product: p, variant: v, lineTotal: v.price * l.qty }] : [];
    });
    const subtotal = rows.reduce((a, r) => a + r.lineTotal, 0);
    const count = rows.reduce((a, r) => a + r.qty, 0);
    return { hydrated, rows, subtotal, count };
  }, [lines, catalog, hydrated]);
}

export function CartView({ catalog, thumbs, cards }: { catalog: CatalogItem[]; thumbs: Record<string, React.ReactNode>; cards: Record<string, React.ReactNode> }) {
  const { hydrated, rows, subtotal, count } = useCartLines(catalog);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  if (!hydrated) return <ListSkeleton rows={2} className="pt-4" />;

  if (!rows.length) {
    return (
      <div className="px-6 py-[50px] text-center text-muted">
        <CartIcon size={46} className="mx-auto" />
        <h2 className="mb-1.5 mt-3.5 font-head text-xl font-semibold text-ink">Your cart is empty</h2>
        <p>Add a pack of Chatua to get started.</p>
        <Link href="/shop" className="btn btn-primary mt-[18px]">
          Shop Chatua
        </Link>
      </div>
    );
  }

  const need = amountForFreeDelivery(subtotal);
  const fee = deliveryFee(subtotal, "STANDARD");
  const inCart = new Set(rows.map((r) => r.productId));
  const more = catalog.filter((p) => !inCart.has(p.id));

  return (
    <>
      <ul className="pt-3.5">
        {rows.map((r) => (
          <li key={`${r.productId}:${r.size}`} className="relative mx-4 mb-2.5 flex gap-3 rounded-card bg-card p-2 shadow-soft">
            <Link href={`/shop/${r.product.slug}`} className="flex-none overflow-hidden rounded-xl" aria-label={r.product.name}>
              {thumbs[r.productId]}
            </Link>
            <div className="flex flex-1 flex-col justify-between py-0.5">
              <div className="pr-9">
                <h2 className="font-head text-base font-semibold">{r.product.name}</h2>
                <small className="text-[12.5px] text-muted">{r.size}</small>
              </div>
              <div className="flex items-center justify-between pr-1">
                <span className="font-head text-xl font-semibold">{formatINR(r.lineTotal)}</span>
                <QuantityStepper
                  size="sm"
                  value={r.qty}
                  min={0}
                  max={Math.max(r.qty, r.variant.maxQty)}
                  label={`${r.product.name} ${r.size} quantity`}
                  onChange={(n) => setQty(r.productId, r.size, n)}
                />
              </div>
            </div>
            <button
              type="button"
              aria-label={`Remove ${r.product.name} ${r.size}`}
              className="absolute right-1 top-1 grid size-11 place-items-center text-muted"
              onClick={() => remove(r.productId, r.size)}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>

      {need > 0 ? (
        <p className="mx-[18px] mb-1 mt-0.5 text-[12.5px] text-muted">Add {formatINR(need)} more for free standard delivery.</p>
      ) : (
        <p className="mx-[18px] mb-1 mt-0.5 text-[12.5px] font-bold text-leaf">You get free standard delivery.</p>
      )}

      {more.length > 0 && (
        <>
          <div className="mx-4 mb-3 mt-4 flex items-center justify-between">
            <h2 className="font-head text-lg font-semibold">Add more to your cart</h2>
            <Link href="/shop" className="py-2 text-[13px] font-semibold text-clay">
              View All →
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">{more.map((p) => cards[p.id])}</div>
        </>
      )}

      <h2 className="mx-4 mb-3 mt-5 font-head text-[21px] font-semibold tracking-[-.3px]">Order Summary</h2>
      <OrderSummary itemsLabel={`${count} item${count > 1 ? "s" : ""}`} subtotal={subtotal} delivery={fee} total={subtotal + fee} />
      <div className="h-4" />

      <StickyCta>
        <Link href="/checkout" className="btn btn-primary btn-block">
          Proceed to Checkout <ArrowIcon />
        </Link>
      </StickyCta>
    </>
  );
}
