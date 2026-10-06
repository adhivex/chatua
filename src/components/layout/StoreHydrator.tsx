"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useFavourites } from "@/store/ui";

/** Loads the device cart and favourites after the first render (avoids SSR mismatches). */
export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useFavourites.persist.rehydrate();
    const sync = (e: StorageEvent) => {
      if (e.key === "chatua-cart") void useCart.persist.rehydrate();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return null;
}
