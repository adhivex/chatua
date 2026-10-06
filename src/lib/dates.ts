const TZ = "Asia/Kolkata";

const dayMonth = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: TZ });
const full = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ });

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

/** "9 Oct – 11 Oct" from the order date and the delivery window. */
export function deliveryWindow(placedAt: Date, method: "STANDARD" | "EXPRESS"): string {
  const [min, max] = method === "EXPRESS" ? [2, 3] : [3, 5];
  return `${dayMonth.format(addDays(placedAt, min))} – ${dayMonth.format(addDays(placedAt, max))}`;
}

export const formatDateTime = (d: Date) => full.format(d);
