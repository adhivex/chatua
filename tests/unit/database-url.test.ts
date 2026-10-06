import { describe, expect, it } from "vitest";
import { describe as hostOf, resolveDatabaseUrls } from "@/lib/database-url";

const ref = "postgres.abcdefghij";
const pooler = `postgresql://${ref}:pw@aws-0-ap-south-1.pooler.supabase.com`;

describe("resolveDatabaseUrls", () => {
  it("keeps explicit DATABASE_URL and DIRECT_URL", () => {
    expect(resolveDatabaseUrls({ DATABASE_URL: "postgresql://u:p@h:5432/a", DIRECT_URL: "postgresql://u:p@h2:5432/a" })).toEqual({
      url: "postgresql://u:p@h:5432/a",
      directUrl: "postgresql://u:p@h2:5432/a",
    });
  });
  it("uses the direct URL as both when only DATABASE_URL is set", () => {
    const r = resolveDatabaseUrls({ DATABASE_URL: "postgresql://u:p@db.x.supabase.co:5432/postgres" });
    expect(r?.directUrl).toBe("postgresql://u:p@db.x.supabase.co:5432/postgres");
  });
  it("adds pgbouncer=true for the Supabase transaction pooler and derives session mode for migrations", () => {
    const r = resolveDatabaseUrls({ DATABASE_URL: `${pooler}:6543/postgres` })!;
    expect(new URL(r.url).searchParams.get("pgbouncer")).toBe("true");
    expect(new URL(r.url).searchParams.get("connection_limit")).toBe("1");
    expect(r.directUrl).toBe(`${pooler}:5432/postgres`);
  });
  it("leaves an existing pgbouncer setting alone", () => {
    const r = resolveDatabaseUrls({ DATABASE_URL: `${pooler}:6543/postgres?pgbouncer=true&connection_limit=3` })!;
    expect(new URL(r.url).searchParams.get("connection_limit")).toBe("3");
  });
  it("reads Vercel integration variables", () => {
    expect(resolveDatabaseUrls({ POSTGRES_PRISMA_URL: "postgres://u:p@pool:6432/db", POSTGRES_URL_NON_POOLING: "postgres://u:p@direct:5432/db" })).toEqual({
      url: "postgres://u:p@pool:6432/db",
      directUrl: "postgres://u:p@direct:5432/db",
    });
    expect(resolveDatabaseUrls({ DATABASE_URL: "postgresql://u:p@ep-x-pooler.neon.tech/db", DATABASE_URL_UNPOOLED: "postgresql://u:p@ep-x.neon.tech/db" })?.directUrl).toBe(
      "postgresql://u:p@ep-x.neon.tech/db",
    );
  });
  it("returns null without a usable URL", () => {
    expect(resolveDatabaseUrls({})).toBeNull();
    expect(resolveDatabaseUrls({ DATABASE_URL: "not a url" })).toBeNull();
  });
  it("never prints the password", () => expect(hostOf(`${pooler}:6543/postgres`)).toBe("aws-0-ap-south-1.pooler.supabase.com:6543/postgres"));
});
