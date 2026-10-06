"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { CartIcon, SearchIcon } from "@/components/ui/icons";
import { CartBadge, useCartCount } from "./CartBadge";
import { Logo } from "./Logo";

/** Default bar (frosted, sticky) or `over` the dark hero (transparent, light logo). */
export function TopBar({ over = false }: { over?: boolean }) {
  const n = useCartCount();
  return (
    <header
      className={cn(
        "z-20 flex items-center justify-between px-5 py-3",
        over ? "absolute inset-x-0 top-0 pt-[calc(12px+env(safe-area-inset-top))] text-ivory" : "frosted hairline-b sticky top-0 pt-[calc(12px+env(safe-area-inset-top))]",
      )}
    >
      <Link href="/" aria-label="Chatua home" className="rounded-md">
        <Logo light={over} />
      </Link>
      <div className="flex gap-1.5">
        <Link href="/shop?focus=1" aria-label="Search" className={cn("grid size-11 place-items-center rounded-full", over ? "active:bg-white/10" : "active:bg-sand")}>
          <SearchIcon />
        </Link>
        <Link
          href="/cart"
          aria-label={n ? `Cart, ${n} item${n > 1 ? "s" : ""}` : "Cart"}
          className={cn("relative grid size-11 place-items-center rounded-full", over ? "active:bg-white/10" : "active:bg-sand")}
        >
          <CartIcon />
          <CartBadge className="right-0.5 top-1" />
        </Link>
      </div>
    </header>
  );
}
