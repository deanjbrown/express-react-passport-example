import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "../utils/env";

// Create a pooled connection to the PostgreSQL database
const pool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB
});

// Export the database object and its type
export const db = drizzle({ client: pool });
export type DB = typeof db;
