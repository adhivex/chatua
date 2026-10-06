import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { addFromShop } from "./helpers";

const pages = ["/", "/shop", "/shop/classic-chatua", "/recipes", "/about", "/heritage", "/account", "/policies"];

for (const path of pages) {
  test(`no serious accessibility issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const serious = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}

test("no serious accessibility issues on cart and checkout", async ({ page }) => {
  await addFromShop(page, "Classic Chatua");
  for (const path of ["/cart", "/checkout"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  }
});

test("security headers and SEO files", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-powered-by"]).toBeUndefined();
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/shop/classic-chatua");
  const product = await (await request.get("/shop/classic-chatua")).text();
  expect(product).toContain('"@type":"Product"');
  expect(product).toContain('"priceCurrency":"INR"');
});

test("no console errors on main pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  for (const p of ["/", "/shop", "/shop/protein-chatua", "/recipes", "/cart", "/account"]) {
    await page.goto(p);
    await page.waitForLoadState("networkidle");
  }
  expect(errors).toEqual([]);
});
