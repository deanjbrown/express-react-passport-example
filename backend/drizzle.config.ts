import {defineConfig} from "drizzle-kit";
import env from "./src/utils/env";

// Export drizzle config
export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    ssl: env.POSTGRES_SSL
  },
  strict: true
});

