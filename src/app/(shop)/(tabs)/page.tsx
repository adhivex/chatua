import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { GrainsArt, MoundArt } from "@/components/shop/art";
import { HeritageCard } from "@/components/shop/HeritageCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { ArrowIcon, LeafIcon, NoPreservativesIcon, NutritionIcon, TruckIcon } from "@/components/ui/icons";
import { TrustRow } from "@/components/ui/TrustRow";
import { getProducts } from "@/server/products";

export const revalidate = 300;

export default async function HomePage() {
  const featured = (await getProducts()).slice(0, 2);
  return (
    <main id="main" className="app-main">
      <TopBar over />
      <section className="relative h-[400px] overflow-hidden bg-espresso">
        <div className="absolute inset-y-0 right-0 w-[84%]">
          <MoundArt tone="#dcbc8c" extra={null} seed={11} w={300} h={300} className="h-full w-full [filter:saturate(1.08)_contrast(1.06)]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,19,10,.97)_0%,rgba(34,19,10,.82)_40%,rgba(34,19,10,.08)_88%),linear-gradient(180deg,rgba(34,19,10,.65)_0,transparent_28%,transparent_62%,rgba(34,19,10,.55)_100%)]" />
        <div className="relative z-[2] max-w-[80%] px-[22px] pb-7 pt-28">
          <h1 className="font-head text-[40px] font-semibold leading-[1.02] tracking-[-1px] text-ivory">The Goodness of Grains, In Every Spoon.</h1>
          <p className="mb-[22px] mt-3.5 max-w-[230px] text-sm leading-normal text-ivory/75">
            A traditional Odisha food, made from natural grains for everyday nourishment.
          </p>
          <Link href="/shop" className="btn btn-gold">
            Shop Chatua <ArrowIcon />
          </Link>
        </div>
      </section>

      <div className="relative z-[3] -mt-[30px] rounded-t-sheet bg-paper px-[18px] pb-1.5 pt-6 shadow-[0_-14px_30px_-14px_rgba(34,19,10,.45)]">
        <TrustRow
          items={[
            { icon: <LeafIcon />, label: ["100%", "Natural"] },
            { icon: <NutritionIcon />, label: ["Rich in", "Nutrition"] },
            { icon: <NoPreservativesIcon />, label: ["No Added", "Preservatives"] },
            { icon: <TruckIcon />, label: ["Pan India", "Delivery"] },
          ]}
        />
        <HeritageCard />

        <div className="mb-3 mt-1 flex items-center justify-between">
          <h2 className="font-head text-[21px] font-semibold tracking-[-.3px]">Shop Our Chatua</h2>
          <Link href="/shop" className="py-2 text-[13px] font-semibold text-clay">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5 pb-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <h2 className="mb-3 mt-1 font-head text-[21px] font-semibold tracking-[-.3px]">New to Chatua?</h2>
        <Link href="/about" className="mb-[18px] flex items-center gap-3 rounded-card bg-card p-2 text-left shadow-soft">
          <span className="h-[72px] w-[82px] flex-none overflow-hidden rounded-xl">
            <GrainsArt seed={5} className="h-full w-full" />
          </span>
          <span>
            <b className="text-[15px]">What is Chatua?</b>
            <small className="mt-[3px] block text-[12.5px] leading-[1.3] text-muted">A quick guide to this Odisha grain powder and how to enjoy it.</small>
          </span>
        </Link>
      </div>
    </main>
  );
}
