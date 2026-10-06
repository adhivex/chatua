import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { clientIp, rateLimit } from "./rate-limit";

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export const fail = (status: number, code: string, message: string, extra?: Record<string, unknown>) => json({ ok: false, code, message, ...extra }, status);

/** Parses a small JSON body against a schema. Returns the data or a ready error response. */
export async function readJson<S extends z.ZodType>(req: Request, schema: S, maxBytes = 16_384): Promise<{ data: z.infer<S> } | { error: NextResponse }> {
  if (!req.headers.get("content-type")?.includes("application/json")) return { error: fail(415, "BAD_REQUEST", "Send the request as JSON.") };
  const text = await req.text();
  if (text.length > maxBytes) return { error: fail(413, "BAD_REQUEST", "That request is too large.") };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { error: fail(400, "BAD_REQUEST", "That request could not be read.") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: fail(400, "INVALID", "Please check the highlighted details.", { issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }) };
  }
  return { data: parsed.data };
}

export function limit(req: Request, name: string, max: number, windowMs: number): NextResponse | null {
  const r = rateLimit(`${name}:${clientIp(req.headers)}`, max, windowMs);
  return r.ok ? null : fail(429, "RATE_LIMITED", "Too many attempts. Please wait a minute and try again.", undefined);
}
