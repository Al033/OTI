import { z } from "zod";
import { REGIME_TAGS, TRIGGER_TYPES, REGIONS } from "./regime-tags";
export type { RegimeTag, TriggerType, Region } from "./regime-tags";

/**
 * Single source of truth for all structured data flowing through the pipeline.
 * Used by:
 *   - dataset validation at build time (data/events.ts must conform)
 *   - LLM structured output (generateObject with these schemas)
 *   - API contract between server and client
 */

export const RegimeTagSchema = z.enum(REGIME_TAGS);
export const TriggerTypeSchema = z.enum(TRIGGER_TYPES);
export const RegionSchema = z.enum(REGIONS);

/**
 * A return series at standard horizons after the event.
 * Equity returns are percentages (e.g. -7.4 means -7.4%).
 * Yield/spread changes are basis points (e.g. -42 means yields fell 42 bps).
 * VIX is in absolute level points.
 */
export const ReturnSeriesSchema = z.object({
  d1: z.number().nullable(),
  d5: z.number().nullable(),
  m1: z.number().nullable(),
  m3: z.number().nullable(),
  m6: z.number().nullable(),
});
export type ReturnSeries = z.infer<typeof ReturnSeriesSchema>;

export const AssetMovesSchema = z.object({
  sp500: ReturnSeriesSchema,
  ust10y: ReturnSeriesSchema,
  dxy: ReturnSeriesSchema,
  gold: ReturnSeriesSchema,
  oil: ReturnSeriesSchema,
  creditHY: ReturnSeriesSchema,
  vix: ReturnSeriesSchema,
});
export type AssetMoves = z.infer<typeof AssetMovesSchema>;

export const QuoteProvenanceSchema = z.enum([
  "verified", // sourceUrl present; quote checked against the source.
  "paraphrase_no_source", // contemporaneous-style paraphrase; no URL. UI shows a warning.
  "paraphrase_with_source", // paraphrase but the source is identified (e.g. an FT column without a stable URL).
]);
export type QuoteProvenance = z.infer<typeof QuoteProvenanceSchema>;

export const FailedTradeSchema = z
  .object({
    quote: z.string().min(1),
    attribution: z.string().min(1),
    sourceUrl: z.string().url().optional(),
    /** Defaults to paraphrase_no_source for backwards compatibility with v0.1 entries. */
    provenance: QuoteProvenanceSchema.default("paraphrase_no_source"),
    /** Optional Wayback Machine snapshot URL for link-rot safety. */
    archiveUrl: z.string().url().optional(),
  })
  .refine((v) => v.provenance !== "verified" || !!v.sourceUrl, {
    message: "verified provenance requires sourceUrl",
    path: ["sourceUrl"],
  });
export type FailedTrade = z.infer<typeof FailedTradeSchema>;

export const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
});
export type Source = z.infer<typeof SourceSchema>;

/**
 * The curated event record. The narrativeAtTime / outcomeInHindsight split
 * is the core defence against look-ahead bias: synthesis prompts only see
 * narrativeAtTime when reasoning about analogousness.
 */
export const HistoricalEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  region: RegionSchema,
  triggerType: TriggerTypeSchema,
  regimeTags: z.array(RegimeTagSchema).min(2),
  surpriseFactor: z.number().int().min(1).max(5),

  description: z.string().min(40),
  catalyst: z.string().min(20),
  narrativeAtTime: z.string().min(40),
  outcomeInHindsight: z.string().min(40),

  assetMoves: AssetMovesSchema,
  flowPatterns: z.string().min(20),
  failedTrades: z.array(FailedTradeSchema),
  consensusError: z.string().min(20),
  lessons: z.array(z.string().min(8)).min(1),
  sources: z.array(SourceSchema).min(1),
  embedding: z.array(z.number()).optional(),
});
export type HistoricalEvent = z.infer<typeof HistoricalEventSchema>;

/**
 * Output of the tagging pass. Same shape as the user-event side of an
 * analogue match — used as the query vector against the corpus.
 */
export const QueryTagsSchema = z.object({
  triggerType: TriggerTypeSchema,
  regimeTags: z.array(RegimeTagSchema).min(2).max(10),
  region: RegionSchema,
  surpriseFactor: z.number().int().min(1).max(5),
  assetFocus: z.array(z.string()).max(8),
  dateHint: z.string().nullable(),
  rationale: z.string(),
});
export type QueryTags = z.infer<typeof QueryTagsSchema>;

/**
 * The final brief. The LLM emits this via generateObject. Fields like
 * eventId are constrained at runtime to the actual corpus ids — the LLM
 * cannot hallucinate events that aren't in the dataset.
 */
export const AnalogueOutputSchema = z.object({
  eventId: z.string(),
  whyAnalogous: z.string().min(30),
  whereThisMightNotFit: z.string().min(20),
  fitConfidence: z.number().min(0).max(1),
});
export type AnalogueOutput = z.infer<typeof AnalogueOutputSchema>;

export const BriefOutputSchema = z.object({
  headline: z.string().min(10).max(160),
  oneLineSummary: z.string().min(20).max(300),
  analogues: z.array(AnalogueOutputSchema).length(3),
  disagreementNote: z.string().nullable().describe(
    "Set if the three analogues' likely paths conflict; null otherwise.",
  ),
  failedTradesPattern: z
    .string()
    .min(20)
    .describe("What kinds of obvious-looking trades failed across the analogues."),
  consensusError: z
    .string()
    .min(20)
    .describe("The common pattern in where consensus was wrong across analogues."),
  caveats: z.array(z.string().min(10)).min(1).max(5),
});
export type BriefOutput = z.infer<typeof BriefOutputSchema>;

export const RetrievalCandidateSchema = z.object({
  eventId: z.string(),
  jaccard: z.number().min(0).max(1),
  cosine: z.number().min(-1).max(1).nullable(),
  combined: z.number().min(0).max(1),
  rerankScore: z.number().nullable().optional(),
});
export type RetrievalCandidate = z.infer<typeof RetrievalCandidateSchema>;

export const RetrievalAuditSchema = z.object({
  embeddingsSource: z.enum(["db", "sidecar", "none"]),
  rerankUsed: z.boolean(),
  topKBeforeRerank: z.number().int(),
  topKAfterRerank: z.number().int(),
  embeddingModel: z.string(),
  rerankModel: z.string().nullable(),
  /** History Rhymes-style fused retrieval. True when the cosine signal
   *  used [t; α·z] fusion against today's regime vector. */
  fusedRetrieval: z.boolean().optional(),
  /** When fused, the α used. */
  fusionAlpha: z.number().optional(),
  /** Number of paraphrase queries fused via RRF (1 = no expansion). */
  multiQueryCount: z.number().int().optional(),
});
export type RetrievalAudit = z.infer<typeof RetrievalAuditSchema>;

export const PipelineResultSchema = z.object({
  query: z.string(),
  queryTags: QueryTagsSchema,
  candidates: z.array(RetrievalCandidateSchema),
  brief: BriefOutputSchema,
  modelTag: z.string(),
  modelSynth: z.string(),
  durationMs: z.number(),
  generatedAt: z.string(),
  isDemo: z.boolean(),
  corpusVersion: z.string(),
  retrievalAudit: RetrievalAuditSchema,
});
export type PipelineResult = z.infer<typeof PipelineResultSchema>;
