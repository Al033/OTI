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

    // 1024d matches voyage-3-large's recommended Matryoshka tier
    // (best accuracy-to-storage ratio per Voyage's docs).
    embedding: vector("embedding", { dimensions: 1024 }),

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

/**
 * Cached briefs for share-link/deep-link UX. Generated briefs get a stable
 * id (hash of query + model + corpus version) and 30-day TTL.
 */
export const briefs = pgTable("briefs", {
  id: text("id").primaryKey(),
  query: text("query").notNull(),
  modelTag: text("model_tag").notNull(),
  modelSynth: text("model_synth").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type BriefRow = typeof briefs.$inferSelect;
export type NewBriefRow = typeof briefs.$inferInsert;

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
