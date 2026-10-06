import { cn } from "@/lib/cn";

export function Chip({ active, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "min-h-10 flex-none rounded-full border px-[18px] py-2 text-[13px] font-medium",
        active ? "border-espresso bg-espresso font-semibold text-gold-light" : "border-line bg-transparent text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function ChipRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3.5 pt-0.5">
      {children}
    </div>
  );
}
