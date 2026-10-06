import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionSecret } from "./config";
import { hmacHex, safeEqual } from "./signature";

export const ADMIN_COOKIE = "chatua_admin";
const MAX_AGE_S = 8 * 60 * 60;

type Session = { sub: string; exp: number };

export function signSession(sub: string, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ sub, exp: Math.floor(now / 1000) + MAX_AGE_S } satisfies Session)).toString("base64url");
  return `${payload}.${hmacHex(secret, payload)}`;
}

export function readSession(token: string | undefined, secret: string, now = Date.now()): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(hmacHex(secret, payload), sig)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return typeof s.sub === "string" && typeof s.exp === "number" && s.exp * 1000 > now ? s : null;
  } catch {
    return null;
  }
}

export async function startAdminSession(email: string) {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  (await cookies()).set(ADMIN_COOKIE, signSession(email, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function getAdmin(): Promise<Session | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const s = readSession((await cookies()).get(ADMIN_COOKIE)?.value, secret);
  return s && s.sub === process.env.ADMIN_EMAIL ? s : null;
}

/** Guard for admin pages and server actions. */
export async function requireAdmin(): Promise<Session> {
  const s = await getAdmin();
  if (!s) redirect("/admin/login");
  return s;
}
