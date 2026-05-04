import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  vector,
} from "drizzle-orm/pg-core";
import type {
  AssetMoves,
  FailedTrade,
  Source,
  RegimeTag,
  TriggerType,
  Region,
} from "@/lib/types";

/**
 * The events corpus. Mirrors HistoricalEvent in lib/types.ts.
 * Curated by hand. Embedding column populated by `pnpm embeddings`
 * when an embedding-capable provider key is present; otherwise
 * retrieval falls back to deterministic Jaccard scoring only.
 */
export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    date: text("date").notNull(),
    region: text("region").$type<Region>().notNull(),
    triggerType: text("trigger_type").$type<TriggerType>().notNull(),
    regimeTags: jsonb("regime_tags").$type<RegimeTag[]>().notNull(),
    surpriseFactor: integer("surprise_factor").notNull(),

    description: text("description").notNull(),
    catalyst: text("catalyst").notNull(),
    narrativeAtTime: text("narrative_at_time").notNull(),
    outcomeInHindsight: text("outcome_in_hindsight").notNull(),

    assetMoves: jsonb("asset_moves").$type<AssetMoves>().notNull(),
    flowPatterns: text("flow_patterns").notNull(),
    failedTrades: jsonb("failed_trades").$type<FailedTrade[]>().notNull(),
    consensusError: text("consensus_error").notNull(),
    lessons: jsonb("lessons").$type<string[]>().notNull(),
    sources: jsonb("sources").$type<Source[]>().notNull(),

    embedding: vector("embedding", { dimensions: 1536 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    embeddingIndex: index("events_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  }),
);

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
