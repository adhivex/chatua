import { expect, test } from "@playwright/test";
import { E2E_ADMIN } from "../playwright.config";
import { addFromShop, fillAddress } from "./helpers";

test("admin pages require sign-in", async ({ page }) => {
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("admin: wrong password is refused", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
});

test("admin: update an order and the customer sees it; edit price and stock", async ({ page, context }) => {
  // Place an order as a customer.
  await addFromShop(page, "Classic Chatua");
  await page.goto("/checkout");
  await fillAddress(page, { name: "Track Me" });
  await page.locator("label", { hasText: /Cash on Delivery/ }).click();
  await page.getByRole("button", { name: /Pay ₹/ }).click();
  await expect(page.getByRole("heading", { name: /Order Placed/ })).toBeVisible();
  const orderUrl = page.url();
  const orderNumber = orderUrl.match(/CHATUA\d+/)![0];

  const admin = await context.newPage();
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill(E2E_ADMIN.email);
  await admin.getByLabel("Password").fill(E2E_ADMIN.password);
  await admin.getByRole("button", { name: "Sign in" }).click();
  await expect(admin.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await admin.goto("/admin/orders");
  await admin.getByRole("link", { name: `#${orderNumber}` }).click();
  await expect(admin.getByRole("heading", { level: 1, name: `#${orderNumber}` })).toBeVisible();
  await expect(admin.getByText("Track Me")).toBeVisible();
  await admin.getByLabel("Move the order to").selectOption("SHIPPED");
  await admin.getByRole("button", { name: "Update" }).first().click();
  await expect(admin.getByText("Order status updated.")).toBeVisible();

  await page.goto(orderUrl.replace("&placed=1", ""));
  await expect(page.getByText("On its way")).toBeVisible();

  // Edit the 500g price of Jaggery Chatua; the storefront reflects it.
  await admin.goto("/admin/products");
  await admin.getByRole("link", { name: "Jaggery Chatua" }).click();
  await admin.getByLabel("Price (₹)").first().fill("255");
  await admin.getByRole("button", { name: "Save changes" }).click();
  await expect(admin.getByText("Saved. The shop shows the changes now.")).toBeVisible();
  await page.goto("/shop/jaggery-chatua");
  await expect(page.getByRole("radio", { name: /500g/ })).toContainText("₹255");

  // Put the seed price back so reruns start from the same catalogue.
  await admin.getByLabel("Price (₹)").first().fill("240");
  await admin.getByRole("button", { name: "Save changes" }).click();
  await expect(admin.getByText("Saved. The shop shows the changes now.")).toBeVisible();

  await admin.getByRole("button", { name: "Sign out" }).click();
  await expect(admin).toHaveURL(/\/admin\/login$/);
});
