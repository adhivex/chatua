// Seeds the catalogue and recipes from prisma/seed-data.json (v3 handoff).
// Create-only: existing rows are never overwritten, so re-running it (every deploy does)
// keeps prices, stock and copy edited in the admin.
import { PrismaClient } from "@prisma/client";
import seed from "./seed-data.json";

const db = new PrismaClient();

async function main() {
  const { howToEnjoy, storage } = seed.productCommon;
  let created = 0;

  for (const p of seed.products) {
    const existing = await db.product.findUnique({ where: { slug: p.slug }, select: { id: true } });
    const product =
      existing ??
      (await db.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          category: p.category,
          shortDesc: p.shortDesc,
          longDesc: p.longDesc,
          howToEnjoy,
          storage,
          bestseller: p.bestseller,
          sortOrder: p.sortOrder,
        },
      }));
    if (!existing) created++;

    for (const v of p.variants) {
      await db.variant.upsert({ where: { sku: v.sku }, update: {}, create: { ...v, productId: product.id } });
    }
  }

  for (const r of seed.recipes) {
    await db.recipe.upsert({ where: { slug: r.slug }, update: {}, create: r });
  }

  console.log(`Seed done: ${created} new product(s); ${await db.product.count()} products, ${await db.recipe.count()} recipes in total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
