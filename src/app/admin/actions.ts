"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { endAdminSession, requireAdmin, startAdminSession } from "@/lib/session";
import { deleteObject, IMAGE_TYPES, MAX_IMAGE_BYTES, uploadObject, uploadsConfigured } from "@/lib/storage";
import { SIZES } from "@/lib/validators";
import { ORDER_STATUSES, PAYMENT_STATUSES, setOrderStatus, setPaymentStatus } from "@/server/orders";

export type FormState = { error?: string; ok?: string } | undefined;

/** Product pages are statically generated; refresh the storefront after any catalogue change. */
const refreshStorefront = () => revalidatePath("/", "layout");

/* ---------------------------------------------------------------- auth */

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60_000).ok) return { error: "Too many attempts. Try again in 15 minutes." };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!adminEmail || !hash || !process.env.SESSION_SECRET) return { error: "Admin sign-in is not set up on this server." };

  // Always run the hash check so response time does not reveal whether the email matched.
  const okPassword = await verifyPassword(password, hash);
  if (email !== adminEmail || !okPassword) return { error: "Email or password is incorrect." };

  await startAdminSession(process.env.ADMIN_EMAIL!.trim());
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

/* ---------------------------------------------------------------- orders */

export async function updateOrderStatus(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return { error: "Choose a valid status." };
  const err = await setOrderStatus(id, status);
  if (err) return { error: err };
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  refreshStorefront(); // cancelling restores stock
  return { ok: "Order status updated." };
}

export async function updatePaymentStatus(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("paymentStatus")) as PaymentStatus;
  if (!PAYMENT_STATUSES.includes(status)) return { error: "Choose a valid payment status." };
  const err = await setPaymentStatus(id, status);
  if (err) return { error: err };
  revalidatePath(`/admin/orders/${id}`);
  return { ok: "Payment status updated." };
}

/* ---------------------------------------------------------------- products */

const text = (max: number) => z.string().trim().min(1, "Required").max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

const productSchema = z.object({
  name: text(80),
  category: text(40),
  shortDesc: text(160),
  longDesc: text(2000),
  howToEnjoy: optionalText(2000),
  storage: optionalText(1000),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  active: z.boolean(),
  bestseller: z.boolean(),
});

const variantSchema = z.object({
  price: z.coerce.number().int("Whole rupees only").min(1, "Price must be at least ₹1").max(100000),
  stock: z.coerce.number().int("Whole numbers only").min(0, "Stock cannot be negative").max(100000),
});

function productFields(form: FormData) {
  return productSchema.safeParse({
    name: form.get("name"),
    category: form.get("category"),
    shortDesc: form.get("shortDesc"),
    longDesc: form.get("longDesc"),
    howToEnjoy: form.get("howToEnjoy") ?? "",
    storage: form.get("storage") ?? "",
    sortOrder: form.get("sortOrder") || 0,
    active: form.get("active") === "on",
    bestseller: form.get("bestseller") === "on",
  });
}

const firstIssue = (e: z.ZodError) => {
  const i = e.issues[0];
  return i ? `${i.path.join(".") || "Field"}: ${i.message}` : "Check the form.";
};

export async function updateProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(form.get("id"));
  const parsed = productFields(form);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const variants = await db.variant.findMany({ where: { productId: id } });
  const updates = [];
  for (const v of variants) {
    const vp = variantSchema.safeParse({ price: form.get(`price_${v.id}`), stock: form.get(`stock_${v.id}`) });
    if (!vp.success) return { error: `${v.size}: ${vp.error.issues[0]?.message}` };
    updates.push(db.variant.update({ where: { id: v.id }, data: vp.data }));
  }
  await db.$transaction([db.product.update({ where: { id }, data: parsed.data }), ...updates]);
  refreshStorefront();
  return { ok: "Saved. The shop shows the changes now." };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export async function createProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = productFields(form);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const slug = slugify(String(form.get("slug") || parsed.data.name));
  if (!slug) return { error: "Enter a name or web address." };
  if (await db.product.findUnique({ where: { slug } })) return { error: `A product with the address /shop/${slug} already exists.` };

  const code = slug.replace(/-/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
  const variants = [];
  for (const size of SIZES) {
    const vp = variantSchema.safeParse({ price: form.get(`price_${size}`), stock: form.get(`stock_${size}`) });
    if (!vp.success) return { error: `${size}: ${vp.error.issues[0]?.message}` };
    variants.push({ size, grams: size === "1kg" ? 1000 : 500, ...vp.data, sku: `CHT-${code}-${size === "1kg" ? "1K" : "500"}-${randomBytes(2).toString("hex").toUpperCase()}` });
  }
  const p = await db.product.create({ data: { ...parsed.data, slug, variants: { create: variants } } });
  refreshStorefront();
  redirect(`/admin/products/${p.id}?created=1`);
}

export async function uploadProductImage(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  if (!uploadsConfigured()) return { error: "Image storage is not set up (SUPABASE_URL and SUPABASE_SECRET_KEY)." };
  const id = String(form.get("id"));
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim().slice(0, 160);
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo to upload." };
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return { error: "Use a JPG, PNG, WebP or AVIF photo." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Photos must be 5 MB or smaller." };
  if (!alt) return { error: "Describe the photo (alt text) for screen readers and search engines." };

  const product = await db.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return { error: "Product not found." };
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[file.type];
  const path = `products/${product.slug}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  try {
    await uploadObject(path, file, file.type);
  } catch (e) {
    console.error("[admin] upload failed", (e as Error).message);
    return { error: "Upload failed. Please try again." };
  }
  await db.productImage.create({ data: { productId: id, publicId: path, alt, position: product.images.length } });
  refreshStorefront();
  return { ok: "Photo added." };
}

export async function deleteProductImage(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const img = await db.productImage.findUnique({ where: { id: String(form.get("imageId")) } });
  if (!img) return { error: "Photo not found." };
  await db.productImage.delete({ where: { id: img.id } });
  if (!img.publicId.startsWith("/") && uploadsConfigured()) await deleteObject(img.publicId).catch((e) => console.error("[admin] storage delete failed", (e as Error).message));
  refreshStorefront();
  // The photo's card (and this form) disappears, so confirm at page level instead.
  redirect(`/admin/products/${img.productId}?removed=1`);
}

export async function moveProductImage(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const img = await db.productImage.findUnique({ where: { id: String(form.get("imageId")) } });
  if (!img) return { error: "Photo not found." };
  const all = await db.productImage.findMany({ where: { productId: img.productId }, orderBy: { position: "asc" } });
  const i = all.findIndex((x) => x.id === img.id);
  const j = form.get("dir") === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return undefined;
  [all[i], all[j]] = [all[j]!, all[i]!];
  await db.$transaction(all.map((x, pos) => db.productImage.update({ where: { id: x.id }, data: { position: pos } })));
  refreshStorefront();
  return { ok: "Order updated." };
}

/* ---------------------------------------------------------------- recipes */

const recipeSchema = z.object({
  title: text(80),
  note: text(160),
  category: text(40),
  body: text(3000),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export async function saveRecipe(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = recipeSchema.safeParse(Object.fromEntries(["title", "note", "category", "body", "sortOrder"].map((k) => [k, form.get(k) ?? ""])));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const id = String(form.get("id") ?? "");
  if (id) {
    await db.recipe.update({ where: { id }, data: parsed.data });
  } else {
    const slug = slugify(parsed.data.title);
    if (await db.recipe.findUnique({ where: { slug } })) return { error: "A recipe with that title already exists." };
    await db.recipe.create({ data: { ...parsed.data, slug } });
  }
  refreshStorefront();
  revalidatePath("/admin/recipes");
  return { ok: "Recipe saved." };
}

export async function deleteRecipe(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  await db.recipe.delete({ where: { id: String(form.get("id")) } }).catch(() => null);
  refreshStorefront();
  revalidatePath("/admin/recipes");
  return { ok: "Recipe deleted." };
}
