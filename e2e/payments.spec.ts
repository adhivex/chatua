import { expect, test } from "@playwright/test";
import { addFromShop, fillAddress, productId } from "./helpers";

test("online payment success marks the order paid", async ({ page }) => {
  await addFromShop(page, "Protein Chatua");
  await page.goto("/checkout");
  await expect(page.getByText("Test mode: online payments are simulated")).toBeVisible();
  await fillAddress(page);
  await page.locator("label", { hasText: /UPI/ }).click();
  await page.getByRole("button", { name: "Pay ₹300" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await expect(page.getByRole("heading", { name: /Order Placed\s*Successfully!/ })).toBeVisible();
  await page.getByText("Order details").click();
  await expect(page.getByText("Paid online")).toBeVisible();
});

test("online payment failure keeps the cart and returns to checkout", async ({ page }) => {
  await addFromShop(page, "Protein Chatua");
  await page.goto("/checkout");
  await fillAddress(page);
  await page.locator("label", { hasText: "Credit / Debit Card" }).click();
  await page.getByRole("button", { name: "Pay ₹300" }).click();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Payment failed. Your cart is saved" })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.goto("/cart");
  await expect(page.getByText("1 item")).toBeVisible();
});

test.describe("server-side pricing", () => {
  const address = { addressType: "Home", name: "API Test", phone: "9876543210", line: "1 Lane", city: "Puri", pincode: "752001" };

  test("ignores client prices and rejects a stale total", async ({ page, request }) => {
    const id = await productId(page, "classic-chatua");
    const items = [{ productId: id, size: "500g", qty: 1, price: 1 }];
    const stale = await request.post("/api/checkout", { data: { items, address, deliveryMethod: "STANDARD", paymentMethod: "COD", expectedTotal: 41 } });
    expect(stale.status()).toBe(409);
    expect((await stale.json()).code).toBe("PRICE_CHANGED");

    const ok = await request.post("/api/checkout", { data: { items, address, deliveryMethod: "STANDARD", paymentMethod: "COD", total: 1 } });
    expect(ok.status()).toBe(201);
    expect((await ok.json()).total).toBe(220);
  });

  test("validates input and rejects non-JSON", async ({ request }) => {
    const bad = await request.post("/api/checkout", { data: { items: [], address: {}, deliveryMethod: "STANDARD", paymentMethod: "COD" } });
    expect(bad.status()).toBe(400);
    const form = await request.post("/api/checkout", { form: { a: "b" } });
    expect(form.status()).toBe(415);
  });

  test("webhook rejects unsigned calls", async ({ request }) => {
    const r = await request.post("/api/razorpay/webhook", { data: { event: "payment.captured" } });
    expect([400, 503]).toContain(r.status());
  });
});
