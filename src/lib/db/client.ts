import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env.POSTGRES_URL;

/**
 * Lazy DB client. The app must work end-to-end without a database for
 * the demo and local-development flows; only the seed/embeddings scripts
 * require a real Postgres connection.
 */
let _client: postgres.Sql | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;
  if (!url) {
    throw new Error(
      "POSTGRES_URL is not set. Install Neon from the Vercel Marketplace, or set it in .env.local.",
    );
  }
  _client = postgres(url, { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

export { schema };
