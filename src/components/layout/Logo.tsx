import { cn } from "@/lib/cn";
import { Sprig } from "@/components/shop/art";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex flex-col items-start leading-none">
      <Sprig className="-mb-0.5 ml-4 h-3.5" />
      <span className={cn("font-head text-[22px] font-semibold tracking-[3.5px]", light ? "text-ivory" : "text-ink")}>CHATUA</span>
      <span className={cn("mt-[3px] text-[8.5px] font-semibold tracking-[.7px]", light ? "text-gold-light" : "text-clay")}>Odisha&apos;s Traditional Food</span>
    </span>
  );
}
