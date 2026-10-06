import { cn } from "@/lib/cn";

/** Fixed action bar above the bottom nav (or the screen edge when there is no nav). */
export function StickyCta({ children, note }: { children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "sticky-cta shell-fixed hairline-t bottom-[var(--nav-h)] z-30 bg-[rgba(255,250,241,.96)] px-4 pt-3 backdrop-blur-md",
        "pb-3 [:root:not(:has(.bottom-nav))_&]:pb-[calc(12px+env(safe-area-inset-bottom))]",
        note != null && "has-note",
      )}
    >
      {children}
      {note != null && <p className="mt-2 text-center text-[12.5px] text-muted">{note}</p>}
    </div>
  );
}
