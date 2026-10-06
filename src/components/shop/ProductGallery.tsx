"use client";

import { useRouter } from "next/navigation";
import { Children, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { BackIcon, HeartIcon, ShareIcon } from "@/components/ui/icons";
import { useFavourites, useToast } from "@/store/ui";

/** Full-bleed scroll-snap gallery with dots and floating back / favourite / share buttons. */
export function ProductGallery({ productId, name, bestseller, children }: { productId: string; name: string; bestseller: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const fav = useFavourites((s) => s.ids.includes(productId));
  const toggle = useFavourites((s) => s.toggle);
  const toast = useToast((s) => s.show);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `${name} – Chatua, Odisha's Traditional Food`, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Could not copy the link");
    }
  }

  const float = "grid size-11 place-items-center rounded-full bg-[rgba(40,25,15,.55)] text-white backdrop-blur-md";
  return (
    <div className="relative h-[340px] bg-espresso">
      <div
        ref={track}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        aria-label={`${name} photos`}
        role="region"
        tabIndex={0}
      >
        {slides.map((s, i) => (
          <div key={i} className="h-full flex-[0_0_100%] snap-center" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
            {s}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(34,19,10,.45)_0,transparent_24%)]" />
      <button type="button" aria-label="Back" className={cn(float, "absolute left-3.5 top-[calc(12px+env(safe-area-inset-top))] z-[4]")} onClick={() => (window.history.length > 1 ? router.back() : router.push("/shop"))}>
        <BackIcon />
      </button>
      <div className="absolute right-3.5 top-[calc(12px+env(safe-area-inset-top))] z-[4] flex gap-2">
        <button
          type="button"
          aria-label={fav ? "Remove from favourites" : "Save to favourites"}
          aria-pressed={fav}
          className={cn(float, fav && "text-[#ff8a6a]")}
          onClick={() => toast(toggle(productId) ? "Saved to favourites" : "Removed from favourites")}
        >
          <HeartIcon fill={fav ? "currentColor" : "none"} />
        </button>
        <button type="button" aria-label="Share" className={float} onClick={share}>
          <ShareIcon />
        </button>
      </div>
      {bestseller && (
        <span className="absolute bottom-[30px] left-3.5 z-[4] rounded-[7px] bg-[image:var(--grad-gold)] px-[9px] py-1 text-[11px] font-bold tracking-[.2px] text-espresso">Bestseller</span>
      )}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-[34px] z-[4] flex justify-center gap-[5px]" aria-hidden="true">
          {slides.map((_, i) => (
            <i key={i} className={cn("h-1.5 rounded-[3px] transition-all", i === index ? "w-4 bg-gold" : "w-1.5 bg-white/55")} />
          ))}
        </div>
      )}
    </div>
  );
}
