import type { Metadata } from "next";
import Link from "next/link";
import { BackBar } from "@/components/layout/BackBar";
import { GrainsArt } from "@/components/shop/art";
import { ArrowIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "What is Chatua?",
  description: "Chatua is a traditional food from Odisha made from roasted, finely ground grains and pulses. Similar to sattu, enjoy it as a drink, breakfast or snack.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main" className="app-main">
      <BackBar title="What is Chatua?" />
      <div className="mx-4 mt-3.5 h-40 overflow-hidden rounded-card shadow-lift">
        <GrainsArt seed={9} className="h-full w-full" label="Roasted grains and pulses" />
      </div>
      <article className="px-[18px] pb-6 pt-4">
        <h2 className="mb-3 font-head text-2xl font-semibold leading-[1.1] tracking-[-.5px]">A traditional food from Odisha, made with natural grains.</h2>
        <div className="max-w-[62ch] space-y-3 text-[14.5px] leading-[1.6] text-[#4a3a2e]">
          <p>
            Chatua is a traditional food from Odisha, prepared by carefully selecting grains and pulses, traditionally roasted and finely ground into a wholesome powder.
          </p>
          <p>It has been part of Odisha&apos;s food culture for generations and is known for its simplicity, natural ingredients and versatility.</p>
          <p>Similar to sattu in its powdered form, Chatua can be enjoyed in many ways: as a drink, breakfast, snack or part of traditional recipes.</p>
        </div>
        <Link href="/recipes" className="btn btn-primary mt-3">
          See recipes <ArrowIcon />
        </Link>
      </article>
    </main>
  );
}
