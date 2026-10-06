import { cn } from "@/lib/cn";

export type TrustItem = { icon: React.ReactNode; label: [string, string] };

/** Icons in gold-bordered circles with two-line captions. */
export function TrustRow({ items, className }: { items: TrustItem[]; className?: string }) {
  return (
    <ul className={cn("grid gap-1 pb-3.5 pt-0.5 text-center", items.length === 4 ? "grid-cols-4" : "grid-cols-3", className)}>
      {items.map((it) => (
        <li key={it.label.join(" ")} className="flex flex-col items-center gap-1.5 text-[11px] font-medium leading-tight tracking-[.1px] text-muted">
          <span className="grid size-[42px] place-items-center rounded-full border border-gold bg-gold-wash text-clay">{it.icon}</span>
          <span>
            {it.label[0]}
            <br />
            {it.label[1]}
          </span>
        </li>
      ))}
    </ul>
  );
}
