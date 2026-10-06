import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { imageSrc } from "@/lib/storage";
import type { RecipeDTO } from "@/lib/types";

export const getRecipes = cache(async (): Promise<RecipeDTO[]> => {
  const rows = await db.recipe.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  return rows.map((r) => ({ id: r.id, slug: r.slug, title: r.title, note: r.note, category: r.category, body: r.body, image: imageSrc(r.imagePublicId) }));
});
