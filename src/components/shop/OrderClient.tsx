"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ArrowIcon, CopyIcon } from "@/components/ui/icons";
import { useToast } from "@/store/ui";

export function CopyOrderId({ id }: { id: string }) {
  const toast = useToast((s) => s.show);
  return (
    <button
      type="button"
      aria-label="Copy order ID"
      className="grid size-11 place-items-center rounded-full active:bg-sand"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(id);
          toast("Order ID copied");
        } catch {
          toast("Could not copy. Long-press the ID to copy it.");
        }
      }}
    >
      <CopyIcon />
    </button>
  );
}

export function Confetti() {
  const cols = ["#e8662b", "#f2b134", "#2f8f4e", "#3b82c4"];
  return (
    <div className="confetti pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ left: `${6 + i * 6}%`, top: `${10 + ((i * 13) % 30)}px`, background: cols[i % 4], animationDelay: `${(i % 6) * 0.12}s` }} />
      ))}
    </div>
  );
}

export function TrackOrder({ steps, open: initial = false }: { steps: { title: string; sub: string; done: boolean }[]; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <>
      <button type="button" className="btn btn-line btn-block" aria-expanded={open} aria-controls="order-timeline" onClick={() => setOpen((o) => !o)}>
        Track Order <ArrowIcon className={cn("transition-transform", open && "rotate-90")} />
      </button>
      <div id="order-timeline" hidden={!open} className="mt-4 text-left">
        <h2 className="mb-3 font-head text-[21px] font-semibold tracking-[-.3px]">Order status</h2>
        <ol>
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-3 pb-3.5 text-[13.5px]">
              {i < steps.length - 1 && <span className={cn("absolute bottom-0 left-[7px] top-[18px] w-0.5", s.done && steps[i + 1]?.done ? "bg-leaf" : "bg-line")} />}
              <span className={cn("mt-px size-4 flex-none rounded-full", s.done ? "bg-leaf" : "bg-line")} aria-hidden="true" />
              <div>
                <b>{s.title}</b>
                <span className="sr-only">{s.done ? " (done)" : " (pending)"}</span>
                {s.sub && <span className="block text-muted">{s.sub}</span>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

/** While an online payment is being confirmed (webhook), refresh the page a few times. */
export function PaymentPoller({ orderNumber, token }: { orderNumber: string; token: string }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(async () => {
      n++;
      const res = await fetch(`/api/orders/${orderNumber}?t=${encodeURIComponent(token)}`).catch(() => null);
      const data = (await res?.json().catch(() => null)) as { paymentStatus?: string } | null;
      if ((data && data.paymentStatus !== "PENDING") || n >= 20) {
        clearInterval(t);
        router.refresh();
      }
    }, 3000);
    return () => clearInterval(t);
  }, [orderNumber, token, router]);
  return null;
}
