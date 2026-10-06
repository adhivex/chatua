import { BottomNav } from "@/components/layout/BottomNav";

/** Main screens show the bottom nav (Home, Shop, Recipes, Cart, Account, order page). */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
