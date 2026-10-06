import { cn } from "@/lib/cn";

type Props = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  title: React.ReactNode;
  detail?: React.ReactNode;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  disabled?: boolean;
  dotPosition?: "start" | "end";
};

/** Delivery and payment options. Selected = gold border plus inset gold. */
export function RadioCard({ name, value, checked, onChange, title, detail, icon, aside, disabled, dotPosition = "start" }: Props) {
  const dot = (
    <span className={cn("grid size-5 flex-none place-items-center rounded-full border-[1.5px]", checked ? "border-clay" : "border-[#cdbfae]")} aria-hidden="true">
      {checked && <span className="size-2.5 rounded-full bg-clay" />}
    </span>
  );
  return (
    <label
      className={cn(
        "mb-2.5 flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card px-3.5 py-[13px] text-left has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-clay",
        checked && "is-selected",
        disabled && "cursor-not-allowed opacity-55",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} className="sr-only" />
      {dotPosition === "start" && dot}
      {icon && <span className="text-ink">{icon}</span>}
      <span className="flex-1 text-sm">
        <b className="block text-[14.5px] font-semibold">{title}</b>
        {detail && <small className="text-[12.5px] text-muted">{detail}</small>}
      </span>
      {aside}
      {dotPosition === "end" && dot}
    </label>
  );
}
