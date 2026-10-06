export const ORDER_PREFIX = "CHATUA";

/** CHATUA00001; widens past 99999 instead of truncating. */
export function formatOrderNumber(seq: number): string {
  if (!Number.isInteger(seq) || seq < 1) throw new Error(`Invalid order sequence: ${seq}`);
  return ORDER_PREFIX + String(seq).padStart(5, "0");
}

/** Shown to customers as #CHATUA00001. */
export const displayOrderNumber = (orderNumber: string) => `#${orderNumber}`;

export const ORDER_NUMBER_RE = /^CHATUA\d{5,}$/;
