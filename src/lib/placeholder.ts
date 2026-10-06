// Look of the drawn placeholder (prototype mound()) per product category.
export type MoundExtra = "seeds" | "jaggery" | "green" | null;
export type ArtStyle = { tone: string; extra: MoundExtra };

const BY_CATEGORY: Record<string, ArtStyle> = {
  Classic: { tone: "#dcbc8c", extra: null },
  "Multi-Grain": { tone: "#c9a06c", extra: "seeds" },
  Jaggery: { tone: "#d6a762", extra: "jaggery" },
  Protein: { tone: "#c9b27e", extra: "green" },
};

export const artFor = (category: string): ArtStyle => BY_CATEGORY[category] ?? { tone: "#d2b07c", extra: null };

/** Stable small number from a string, used to seed the placeholder randomness. */
export function seedFrom(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
  return h + 3;
}

export type FoodKind = "drink" | "bowl" | "ladoo";
export const foodFor = (recipeCategory: string): FoodKind =>
  recipeCategory === "Drinks" ? "drink" : recipeCategory === "Breakfast" ? "bowl" : "ladoo";
