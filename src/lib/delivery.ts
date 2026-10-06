export type DeliveryMethod = "STANDARD" | "EXPRESS";

export const DELIVERY = {
  STANDARD: { fee: 40, label: "Standard Delivery", eta: "3 – 5 days" },
  EXPRESS: { fee: 70, label: "Express Delivery", eta: "2 – 3 days" },
  FREE_ABOVE: 499, // standard only; item subtotal in rupees
} as const;

export function deliveryFee(subtotal: number, method: DeliveryMethod): number {
  if (subtotal <= 0) return 0;
  if (method === "EXPRESS") return DELIVERY.EXPRESS.fee;
  return subtotal >= DELIVERY.FREE_ABOVE ? 0 : DELIVERY.STANDARD.fee;
}

export function amountForFreeDelivery(subtotal: number): number {
  return Math.max(0, DELIVERY.FREE_ABOVE - subtotal);
}
