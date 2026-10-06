import { describe, expect, it } from "vitest";
import { addressSchema, checkoutSchema } from "@/lib/validators";

const good = { addressType: "Home", name: "Asha Das", phone: "9876543210", line: "12 Temple Road, Old Town", city: "Bhubaneswar", pincode: "751002" } as const;

describe("addressSchema", () => {
  it("accepts a complete address", () => expect(addressSchema.safeParse(good).success).toBe(true));
  it("trims and normalises the phone number", () => {
    const r = addressSchema.parse({ ...good, phone: "+91 98765-43210", name: "  Asha  " });
    expect(r.phone).toBe("9876543210");
    expect(r.name).toBe("Asha");
  });
  it.each(["98765", "98765432101", "98765abcde", ""])("rejects mobile %j", (phone) => {
    const r = addressSchema.safeParse({ ...good, phone });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Mobile needs 10 digits");
  });
  it.each(["7510", "7510021", "75100a"])("rejects pincode %j", (pincode) => {
    const r = addressSchema.safeParse({ ...good, pincode });
    expect(r.error?.issues[0]?.message).toBe("Pincode needs 6 digits");
  });
  it("requires name, address and city", () => {
    const r = addressSchema.safeParse({ ...good, name: " ", line: "", city: "" });
    expect(r.error?.issues.map((i) => i.path[0]).sort()).toEqual(["city", "line", "name"]);
  });
});

describe("checkoutSchema", () => {
  const base = { items: [{ productId: "p1", size: "500g", qty: 1 }], address: good, deliveryMethod: "STANDARD", paymentMethod: "COD" };
  it("accepts a valid checkout", () => expect(checkoutSchema.safeParse(base).success).toBe(true));
  it("rejects an empty cart", () => expect(checkoutSchema.safeParse({ ...base, items: [] }).success).toBe(false));
  it("caps quantity at 20", () => expect(checkoutSchema.safeParse({ ...base, items: [{ productId: "p1", size: "500g", qty: 21 }] }).success).toBe(false));
  it("rejects unknown sizes and methods", () => {
    expect(checkoutSchema.safeParse({ ...base, items: [{ productId: "p1", size: "2kg", qty: 1 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, paymentMethod: "CRYPTO" }).success).toBe(false);
  });
  it("ignores client prices (unknown keys are stripped)", () => {
    const r = checkoutSchema.parse({ ...base, items: [{ productId: "p1", size: "500g", qty: 1, price: 1 }], total: 1 });
    expect(r.items[0]).toEqual({ productId: "p1", size: "500g", qty: 1 });
    expect("total" in r).toBe(false);
  });
});
