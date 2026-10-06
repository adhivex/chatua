import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-shell mx-auto grid min-h-dvh max-w-shell place-items-center px-6 text-center">
      <div>
        <h1 className="font-head text-[28px] font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">This page does not exist.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Go to home
        </Link>
      </div>
    </main>
  );
}
