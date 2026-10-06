import type { Metadata } from "next";
import Link from "next/link";
import { BackBar } from "@/components/layout/BackBar";
import { TempleArt } from "@/components/shop/art";
import { LeafIcon, NutritionIcon, TempleIcon } from "@/components/ui/icons";
import { TrustRow } from "@/components/ui/TrustRow";

export const metadata: Metadata = {
  title: "Our Odisha Heritage",
  description: "Chatua has deep roots in Odisha's food culture: traditional ingredients, simple preparation and natural goodness enjoyed for generations.",
  alternates: { canonical: "/heritage" },
};

export default function HeritagePage() {
  return (
    <main id="main" className="app-main">
      <BackBar title="Our Odisha Heritage" />
      <div className="mx-4 mt-3.5 h-[190px] overflow-hidden rounded-card shadow-lift">
        <TempleArt className="h-full w-full" label="An Odisha temple at sunset" />
      </div>
      <article className="px-[18px] pb-6 pt-4">
        <h2 className="mb-3 font-head text-2xl font-semibold leading-[1.1] tracking-[-.5px]">A Traditional Food with a Rich Heritage</h2>
        <p className="max-w-[62ch] text-[14.5px] leading-[1.6] text-[#4a3a2e]">
          Chatua has deep roots in Odisha&apos;s food culture. Made with traditional ingredients and simple preparation, it has been enjoyed by generations for its natural goodness and wholesome nutrition.
        </p>
      </article>
      <TrustRow
        className="px-4"
        items={[
          { icon: <TempleIcon />, label: ["Odisha's", "Traditional Food"] },
          { icon: <LeafIcon />, label: ["Generations", "of Trust"] },
          { icon: <NutritionIcon />, label: ["Natural", "Goodness"] },
        ]}
      />
      <div className="px-4 pb-6">
        <Link href="/shop" className="btn btn-primary btn-block">
          Shop Chatua
        </Link>
      </div>
    </main>
  );
}
