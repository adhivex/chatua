import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clientIp, rateLimit, resetRateLimits } from "@/lib/rate-limit";
import { readSession, signSession } from "@/lib/session";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/signature";

describe("Razorpay signatures", () => {
  const secret = "test_secret";
  it("verifies a checkout callback signature", () => {
    const sig = createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
    expect(verifyPaymentSignature("order_1", "pay_1", sig, secret)).toBe(true);
    expect(verifyPaymentSignature("order_1", "pay_2", sig, secret)).toBe(false);
    expect(verifyPaymentSignature("order_1", "pay_1", "00", secret)).toBe(false);
  });
  it("verifies a webhook body signature", () => {
    const body = '{"event":"payment.captured"}';
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
    expect(verifyWebhookSignature(body + " ", sig, secret)).toBe(false);
  });
});

describe("admin session cookie", () => {
  const secret = "s".repeat(40);
  it("round-trips a signed session", () => expect(readSession(signSession("a@b.in", secret), secret)?.sub).toBe("a@b.in"));
  it("rejects tampering and wrong secrets", () => {
    const t = signSession("a@b.in", secret);
    const [p, s] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "x@y.in", exp: 9e9 })).toString("base64url");
    expect(readSession(`${forged}.${s}`, secret)).toBeNull();
    expect(readSession(`${p}.${s}`, "t".repeat(40))).toBeNull();
    expect(readSession("garbage", secret)).toBeNull();
  });
  it("expires after 8 hours", () => {
    const t = signSession("a@b.in", secret, 0);
    expect(readSession(t, secret, 8 * 3600_000 + 1000)).toBeNull();
  });
});

describe("password hashing", () => {
  it("verifies the right password only", async () => {
    const h = await hashPassword("correct horse battery");
    expect(h.startsWith("scrypt:")).toBe(true);
    expect(h).not.toContain("$");
    expect(await verifyPassword("correct horse battery", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
  });
});

describe("rate limiter", () => {
  it("blocks after the limit within the window", () => {
    resetRateLimits();
    const r = Array.from({ length: 4 }, () => rateLimit("k", 3, 60_000).ok);
    expect(r).toEqual([true, true, true, false]);
  });
  it("reads the client IP from proxy headers", () => {
    expect(clientIp(new Headers({ "x-real-ip": "1.2.3.4" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-forwarded-for": "5.6.7.8, 10.0.0.1" }))).toBe("5.6.7.8");
  });
});
