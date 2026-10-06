"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BookIcon, CartIcon, HomeIcon, ShopIcon, UserIcon } from "@/components/ui/icons";
import { CartBadge } from "./CartBadge";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/shop", label: "Shop", Icon: ShopIcon },
  { href: "/recipes", label: "Recipes", Icon: BookIcon },
  { href: "/cart", label: "Cart", Icon: CartIcon },
  { href: "/account", label: "Account", Icon: UserIcon },
] as const;

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="bottom-nav shell-fixed frosted-paper hairline-t bottom-0 z-30 flex px-1 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1.5">
      {TABS.map(({ href, label, Icon }) => {
        const on = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 flex-1 flex-col items-center gap-[3px] py-1.5 text-[10.5px] font-medium text-muted",
              on && "font-bold text-clay before:absolute before:-top-[7px] before:h-0.5 before:w-6 before:rounded-sm before:bg-gold",
            )}
          >
            <Icon />
            {label}
            {href === "/cart" && <CartBadge className="right-[calc(50%-22px)] top-0" />}
          </Link>
        );
      })}
    </nav>
  );
}
