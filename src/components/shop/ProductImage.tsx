import Image from "next/image";
import { cn } from "@/lib/cn";
import { artFor, seedFrom } from "@/lib/placeholder";
import type { ImageDTO } from "@/lib/types";
import { MoundArt } from "./art";

type Props = {
  image?: ImageDTO | null;
  /** Used for the fallback illustration when there is no photo. */
  product: { slug: string; category: string; name: string };
  variant?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Decorative when a nearby heading already names the product. */
  decorative?: boolean;
};

/** Product photo with the warm vignette overlay, or the drawn placeholder when there is none. */
export function ProductImage({ image, product, variant = 0, sizes, priority, className, decorative }: Props) {
  if (image) {
    return (
      <div className={cn("photo-overlay relative overflow-hidden bg-espresso", className)}>
        <Image src={image.src} alt={decorative ? "" : image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const art = artFor(product.category);
  return (
    <div className={cn("relative overflow-hidden bg-espresso", className)}>
      <MoundArt
        tone={art.tone}
        extra={art.extra}
        seed={seedFrom(product.slug) + variant * 5}
        className="absolute inset-0 h-full w-full"
        label={decorative ? undefined : `${product.name} illustration`}
      />
    </div>
  );
}
