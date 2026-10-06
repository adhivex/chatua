import { describe, expect, it } from "vitest";
import { addLine, setLineQty, type CartLine } from "@/store/cart";

describe("cart reducer", () => {
  it("adds a new line", () => expect(addLine([], "a", "500g")).toEqual([{ productId: "a", size: "500g", qty: 1 }]));
  it("increments an existing line of the same size", () => {
    expect(addLine([{ productId: "a", size: "500g", qty: 2 }], "a", "500g", 3)).toEqual([{ productId: "a", size: "500g", qty: 5 }]);
  });
  it("keeps sizes as separate lines", () => expect(addLine([{ productId: "a", size: "500g", qty: 1 }], "a", "1kg")).toHaveLength(2));
  it("caps a line at 20", () => expect(addLine([{ productId: "a", size: "500g", qty: 19 }], "a", "500g", 5)[0]?.qty).toBe(20));
  it("removes a line when quantity drops below 1", () => {
    const lines: CartLine[] = [{ productId: "a", size: "500g", qty: 1 }];
    expect(setLineQty(lines, "a", "500g", 0)).toEqual([]);
  });
  it("sets quantity within bounds", () => expect(setLineQty([{ productId: "a", size: "1kg", qty: 1 }], "a", "1kg", 50)[0]?.qty).toBe(20));
});
