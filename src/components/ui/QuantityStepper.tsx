import { cn } from "@/lib/cn";
import { MinusIcon, PlusIcon } from "./icons";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: "lg" | "sm";
};

/** lg: product page (42px circles). sm: cart line (28px visual, 44px touch target). */
export function QuantityStepper({ value, onChange, min = 1, max = 20, label, size = "lg" }: Props) {
  const lg = size === "lg";
  const btn = lg
    ? "grid size-[42px] place-items-center rounded-full border-[1.5px] border-[rgba(200,160,90,.6)] bg-paper disabled:opacity-40"
    : "grid size-7 place-items-center rounded-full border border-[rgba(200,160,90,.5)] bg-clay-wash text-clay disabled:opacity-40 relative before:absolute before:-inset-2 before:content-['']";
  return (
    <div role="group" aria-label={label} className={cn("flex items-center", lg ? "justify-center gap-[26px]" : "gap-2.5")}>
      <button type="button" className={btn} aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <MinusIcon size={lg ? 18 : 14} />
      </button>
      <b className={cn("text-center tabular-nums", lg ? "min-w-5 text-xl" : "min-w-4 text-[15px]")} aria-live="polite">
        {value}
      </b>
      <button type="button" className={btn} aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <PlusIcon size={lg ? 18 : 14} />
      </button>
    </div>
  );
}
