/**
 * Seed Postgres with the curated events corpus.
 *
 *   pnpm seed
 *
 * Requires POSTGRES_URL set. Idempotent: deletes and re-inserts.
 * Embeddings are populated separately via `pnpm embeddings`.
 */

import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb, schema } from "../src/lib/db/client";
import { EVENTS } from "../src/lib/events";

async function main() {
  const db = getDb();

  console.log("[seed] enabling pgvector extension if missing...");
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);

  console.log("[seed] truncating events table...");
  await db.execute(sql`TRUNCATE TABLE events`);

  console.log(`[seed] inserting ${EVENTS.length} events...`);
  for (const e of EVENTS) {
    await db.insert(schema.events).values({
      id: e.id,
      title: e.title,
      date: e.date,
      region: e.region,
      triggerType: e.triggerType,
      regimeTags: e.regimeTags,
      surpriseFactor: e.surpriseFactor,
      description: e.description,
      catalyst: e.catalyst,
      narrativeAtTime: e.narrativeAtTime,
      outcomeInHindsight: e.outcomeInHindsight,
      assetMoves: e.assetMoves,
      flowPatterns: e.flowPatterns,
      failedTrades: e.failedTrades,
      consensusError: e.consensusError,
      lessons: e.lessons,
      sources: e.sources,
    });
  }
  console.log("[seed] done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
