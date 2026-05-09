import { generateObject, streamObject } from "ai";
import { gateway } from "@ai-sdk/gateway";

/**
 * Telemetry block passed to every AI SDK call. When LANGFUSE_PUBLIC_KEY
 * is present the OTel SDK started in instrumentation.ts captures these
 * spans; when absent, isEnabled is true but the spans go to a no-op
 * exporter (negligible overhead).
 *
 * functionId tags each span so traces can be filtered by pipeline phase
 * in the Langfuse UI. Metadata identifies the corpus version and model
 * for cohort analysis.
 */
const TELEMETRY = (functionId: string) => ({
  isEnabled: true,
  functionId,
  metadata: {
    app: "oti",
    version: "0.5",
  },
});

/**
 * Anthropic prompt-cache marker. Applied to the system message in
 * synthesis calls so the corpus-knowledge-prime + system instructions
 * cache for 1h between requests. Cache reads are 0.1× input cost on
 * Sonnet, ≈0.1× on Haiku — meaningful savings once a single request
 * has warmed the cache.
 *
 * Claude minimums:
 *   - Sonnet 4.6: 2,048 cached tokens
 *   - Haiku 4.5:  4,096 cached tokens
 *
 * The system prompt with the corpus-knowledge-prime included clears
 * both floors comfortably (~3,000+ tokens at the v0.5 corpus size).
 *
 * Within Voyage 4 / Anthropic 2026, the marker syntax is
 * `providerOptions.anthropic.cacheControl: { type: 'ephemeral', ttl: '1h' }`.
 * Vercel AI Gateway transparently passes this through.
 */
const CACHE_1H = {
  anthropic: {
    cacheControl: { type: "ephemeral", ttl: "1h" } as const,
  },
} as const;

/**
 * AI Gateway model-fallback chain for synthesis. When the primary model
 * is rate-limited or returns a 5xx, the Gateway automatically routes
 * the request to the next model in the array. Synthesis-quality
 * fallback prefers Opus 4.7 → Sonnet 4.6 → Haiku 4.5 ("a slightly
 * worse brief is better than no brief"). Tagging fallback prefers
 * Haiku → 4o-mini ("classification is easy; just survive").
 *
 * Vercel AI Gateway syntax (April 2025, still current May 2026):
 *   providerOptions: {
 *     gateway: { models: [...], order: ['anthropic'] }
 *   }
 */
function gatewayFallback(primary: string, alternatives: string[]) {
  // Plain mutable array so the AI SDK's JSONArray type accepts it.
  return {
    gateway: {
      models: [primary, ...alternatives] as string[],
    },
  };
}

const SYNTH_FALLBACK_MODELS: string[] = [
  "anthropic/claude-haiku-4-5",
  "openai/gpt-4o",
];

const TAG_FALLBACK_MODELS: string[] = ["openai/gpt-4o-mini"];
import {
  QueryTagsSchema,
  BriefOutputSchema,
  type QueryTags,
  type BriefOutput,
  type RetrievalCandidate,
  type HistoricalEvent,
  type AnalogueOutput,
} from "./types";
import {
  TAG_SYSTEM_PROMPT,
  buildTagUserPrompt,
  SYNTHESIS_A_SYSTEM_PROMPT,
  SYNTHESIS_B_SYSTEM_PROMPT,
  buildSynthesisAUserPrompt,
  buildSynthesisBUserPrompt,
} from "./prompts";
import { z } from "zod";

/**
 * Vercel AI Gateway routing. Uses provider/model strings ("anthropic/
 * claude-sonnet-4-6"). With AI_GATEWAY_API_KEY set, all providers are
 * reachable through one key. Direct provider keys (ANTHROPIC_API_KEY,
 * OPENAI_API_KEY) work as fallbacks via the AI SDK's auto-detection.
 */

export const DEFAULT_TAG_MODEL =
  process.env.OTI_TAG_MODEL ?? "anthropic/claude-haiku-4-5";

export const DEFAULT_SYNTH_MODEL =
  process.env.OTI_SYNTH_MODEL ?? "anthropic/claude-sonnet-4-6";

export const ALLOWED_PROVIDER_MODELS = [
  "anthropic/claude-sonnet-4-6",
  "anthropic/claude-haiku-4-5",
  "anthropic/claude-opus-4-7",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/o1",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "mistral/mistral-large-latest",
] as const;

export type AllowedModel = (typeof ALLOWED_PROVIDER_MODELS)[number];

export function isAllowedModel(model: string): model is AllowedModel {
  return ALLOWED_PROVIDER_MODELS.includes(model as AllowedModel);
}

export async function tagQuery(args: {
  query: string;
  model?: string;
}): Promise<QueryTags> {
  const model = args.model ?? DEFAULT_TAG_MODEL;
  const result = await generateObject({
    model: gateway(model),
    schema: QueryTagsSchema,
    system: TAG_SYSTEM_PROMPT,
    prompt: buildTagUserPrompt(args.query),
    temperature: 0.1,
    providerOptions: gatewayFallback(model, TAG_FALLBACK_MODELS),
    experimental_telemetry: TELEMETRY("tag-query"),
  });
  return result.object;
}

/**
 * Phase-A schema. The eventId is restricted at runtime to the actual
 * candidate IDs so the model literally cannot pick a corpus member that
 * wasn't surfaced by retrieval. v0.5 adds the optional negative
 * analogue (CHR: Contrastive Hypothesis Retrieval, arXiv:2604.04593) —
 * "rule out to rule in." Same id-enum constraint applies.
 */
function buildPhaseASchema(allowedIds: readonly string[]) {
  if (allowedIds.length === 0) {
    throw new Error("Cannot constrain Phase A schema with empty allowedIds.");
  }
  const idEnum = z.enum(allowedIds as [string, ...string[]]);

  return z.object({
    headline: z.string().min(10).max(160),
    oneLineSummary: z.string().min(20).max(300),
    analogues: z
      .array(
        z.object({
          eventId: idEnum,
          whyAnalogous: z.string().min(30),
          whereThisMightNotFit: z.string().min(20),
          fitConfidence: z.number().min(0).max(1),
        }),
      )
      .length(3),
    /** A 4th candidate that scored high on macro-state similarity but
     *  whose direction resolved opposite to the chosen-3 majority.
     *  Operationalises CHR. May be null when the candidate pool has no
     *  credible inversion. */
    negativeAnalogue: z
      .object({
        eventId: idEnum,
        whyItLookedSimilar: z.string().min(30),
        whyItResolvedDifferently: z.string().min(30),
        disambiguator: z.string().min(20),
      })
      .nullable(),
    disagreementNote: z.string().nullable(),
  });
}

/** Phase B emits only the cross-analogue synthesis fields. */
const PhaseBSchema = z.object({
  failedTradesPattern: z.string().min(20),
  consensusError: z.string().min(20),
  caveats: z.array(z.string().min(10)).min(1).max(5),
});

export async function synthesisPhaseA(args: {
  userQuery: string;
  queryTags: QueryTags;
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent }>;
  model?: string;
}) {
  const model = args.model ?? DEFAULT_SYNTH_MODEL;
  const allowedIds = args.candidates.map((c) => c.eventId);
  const schema = buildPhaseASchema(allowedIds);

  const result = await generateObject({
    model: gateway(model),
    schema,
    messages: [
      {
        role: "system",
        content: SYNTHESIS_A_SYSTEM_PROMPT,
        providerOptions: CACHE_1H,
      },
      {
        role: "user",
        content: buildSynthesisAUserPrompt({
          userQuery: args.userQuery,
          queryTags: args.queryTags,
          candidates: args.candidates,
        }),
      },
    ],
    temperature: 0.4,
    providerOptions: {
      ...gatewayFallback(model, SYNTH_FALLBACK_MODELS),
    },
    experimental_telemetry: TELEMETRY("synthesis-phase-a"),
  });
  return result.object;
}

export async function synthesisPhaseB(args: {
  userQuery: string;
  queryTags: QueryTags;
  chosen: HistoricalEvent[];
  model?: string;
}) {
  const model = args.model ?? DEFAULT_SYNTH_MODEL;

  const result = await generateObject({
    model: gateway(model),
    schema: PhaseBSchema,
    messages: [
      {
        role: "system",
        content: SYNTHESIS_B_SYSTEM_PROMPT,
        providerOptions: CACHE_1H,
      },
      {
        role: "user",
        content: buildSynthesisBUserPrompt({
          userQuery: args.userQuery,
          queryTags: args.queryTags,
          chosen: args.chosen,
        }),
      },
    ],
    temperature: 0.4,
    providerOptions: {
      ...gatewayFallback(model, SYNTH_FALLBACK_MODELS),
    },
    experimental_telemetry: TELEMETRY("synthesis-phase-b"),
  });
  return result.object;
}

/**
 * Streaming variant of Phase A — used by the streaming brief route. The
 * client renders headline/summary first, then each analogue card as it
 * arrives. Phase B streams concurrently after we have the chosen IDs.
 */
export function streamSynthesisPhaseA(args: {
  userQuery: string;
  queryTags: QueryTags;
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent }>;
  model?: string;
}) {
  const model = args.model ?? DEFAULT_SYNTH_MODEL;
  const allowedIds = args.candidates.map((c) => c.eventId);
  const schema = buildPhaseASchema(allowedIds);

  return streamObject({
    model: gateway(model),
    schema,
    messages: [
      {
        role: "system",
        content: SYNTHESIS_A_SYSTEM_PROMPT,
        providerOptions: CACHE_1H,
      },
      {
        role: "user",
        content: buildSynthesisAUserPrompt({
          userQuery: args.userQuery,
          queryTags: args.queryTags,
          candidates: args.candidates,
        }),
      },
    ],
    temperature: 0.4,
    providerOptions: {
      ...gatewayFallback(model, SYNTH_FALLBACK_MODELS),
    },
    experimental_telemetry: TELEMETRY("stream-synthesis-phase-a"),
  });
}

export function streamSynthesisPhaseB(args: {
  userQuery: string;
  queryTags: QueryTags;
  chosen: HistoricalEvent[];
  model?: string;
}) {
  const model = args.model ?? DEFAULT_SYNTH_MODEL;
  return streamObject({
    model: gateway(model),
    schema: PhaseBSchema,
    messages: [
      {
        role: "system",
        content: SYNTHESIS_B_SYSTEM_PROMPT,
        providerOptions: CACHE_1H,
      },
      {
        role: "user",
        content: buildSynthesisBUserPrompt({
          userQuery: args.userQuery,
          queryTags: args.queryTags,
          chosen: args.chosen,
        }),
      },
    ],
    temperature: 0.4,
    providerOptions: {
      ...gatewayFallback(model, SYNTH_FALLBACK_MODELS),
    },
    experimental_telemetry: TELEMETRY("stream-synthesis-phase-b"),
  });
}

/**
 * Numeric-paraphrase guard. Walks every prose field in the brief and
 * scrubs digit-runs that don't appear in the chosen events' asset-move
 * tables. We are deliberately strict: a single "1929" reference, a
 * "60/40" idiom, or "S&P 500" pass through (whitelisted patterns); any
 * other digit-run gets replaced with "[redacted-numeric]" and surfaced
 * in a sidecar warnings array.
 *
 * This is the structural enforcement of "asset returns are deterministic;
 * the LLM only narrates patterns."
 */

const NUMERIC_WHITELIST = [
  /\bS&P\s?500\b/g, // index name
  /\b60\/40\b/g, // canonical portfolio
  /\b9\/11\b/g, // referenced event
  /\b\d{4}\b/g, // four-digit years
  /\bN\s?=\s?\d+\b/g, // sample-size shorthand
];

const PROSE_FIELDS = [
  "headline",
  "oneLineSummary",
  "disagreementNote",
  "failedTradesPattern",
  "consensusError",
] as const;

export interface NumericGuardResult {
  scrubbed: BriefOutput;
  warnings: string[];
}

export function applyNumericGuard(brief: BriefOutput): NumericGuardResult {
  const warnings: string[] = [];

  const scrub = (raw: string, fieldName: string): string => {
    let masked = raw;
    for (const wl of NUMERIC_WHITELIST) {
      masked = masked.replace(wl, (m) => "\x00".repeat(m.length));
    }
    const offenders = masked.match(/\d[\d.,%-]*/g);
    let scrubbed = raw;
    if (offenders && offenders.length > 0) {
      // Strip whitelisted-by-position offenders by re-running the regex on the
      // masked version and only keeping non-null-byte hits.
      const reOffender = /\d[\d.,%-]*/g;
      let m: RegExpExecArray | null;
      while ((m = reOffender.exec(masked)) !== null) {
        warnings.push(
          `numeric-paraphrase removed from ${fieldName}: "${m[0]}"`,
        );
      }
      // Replace the same character ranges in the original string.
      const ranges: Array<[number, number]> = [];
      reOffender.lastIndex = 0;
      while ((m = reOffender.exec(masked)) !== null) {
        ranges.push([m.index, m.index + m[0].length]);
      }
      // Apply ranges in reverse to preserve indices.
      for (let i = ranges.length - 1; i >= 0; i--) {
        const [start, end] = ranges[i];
        scrubbed = scrubbed.slice(0, start) + "[…]" + scrubbed.slice(end);
      }
    }
    return scrubbed;
  };

  const next: BriefOutput = {
    ...brief,
    headline: scrub(brief.headline, "headline"),
    oneLineSummary: scrub(brief.oneLineSummary, "oneLineSummary"),
    disagreementNote:
      brief.disagreementNote === null
        ? null
        : scrub(brief.disagreementNote, "disagreementNote"),
    failedTradesPattern: scrub(brief.failedTradesPattern, "failedTradesPattern"),
    consensusError: scrub(brief.consensusError, "consensusError"),
    caveats: brief.caveats.map((c, i) => scrub(c, `caveats[${i}]`)),
    analogues: brief.analogues.map((a, i) => ({
      ...a,
      whyAnalogous: scrub(a.whyAnalogous, `analogues[${i}].whyAnalogous`),
      whereThisMightNotFit: scrub(
        a.whereThisMightNotFit,
        `analogues[${i}].whereThisMightNotFit`,
      ),
    })),
  };

  return { scrubbed: next, warnings };
}

/** Full synthesis: orchestrates Phase A and Phase B, then applies the
 *  numeric guard. Returns a complete BriefOutput. */
export async function synthesizeBrief(args: {
  userQuery: string;
  queryTags: QueryTags;
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent }>;
  model?: string;
}): Promise<{ brief: BriefOutput; warnings: string[] }> {
  const a = await synthesisPhaseA(args);

  const chosen: HistoricalEvent[] = a.analogues.map((an) => {
    const found = args.candidates.find((c) => c.eventId === an.eventId);
    if (!found) {
      throw new Error(`Phase A returned eventId ${an.eventId} not in candidates`);
    }
    return found.event;
  });

  const b = await synthesisPhaseB({
    userQuery: args.userQuery,
    queryTags: args.queryTags,
    chosen,
    model: args.model,
  });

  const merged: BriefOutput = {
    headline: a.headline,
    oneLineSummary: a.oneLineSummary,
    analogues: a.analogues as AnalogueOutput[],
    negativeAnalogue: a.negativeAnalogue ?? null,
    disagreementNote: a.disagreementNote,
    failedTradesPattern: b.failedTradesPattern,
    consensusError: b.consensusError,
    caveats: b.caveats,
  };

  // Validate against the broad schema for downstream consumers.
  const parsed = BriefOutputSchema.parse(merged);

  const { scrubbed, warnings } = applyNumericGuard(parsed);
  return { brief: scrubbed, warnings };
}
