import { expect, type Page } from "@playwright/test";

export async function addFromShop(page: Page, name: string, size: "500g" | "1kg" = "500g") {
  await page.goto("/shop");
  const row = page.locator("article", { has: page.getByRole("heading", { name }) });
  await row.getByRole("radio", { name: size }).click();
  await row.getByRole("button", { name: new RegExp(`Add ${name}`) }).click();
  await expect(page.getByRole("status").filter({ hasText: `${name} added to cart` })).toBeVisible();
}

export async function fillAddress(page: Page, over: Partial<Record<"name" | "phone" | "line" | "city" | "pincode", string>> = {}) {
  const v = { name: "Asha Das", phone: "9876543210", line: "12 Temple Road, Old Town", city: "Bhubaneswar", pincode: "751002", ...over };
  await page.getByPlaceholder("Full name").fill(v.name);
  await page.getByPlaceholder("Mobile number").fill(v.phone);
  await page.getByPlaceholder("House no., street, area").fill(v.line);
  await page.getByPlaceholder("City").fill(v.city);
  await page.getByPlaceholder("Pincode").fill(v.pincode);
}

export async function productId(page: Page, slug: string): Promise<string> {
  // The cart stores product ids; read one by adding to cart from the product page.
  await page.goto(`/shop/${slug}`);
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  const id = await page.evaluate(() => JSON.parse(localStorage.getItem("chatua-cart") ?? "{}").state.lines[0].productId as string);
  await page.evaluate(() => localStorage.removeItem("chatua-cart"));
  return id;
}
