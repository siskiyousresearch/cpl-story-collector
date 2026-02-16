import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

// Use a singleton pool for serverless - reused across warm invocations
let pool: pg.Pool | undefined;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Limit connections in serverless
    });
  }
  return pool;
}

export const db = drizzle(getPool());
