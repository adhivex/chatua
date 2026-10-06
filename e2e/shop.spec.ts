import { expect, test } from "@playwright/test";
import { addFromShop, fillAddress } from "./helpers";

test("home shows the hero, trust row and featured products", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "The Goodness of Grains, In Every Spoon." })).toBeVisible();
  await expect(page.getByText("No Added")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Classic Chatua" })).toBeVisible();
  await page.getByRole("link", { name: /Shop Chatua/ }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test("shop search filters live and has an empty state", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("searchbox", { name: "Search Chatua" }).fill("jaggery");
  await expect(page.getByRole("heading", { name: "Jaggery Chatua" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Classic Chatua" })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search Chatua" }).fill("pizza");
  await expect(page.getByText("No Chatua found")).toBeVisible();
  await page.getByRole("button", { name: "Show all Chatua" }).click();
  await expect(page.locator("article")).toHaveCount(4);
  await page.getByRole("button", { name: "Protein", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
});

test("size pills change the price", async ({ page }) => {
  await page.goto("/shop");
  const row = page.locator("article", { has: page.getByRole("heading", { name: "Classic Chatua" }) });
  await expect(row.getByText("₹180")).toBeVisible();
  await row.getByRole("radio", { name: "1kg" }).click();
  await expect(row.getByText("₹340")).toBeVisible();
});

test("product page: choose size and quantity, add to cart", async ({ page }) => {
  await page.goto("/shop/multi-grain-chatua");
  await expect(page.getByRole("heading", { level: 1, name: "Multi-Grain Chatua" })).toBeVisible();
  await page.getByRole("radio", { name: /1kg/ }).click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.getByRole("button", { name: /Add to Cart/ })).toContainText("₹840");
  await page.getByRole("button", { name: /Add to Cart/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Multi-Grain Chatua added to cart" })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByText("You get free standard delivery.")).toBeVisible();
  await expect(page.getByText("2 items")).toBeVisible();
  // Cart persists across reloads.
  await page.reload();
  await expect(page.getByText("2 items")).toBeVisible();
});

test("cart: nudge, quantity and remove", async ({ page }) => {
  await addFromShop(page, "Classic Chatua");
  await page.goto("/cart");
  await expect(page.getByText("Add ₹319 more for free standard delivery.")).toBeVisible();
  await page.getByRole("button", { name: "Increase classic chatua 500g quantity" }).click();
  await expect(page.getByText("Add ₹139 more for free standard delivery.")).toBeVisible();
  await page.getByRole("button", { name: "Remove Classic Chatua 500g" }).click();
  await expect(page.getByText("Your cart is empty")).toBeVisible();
});

test("checkout validates fields with the prototype's messages", async ({ page }) => {
  await addFromShop(page, "Classic Chatua");
  await page.goto("/checkout");
  await page.locator("label", { hasText: /Cash on Delivery/ }).click();
  await page.getByPlaceholder("Mobile number").fill("12345");
  await page.getByRole("button", { name: /Pay ₹220/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Please complete the highlighted fields. Mobile needs 10 digits and pincode needs 6 digits." })).toBeVisible();
  await expect(page.getByText("Mobile needs 10 digits", { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("Full name")).toHaveAttribute("aria-invalid", "true");
});

test("full COD order: cart → checkout → order page → track", async ({ page }) => {
  await addFromShop(page, "Classic Chatua", "1kg");
  await addFromShop(page, "Jaggery Chatua");
  await page.goto("/cart");
  await expect(page.getByText("You get free standard delivery.")).toBeVisible();
  await page.getByRole("link", { name: /Proceed to Checkout/ }).click();

  await fillAddress(page);
  await page.locator("label", { hasText: /Express Delivery/ }).click();
  await page.locator("label", { hasText: /Cash on Delivery/ }).click();
  await expect(page.getByText("Pay in cash when your order arrives")).toBeVisible();
  await page.getByRole("button", { name: "Pay ₹650" }).click(); // 340 + 240 + express 70

  await expect(page).toHaveURL(/\/order\/CHATUA\d{5}\?t=.+&placed=1/);
  await expect(page.getByRole("heading", { name: /Order Placed\s*Successfully!/ })).toBeVisible();
  await expect(page.getByText(/#CHATUA\d{5}/)).toBeVisible();
  await expect(page.getByText("₹650")).toBeVisible();
  await page.getByRole("button", { name: /Track Order/ }).click();
  await expect(page.getByText("Packed fresh in Odisha")).toBeVisible();
  await expect(page.getByRole("heading", { name: "You might also like" })).toBeVisible();

  // Cart is emptied after the order.
  await page.goto("/cart");
  await expect(page.getByText("Your cart is empty")).toBeVisible();
});

test("order page needs the right token", async ({ page }) => {
  const res = await page.goto("/order/CHATUA00001?t=wrong-token-wrong-token-wrong");
  expect(res?.status()).toBe(404);
});
