import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  // @ts-expect-error Prisma typing mismatch: string shortcut is supported at runtime
  datasource: "DATABASE_URL",
  // Use DATABASE_URL from environment in production (no hardcoded datasource)
});
