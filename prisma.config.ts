import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: {
      fromEnvVar: "DATABASE_URL",
    },
  },
  // Use DATABASE_URL from environment in production (no hardcoded datasource)
});
