"use client";

import { Children, isValidElement, useState } from "react";
import { Chip, ChipRow } from "@/components/ui/Chip";

export function RecipeFilters({ categories, index, children }: { categories: string[]; index: { id: string; category: string }[]; children: React.ReactNode }) {
  const [cat, setCat] = useState("All");
  const show = new Set(index.filter((r) => cat === "All" || r.category === cat).map((r) => r.id));
  const items = Children.toArray(children).filter((c) => isValidElement<{ "data-recipe": string }>(c) && show.has(c.props["data-recipe"]));
  return (
    <>
      <ChipRow label="Recipe type">
        {categories.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </ChipRow>
      <div className="flex flex-col gap-3 px-4 pb-4">{items}</div>
    </>
  );
}
