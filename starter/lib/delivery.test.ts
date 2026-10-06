import { describe, expect, it } from "vitest";
import { amountForFreeDelivery, deliveryFee } from "./delivery";

describe("deliveryFee", () => {
  it("charges standard below the threshold", () => expect(deliveryFee(420, "STANDARD")).toBe(40));
  it("is free at exactly 499", () => expect(deliveryFee(499, "STANDARD")).toBe(0));
  it("is free above 499", () => expect(deliveryFee(700, "STANDARD")).toBe(0));
  it("never makes express free", () => expect(deliveryFee(900, "EXPRESS")).toBe(70));
  it("charges nothing for an empty cart", () => expect(deliveryFee(0, "STANDARD")).toBe(0));
});

describe("amountForFreeDelivery", () => {
  it("returns the gap", () => expect(amountForFreeDelivery(420)).toBe(79));
  it("never goes negative", () => expect(amountForFreeDelivery(600)).toBe(0));
});
