"use client";

import { useEffect, useRef } from "react";
import { formatINR } from "@/lib/money";

/** Test-mode payment sheet that stands in for Razorpay Checkout (PAYMENT_PROVIDER=mock). */
export function MockPaymentSheet({ amount, method, onResult }: { amount: number; method: string; onResult: (outcome: "success" | "failure") => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="mock-title"
      onCancel={(e) => {
        e.preventDefault();
        onResult("failure");
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[400px] rounded-card bg-paper p-5 text-ink shadow-lift backdrop:bg-espresso/60"
    >
      <p className="text-xs font-semibold text-clay">Test payment</p>
      <h2 id="mock-title" className="mt-1 font-head text-2xl font-semibold">
        Pay {formatINR(amount)}
      </h2>
      <p className="mt-1 text-sm text-muted">{method}. This is a simulated payment for testing; no money is taken.</p>
      <div className="mt-5 flex flex-col gap-2.5">
        <button type="button" className="btn btn-primary btn-block" onClick={() => onResult("success")}>
          Simulate successful payment
        </button>
        <button type="button" className="btn btn-line btn-block" onClick={() => onResult("failure")}>
          Simulate failed payment
        </button>
      </div>
    </dialog>
  );
}
