"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_LINES, MAX_QTY } from "@/lib/validators";

export type CartLine = { productId: string; size: string; qty: number };

type CartState = {
  lines: CartLine[];
  add: (productId: string, size: string, qty?: number) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
  /** Drops lines whose product or size no longer exists, and caps quantities. */
  prune: (valid: (l: CartLine) => number) => void;
};

const same = (l: CartLine, productId: string, size: string) => l.productId === productId && l.size === size;
const clamp = (n: number) => Math.max(0, Math.min(MAX_QTY, Math.floor(n)));

/** Pure reducer helpers (unit-tested). */
export function addLine(lines: CartLine[], productId: string, size: string, qty = 1): CartLine[] {
  const found = lines.find((l) => same(l, productId, size));
  if (found) return lines.map((l) => (l === found ? { ...l, qty: clamp(l.qty + qty) || 1 } : l));
  if (lines.length >= MAX_LINES) return lines;
  return [...lines, { productId, size, qty: clamp(qty) || 1 }];
}

export function setLineQty(lines: CartLine[], productId: string, size: string, qty: number): CartLine[] {
  const q = clamp(qty);
  return q < 1 ? lines.filter((l) => !same(l, productId, size)) : lines.map((l) => (same(l, productId, size) ? { ...l, qty: q } : l));
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, size, qty = 1) => set((s) => ({ lines: addLine(s.lines, productId, size, qty) })),
      setQty: (productId, size, qty) => set((s) => ({ lines: setLineQty(s.lines, productId, size, qty) })),
      remove: (productId, size) => set((s) => ({ lines: s.lines.filter((l) => !same(l, productId, size)) })),
      clear: () => set({ lines: [] }),
      prune: (valid) =>
        set((s) => {
          const next = s.lines.flatMap((l) => {
            const max = valid(l);
            return max < 1 ? [] : [{ ...l, qty: Math.min(l.qty, max) }];
          });
          const changed = next.length !== s.lines.length || next.some((l, i) => l.qty !== s.lines[i]?.qty);
          return changed ? { lines: next } : s;
        }),
    }),
    {
      name: "chatua-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ lines: s.lines }),
      // Defensive: storage is user-editable.
      merge: (persisted, current) => {
        const raw = (persisted as { lines?: unknown })?.lines;
        const lines = Array.isArray(raw)
          ? raw
              .filter((l): l is CartLine => !!l && typeof l.productId === "string" && typeof l.size === "string" && Number.isFinite(l.qty))
              .map((l) => ({ productId: l.productId, size: l.size, qty: clamp(l.qty) || 1 }))
              .slice(0, MAX_LINES)
          : [];
        return { ...current, lines };
      },
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((a, l) => a + l.qty, 0);

/** True once the saved cart has been read from this device. */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useCart.persist.onFinishHydration(cb),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
