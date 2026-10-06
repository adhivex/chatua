import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma does not read .env.local. Load it (then .env) without overriding variables that are
// already set, so production env files and CI variables always win.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
