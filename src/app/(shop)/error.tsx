"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="app-main px-6 py-16 text-center">
      <h1 className="font-head text-[28px] font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">We could not load this page. Your cart is safe. Please try again in a moment.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-line">
          Home
        </Link>
      </div>
    </main>
  );
}
