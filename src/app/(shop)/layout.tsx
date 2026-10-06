import { SiteCredit } from "@/components/layout/SiteCredit";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { Toast } from "@/components/layout/Toast";

/** Storefront: one mobile column, centred up to 460px on wider screens. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell relative mx-auto min-h-dvh w-full max-w-shell">
      <a href="#main" className="sr-only z-50 rounded-btn bg-espresso px-4 py-2 text-ivory focus:not-sr-only focus:absolute focus:left-3 focus:top-3">
        Skip to content
      </a>
      {children}
      <SiteCredit />
      <StoreHydrator />
      <Toast />
    </div>
  );
}
