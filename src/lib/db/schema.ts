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

    // 8-component macro-state vector measured at the event date, z-scored
    // against the 1260-trading-day window ending on event-date-1. Used as
    // the corpus centroid for the "Today's Regime" k-NN match. Nulls per
    // dim where the underlying series didn't exist (pre-1990 VIX, pre-1996
    // HY OAS, etc.) — distance computation handles partial vectors.
    regimeRawVector: jsonb("regime_raw_vector").$type<Array<number | null>>(),
    regimeZVector: jsonb("regime_z_vector").$type<Array<number | null>>(),

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

/**
 * Daily regime snapshot — the 8-component macro-state vector measured at
 * close. Persisted forever so we can: (a) reconstruct the rolling z-score
 * window without re-fetching FRED, (b) ship a "drift" view showing how
 * today's regime has evolved relative to history, (c) audit any past
 * "Today's Regime" brief.
 *
 * The vector schema is documented in lib/regime/vector.ts.
 */
export const regimeSnapshots = pgTable("regime_snapshots", {
  // ISO date, primary key — one row per market day.
  date: text("date").primaryKey(),
  // Raw values per series (8 numbers, nulls where not available historically).
  rawVector: jsonb("raw_vector").$type<Array<number | null>>().notNull(),
  // z-scored values against the trailing 1260-day window of rawVector.
  zVector: jsonb("z_vector").$type<Array<number | null>>().notNull(),
  // Audit metadata: which sources answered, lookup latencies, fallback hits.
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type RegimeSnapshotRow = typeof regimeSnapshots.$inferSelect;
export type NewRegimeSnapshotRow = typeof regimeSnapshots.$inferInsert;

/**
 * Daily matches: top-K nearest historical regimes for a given snapshot,
 * plus the chosen "negative analogue" (similar setup, opposite outcome).
 *
 * Persisted so the publish step (cron 2) can read yesterday's matches
 * without re-running the Mahalanobis pass.
 */
export const dailyMatches = pgTable("daily_matches", {
  date: text("date").primaryKey(), // FK→regime_snapshots.date
  // Ranked array of {eventId, distance, similarity} for the top-K positives.
  positives: jsonb("positives")
    .$type<Array<{ eventId: string; distance: number; similarity: number }>>()
    .notNull(),
  // Single negative-analogue {eventId, distance, similarity, disambiguator}.
  // null when no good negative is available (rare — usually only when corpus
  // sub-1990 coverage is the only match).
  negative: jsonb("negative")
    .$type<{
      eventId: string;
      distance: number;
      similarity: number;
      disambiguator: string;
    } | null>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type DailyMatchesRow = typeof dailyMatches.$inferSelect;

/**
 * Daily brief — the LLM-synthesised piece. One per market day. Persisted
 * so /today/[date] permalinks are stable and the publish cron is a pure
 * read.
 */
export const dailyBriefs = pgTable("daily_briefs", {
  date: text("date").primaryKey(), // FK→regime_snapshots.date
  payload: jsonb("payload").notNull(),
  modelSynth: text("model_synth").notNull(),
  corpusVersion: text("corpus_version").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type DailyBriefRow = typeof dailyBriefs.$inferSelect;

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
