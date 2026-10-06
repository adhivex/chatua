import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { paymentProvider } from "@/lib/config";
import { requireAdmin } from "@/lib/session";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/recipes", label: "Recipes" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const provider = paymentProvider();
  return (
    <>
      <header className="hairline-b sticky top-0 z-20 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin" aria-label="Admin home">
            <Logo />
          </Link>
          <nav aria-label="Admin" className="flex flex-wrap gap-1 text-sm font-semibold">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-ink hover:bg-sand">
                {n.label}
              </Link>
            ))}
            <Link href="/" className="rounded-lg px-3 py-2 text-muted hover:bg-sand" target="_blank">
              View shop ↗
            </Link>
          </nav>
          <form action={logout} className="ml-auto flex items-center gap-3 text-xs text-muted">
            <span>{admin.sub}</span>
            <button type="submit" className="rounded-lg border border-line px-3 py-2 font-semibold text-ink hover:bg-sand">
              Sign out
            </button>
          </form>
        </div>
        {provider !== "razorpay" && (
          <p className="bg-gold-wash px-4 py-1.5 text-center text-xs text-clay-dark">
            {provider === "mock" ? "Payments are in TEST MODE: online payments are simulated, no money is taken." : "Online payments are off: customers can only choose Cash on Delivery."}
          </p>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
