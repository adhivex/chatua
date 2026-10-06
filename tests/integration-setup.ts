// Points Prisma at the throwaway test database before any app module loads.
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (!process.env.TEST_DATABASE_URL) throw new Error("Set TEST_DATABASE_URL to run integration tests");
if (!/_test\b/.test(process.env.TEST_DATABASE_URL)) throw new Error("TEST_DATABASE_URL must point at a *_test database");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
process.env.PAYMENT_PROVIDER = "mock";
