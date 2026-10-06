import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";
import { applyDatabaseUrls } from "./src/lib/database-url";

// Prisma does not read .env.local. Load it (then .env) without overriding variables that are
// already set, so production env files and CI variables always win.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
// Map host-specific variables (Vercel integrations, Supabase poolers) to DATABASE_URL / DIRECT_URL.
applyDatabaseUrls(process.env, true);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
