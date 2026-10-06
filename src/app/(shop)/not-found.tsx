import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

export default function NotFound() {
  return (
    <main id="main" className="app-main">
      <TopBar />
      <div className="px-6 py-16 text-center">
        <h1 className="font-head text-[28px] font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">This page does not exist or the link is incomplete. If you followed an order link, open it again from your confirmation.</p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Shop Chatua
        </Link>
      </div>
    </main>
  );
}
