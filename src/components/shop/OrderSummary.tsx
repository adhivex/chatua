import { formatINR } from "@/lib/money";

export function OrderSummary({ itemsLabel, subtotal, delivery, total }: { itemsLabel: string; subtotal: number; delivery: number; total: number }) {
  return (
    <div className="mx-4 rounded-card bg-card p-3.5 shadow-soft">
      <dl className="text-sm">
        <div className="flex justify-between py-[5px] text-muted">
          <dt>{itemsLabel}</dt>
          <dd className="font-medium text-ink">{formatINR(subtotal)}</dd>
        </div>
        <div className="flex justify-between py-[5px] text-muted">
          <dt>Delivery</dt>
          <dd className={delivery ? "font-medium text-ink" : "font-bold text-leaf"}>{delivery ? formatINR(delivery) : "Free"}</dd>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-line pt-3 font-bold">
          <dt className="text-[15px]">Total</dt>
          <dd className="font-head text-[19px] font-semibold">{formatINR(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
