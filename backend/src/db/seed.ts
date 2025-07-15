import { sql, Table } from "drizzle-orm";
import { db, DB } from ".";
import * as schema from "./schema";
import * as seeds from "./seeds";

/**
 *
 * @param db - The database to perform the action on
 * @param table Table to reset
 * @returns The result of the SQL action
 */
async function resetTable(db: DB, table: Table) {
  return db.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
}

// Entry point
async function main() {
  // Reset each table
  for (const table of [schema.users, schema.posts]) {
    await resetTable(db, table);
  }
  // Seed each table
  await seeds.user(db);
  await seeds.post(db);
}

// Start the entry point
main()
  // Catch any errors
  .catch((e: string) => {
    console.error(e);
    process.exit(1);
  })
  // Print the success message and exit
  .finally(() => {
    console.log("Seeding completed");
    process.exit(0);
  });
