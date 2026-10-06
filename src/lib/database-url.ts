// Resolves the database connection strings from whatever the host provides, so the same code works
// on the VPS (DATABASE_URL + DIRECT_URL), Vercel's Supabase/Neon integrations (POSTGRES_* and
// DATABASE_URL_UNPOOLED) and Supabase's poolers. Used by prisma.config.ts, the app and the seed.
// Plain module (no "server-only") because prisma.config.ts imports it.

type Env = Record<string, string | undefined>;

const SUPABASE_POOLER = /\.pooler\.supabase\.com$/i;

function parse(url: string | undefined): URL | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol.startsWith("postgres") ? u : null;
  } catch {
    return null;
  }
}

/** Supabase transaction pooler (port 6543) cannot run migrations and needs pgbouncer=true for Prisma. */
const isTransactionPooler = (u: URL) => SUPABASE_POOLER.test(u.hostname) && u.port === "6543";

export function resolveDatabaseUrls(env: Env = process.env): { url: string; directUrl: string } | null {
  const pooledRaw = env.DATABASE_URL || env.POSTGRES_PRISMA_URL || env.POSTGRES_URL;
  const pooled = parse(pooledRaw);
  if (!pooled) return null;

  if (isTransactionPooler(pooled) && !pooled.searchParams.has("pgbouncer")) {
    pooled.searchParams.set("pgbouncer", "true");
    if (!pooled.searchParams.has("connection_limit")) pooled.searchParams.set("connection_limit", "1");
  }

  let direct = parse(env.DIRECT_URL || env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING);
  if (!direct) {
    direct = new URL(pooled.toString());
    // Same Supabase pooler host in session mode (port 5432) supports migrations.
    if (isTransactionPooler(direct)) direct.port = "5432";
    direct.searchParams.delete("pgbouncer");
    direct.searchParams.delete("connection_limit");
  }
  return { url: pooled.toString(), directUrl: direct.toString() };
}

/** Writes the resolved values back to DATABASE_URL / DIRECT_URL (what prisma/schema.prisma reads). */
export function applyDatabaseUrls(env: Env = process.env, log = false): boolean {
  const r = resolveDatabaseUrls(env);
  if (!r) {
    if (log) console.error("[db] No database configured: set DATABASE_URL (and DIRECT_URL for migrations).");
    return false;
  }
  env.DATABASE_URL = r.url;
  env.DIRECT_URL = r.directUrl;
  if (log) console.log(`[db] using ${describe(r.url)} (migrations: ${describe(r.directUrl)})`);
  return true;
}

/** Host, port and database only; never the password. */
export function describe(url: string): string {
  const u = new URL(url);
  return `${u.hostname}:${u.port || "5432"}${u.pathname}`;
}
