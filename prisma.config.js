import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
