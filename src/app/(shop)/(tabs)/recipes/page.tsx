import type { Metadata } from "next";
import Image from "next/image";
import { BackBar } from "@/components/layout/BackBar";
import { FoodArt } from "@/components/shop/art";
import { RecipeFilters } from "@/components/shop/RecipeFilters";
import { ChevronIcon } from "@/components/ui/icons";
import { foodFor } from "@/lib/placeholder";
import { getRecipes } from "@/server/recipes";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Chatua Recipes",
  description: "Easy ways to enjoy Chatua: a refreshing Chatua drink, a filling breakfast bowl and traditional Chatua ladoos.",
  alternates: { canonical: "/recipes" },
};

export default async function RecipesPage() {
  const recipes = await getRecipes();
  const cats = ["All", ...new Set(recipes.map((r) => r.category))];
  return (
    <main id="main" className="app-main">
      <BackBar title="Recipes" />
      <div className="pt-3.5">
        <RecipeFilters categories={cats} index={recipes.map((r) => ({ id: r.id, category: r.category }))}>
          {recipes.map((r) => (
            <details key={r.id} data-recipe={r.id} className="rounded-card bg-card p-2 shadow-soft">
              <summary className="flex min-h-11 cursor-pointer items-center gap-3">
                <span className="relative h-[72px] w-[82px] flex-none overflow-hidden rounded-xl">
                  {r.image ? <Image src={r.image} alt="" fill sizes="82px" className="object-cover" /> : <FoodArt kind={foodFor(r.category)} className="h-full w-full" />}
                </span>
                <span className="flex-1">
                  <b className="text-[15px]">{r.title}</b>
                  <small className="mt-[3px] block text-[12.5px] leading-[1.3] text-muted">{r.note}</small>
                </span>
                <ChevronIcon className="chev mr-1 text-muted transition-transform" />
              </summary>
              <p className="max-w-[62ch] px-1.5 pb-1 pt-2.5 text-[13.5px] leading-[1.55] text-muted">{r.body}</p>
            </details>
          ))}
        </RecipeFilters>
      </div>
    </main>
  );
}
