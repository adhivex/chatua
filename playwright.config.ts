import { randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// The suite builds and starts its own production server against a dedicated *_e2e database,
// which it migrates and seeds (create-only) on every run; tests undo the catalogue edits they make. It never touches the dev or preview databases.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const db = process.env.E2E_DATABASE_URL ?? (process.env.TEST_DATABASE_URL ?? "").replace(/_test$/, "_e2e");
if (!/_e2e$/.test(db)) throw new Error("E2E_DATABASE_URL must point at a database whose name ends in _e2e");

export const E2E_ADMIN = { email: "admin@e2e.test", password: "e2e-admin-password-123" };
const salt = randomBytes(16);
const hash = ["scrypt", 16384, 8, 1, salt.toString("base64url"), scryptSync(E2E_ADMIN.password, salt, 32, { N: 16384, r: 8, p: 1 }).toString("base64url")].join(":");

const PORT = 3101;
const env = {
  DATABASE_URL: db,
  DIRECT_URL: db,
  NEXT_DIST_DIR: ".next-e2e",
  NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${PORT}`,
  PAYMENT_PROVIDER: "mock",
  ADMIN_EMAIL: E2E_ADMIN.email,
  ADMIN_PASSWORD_HASH: hash,
  SESSION_SECRET: randomBytes(32).toString("hex"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: "",
  PRISMA_HIDE_UPDATE_MESSAGE: "1",
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "retain-on-failure", ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
  webServer: {
    command: `npx prisma migrate deploy && npx prisma db seed && npx next build && npx next start -H 127.0.0.1 -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/robots.txt`,
    env,
    timeout: 240_000,
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "pipe",
  },
});
