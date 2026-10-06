import { describe, expect, it } from "vitest";
import { formatINR } from "@/lib/money";
import { displayOrderNumber, formatOrderNumber, ORDER_NUMBER_RE } from "@/lib/order-number";

describe("formatINR", () => {
  it("formats rupees with the ₹ sign", () => expect(formatINR(180)).toBe("₹180"));
  it("uses Indian digit grouping", () => expect(formatINR(125000)).toBe("₹1,25,000"));
  it("handles zero", () => expect(formatINR(0)).toBe("₹0"));
});

describe("order numbers", () => {
  it("pads to five digits", () => expect(formatOrderNumber(1)).toBe("CHATUA00001"));
  it("widens instead of truncating", () => expect(formatOrderNumber(123456)).toBe("CHATUA123456"));
  it("is displayed with a hash", () => expect(displayOrderNumber("CHATUA00042")).toBe("#CHATUA00042"));
  it("rejects invalid sequences", () => expect(() => formatOrderNumber(0)).toThrow());
  it("matches the route pattern", () => {
    expect(ORDER_NUMBER_RE.test("CHATUA00001")).toBe(true);
    expect(ORDER_NUMBER_RE.test("CHATUA1")).toBe(false);
    expect(ORDER_NUMBER_RE.test("chatua00001")).toBe(false);
  });
});
