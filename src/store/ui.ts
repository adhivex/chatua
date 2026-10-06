"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Selected size per product, shared by Home, Shop and Product (prototype S.sel). */
export const useSizes = create<{ sizes: Record<string, string>; setSize: (productId: string, size: string) => void }>()((set) => ({
  sizes: {},
  setSize: (productId, size) => set((s) => ({ sizes: { ...s.sizes, [productId]: size } })),
}));

type ToastState = { message: string | null; id: number; show: (message: string) => void; hide: () => void };
export const useToast = create<ToastState>()((set) => ({
  message: null,
  id: 0,
  show: (message) => set((s) => ({ message, id: s.id + 1 })),
  hide: () => set({ message: null }),
}));

/** Favourites are local to the device in v1. */
export const useFavourites = create<{ ids: string[]; toggle: (id: string) => boolean }>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const on = !get().ids.includes(id);
        set({ ids: on ? [...get().ids, id] : get().ids.filter((x) => x !== id) });
        return on;
      },
    }),
    { name: "chatua-favourites", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
