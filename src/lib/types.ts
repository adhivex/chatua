// Client-safe shapes passed from server components to client components.
export type ImageDTO = { src: string; alt: string };

export type VariantDTO = { size: string; grams: number; price: number; maxQty: number };

export type ProductDTO = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  howToEnjoy: string | null;
  storage: string | null;
  bestseller: boolean;
  variants: VariantDTO[];
  images: ImageDTO[];
};

export type RecipeDTO = { id: string; slug: string; title: string; note: string; category: string; body: string; image: string | null };
