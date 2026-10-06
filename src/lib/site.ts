// Public, client-safe site settings. Owner details that are not confirmed yet come from env and
// the features that need them hide themselves when empty (docs/LAUNCH-CHECKLIST.md).

export const SITE_NAME = "Chatua";
export const SITE_TAGLINE = "Odisha's Traditional Food";
export const SITE_DESCRIPTION =
  "Chatua is a traditional Odisha food made from roasted, finely ground grains and pulses. Natural, nourishing and delivered across India.";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/** Digits only with country code, or null when not configured. */
export function whatsappNumber(): string | null {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return /^\d{11,15}$/.test(digits) ? digits : null;
}

export function whatsappLink(text: string): string | null {
  const n = whatsappNumber();
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

export function supportEmail(): string | null {
  const e = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

export const INSTAGRAM_URL = "https://www.instagram.com/chatua.in/";
