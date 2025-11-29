import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";
import type { PrismaConfig } from "prisma";

export default defineConfig({
  schema: path.join("src/schema", "schema.prisma"),
  migrations: {
    path: path.join("src/schema", "migrations"),
  },
  views: {
    path: path.join("src/schema", "views"),
  },
  typedSql: {
    path: path.join("src/schema", "queries"),
  },
  datasource: {
    url: env('DB_URL'),
  },
});