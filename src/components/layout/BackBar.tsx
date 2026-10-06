"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/ui/icons";

/** Sticky title bar with a back button. Falls back to `fallback` when there is no history. */
export function BackBar({ title, fallback = "/", back = true, children }: { title: string; fallback?: string; back?: boolean; children?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="frosted hairline-b sticky top-0 z-20 flex items-center gap-2 px-3.5 py-3 pt-[calc(12px+env(safe-area-inset-top))]">
      {back ? (
        <button
          type="button"
          aria-label="Back"
          className="-ml-1 grid size-11 place-items-center rounded-full active:bg-sand"
          onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
        >
          <BackIcon />
        </button>
      ) : (
        <span className="w-1.5" />
      )}
      <h1 className="font-head text-[21px] font-semibold tracking-[-.2px]">{title}</h1>
      {children && <div className="ml-auto">{children}</div>}
    </header>
  );
}
