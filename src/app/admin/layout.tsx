import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Chatua admin" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-cream">{children}</div>;
}
