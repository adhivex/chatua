"use client";

import { cn } from "@/lib/cn";
import { cartCount, useCart } from "@/store/cart";

export function useCartCount() {
  return useCart((s) => cartCount(s.lines));
}

export function CartBadge({ className }: { className?: string }) {
  const n = useCartCount();
  if (!n) return null;
  return (
    <span className={cn("absolute grid h-[17px] min-w-[17px] place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white", className)} aria-hidden="true">
      {n > 99 ? "99+" : n}
    </span>
  );
}
