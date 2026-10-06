"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useToast } from "@/store/ui";

export function Toast() {
  const { message, id, hide } = useToast();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 1900);
    return () => clearTimeout(t);
  }, [message, id, hide]);
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "shell-fixed pointer-events-none bottom-[calc(var(--nav-h)+var(--cta-h)+16px)] z-50 flex justify-center px-4 transition-all duration-200",
        message ? "opacity-100" : "translate-y-5 opacity-0",
      )}
    >
      {message && (
        <span key={id} className="rounded-3xl border border-[rgba(200,160,90,.55)] bg-espresso px-[18px] py-[11px] text-[13.5px] text-ivory shadow-lift">
          {message}
        </span>
      )}
    </div>
  );
}
