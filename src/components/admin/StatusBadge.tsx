import { cn } from "@/lib/cn";

const TONE: Record<string, string> = {
  PLACED: "bg-gold-tint text-clay-dark",
  PACKED: "bg-clay-soft text-clay-dark",
  SHIPPED: "bg-[#e3ecf7] text-[#24496e]",
  DELIVERED: "bg-[#e3f2e7] text-leaf",
  CANCELLED: "bg-sand text-muted",
  PAID: "bg-[#e3f2e7] text-leaf",
  COD: "bg-gold-tint text-clay-dark",
  PENDING: "bg-sand text-muted",
  FAILED: "bg-[#f8e1dc] text-danger",
  REFUNDED: "bg-sand text-muted",
};

const LABEL: Record<string, string> = { COD: "Cash on delivery" };

export function StatusBadge({ value }: { value: string }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE[value] ?? "bg-sand")}>{LABEL[value] ?? value.charAt(0) + value.slice(1).toLowerCase()}</span>;
}
