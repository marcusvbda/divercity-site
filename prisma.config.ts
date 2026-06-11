import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { defineConfig } from "prisma/config";

// datasource.url is used by the migration engine (needs direct/session mode, port 5432).
// Runtime queries go through the PrismaPg adapter in src/lib/prisma.ts using DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
