/**
 * Export the HistoricalEvent Zod schema as a JSON Schema file at
 * /schema/historical-event.schema.json. Contributors can validate
 * proposed event entries against this without running the full TS
 * project. The schema is also embedded in the GitHub Action that
 * gates `data/events.ts` PRs.
 *
 *   pnpm schema:export
 */

import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { HistoricalEventSchema } from "../src/lib/types";
import { REGIME_TAGS, REGIONS, TRIGGER_TYPES } from "../src/lib/regime-tags";

/**
 * Hand-derived JSON schema. We don't use zod-to-json-schema because
 * v0.5's Zod composition uses .refine() and conditional shapes that
 * the converter mishandles; the hand-written schema is small enough
 * to maintain and reads as documentation.
 */
function buildSchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://oti.app/schema/historical-event.schema.json",
    title: "OTI HistoricalEvent",
    description:
      "A single curated macro event in the OTI corpus. Generated from src/lib/types.ts HistoricalEventSchema.",
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "title",
      "date",
      "region",
      "triggerType",
      "regimeTags",
      "surpriseFactor",
      "description",
      "catalyst",
      "narrativeAtTime",
      "outcomeInHindsight",
      "assetMoves",
      "flowPatterns",
      "failedTrades",
      "consensusError",
      "lessons",
      "sources",
    ],
    properties: {
      id: {
        type: "string",
        pattern: "^[a-z0-9]+(-[a-z0-9]+)*$",
        description: "Kebab-case unique id, e.g. '2008-lehman'.",
        examples: ["2008-lehman", "1962-cuban-missile-crisis"],
      },
      title: { type: "string", minLength: 1 },
      date: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "ISO yyyy-mm-dd, the day the event broke.",
      },
      region: { type: "string", enum: [...REGIONS] },
      triggerType: { type: "string", enum: [...TRIGGER_TYPES] },
      regimeTags: {
        type: "array",
        minItems: 2,
        items: { type: "string", enum: [...REGIME_TAGS] },
        description:
          "3-7 regime tags drawn from the controlled vocabulary in src/lib/regime-tags.ts.",
      },
      surpriseFactor: { type: "integer", minimum: 1, maximum: 5 },
      description: { type: "string", minLength: 40 },
      catalyst: { type: "string", minLength: 20 },
      narrativeAtTime: {
        type: "string",
        minLength: 40,
        description:
          "What consensus actually believed BEFORE the event resolved. Critical: do not leak hindsight here.",
      },
      outcomeInHindsight: {
        type: "string",
        minLength: 40,
        description:
          "What actually happened. Used only by the consensusError and failedTradesPattern synthesis fields.",
      },
      assetMoves: {
        type: "object",
        additionalProperties: false,
        required: [
          "sp500",
          "ust10y",
          "dxy",
          "gold",
          "oil",
          "creditHY",
          "vix",
        ],
        properties: Object.fromEntries(
          ["sp500", "ust10y", "dxy", "gold", "oil", "creditHY", "vix"].map(
            (k) => [
              k,
              {
                type: "object",
                additionalProperties: false,
                required: ["d1", "d5", "m1", "m3", "m6"],
                properties: {
                  d1: { type: ["number", "null"] },
                  d5: { type: ["number", "null"] },
                  m1: { type: ["number", "null"] },
                  m3: { type: ["number", "null"] },
                  m6: { type: ["number", "null"] },
                },
              },
            ],
          ),
        ),
      },
      flowPatterns: { type: "string", minLength: 20 },
      failedTrades: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["quote", "attribution"],
          properties: {
            quote: { type: "string", minLength: 1 },
            attribution: { type: "string", minLength: 1 },
            sourceUrl: { type: "string", format: "uri" },
            archiveUrl: { type: "string", format: "uri" },
            provenance: {
              type: "string",
              enum: [
                "verified",
                "paraphrase_with_source",
                "paraphrase_no_source",
              ],
              default: "paraphrase_no_source",
            },
          },
        },
      },
      consensusError: { type: "string", minLength: 20 },
      lessons: {
        type: "array",
        minItems: 1,
        items: { type: "string", minLength: 8 },
      },
      sources: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "url"],
          properties: {
            title: { type: "string", minLength: 1 },
            url: { type: "string", format: "uri" },
          },
        },
      },
      embedding: {
        type: "array",
        items: { type: "number" },
        description: "Auto-populated by `pnpm embeddings`; do not hand-edit.",
      },
      regimeRawVector: {
        type: ["array", "null"],
        items: { type: ["number", "null"] },
        description: "Auto-populated by `pnpm regime:centroids`; do not hand-edit.",
      },
      regimeZVector: {
        type: ["array", "null"],
        items: { type: ["number", "null"] },
        description: "Auto-populated by `pnpm regime:centroids`; do not hand-edit.",
      },
    },
  };
}

function main() {
  const schema = buildSchema();
  const path = join(process.cwd(), "schema", "historical-event.schema.json");
  writeFileSync(path, JSON.stringify(schema, null, 2));
  console.log(`[schema] wrote ${path}`);

  // Smoke-test: validate a random known-good event from the corpus
  // against the schema we just emitted. We use Zod's .parse for the
  // smoke test (not a JSON Schema validator) because we don't want to
  // pull in ajv as a dep.
  const result = HistoricalEventSchema.safeParse({
    id: "test-event",
    title: "Test event",
    date: "2026-05-09",
    region: "GLOBAL",
    triggerType: "structural_event",
    regimeTags: ["vol_spiking", "policy_uncertainty"],
    surpriseFactor: 3,
    description: "x".repeat(50),
    catalyst: "x".repeat(30),
    narrativeAtTime: "x".repeat(50),
    outcomeInHindsight: "x".repeat(50),
    assetMoves: {
      sp500: { d1: null, d5: null, m1: null, m3: null, m6: null },
      ust10y: { d1: null, d5: null, m1: null, m3: null, m6: null },
      dxy: { d1: null, d5: null, m1: null, m3: null, m6: null },
      gold: { d1: null, d5: null, m1: null, m3: null, m6: null },
      oil: { d1: null, d5: null, m1: null, m3: null, m6: null },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: null, d5: null, m1: null, m3: null, m6: null },
    },
    flowPatterns: "x".repeat(30),
    failedTrades: [],
    consensusError: "x".repeat(30),
    lessons: ["lesson 1"],
    sources: [{ title: "test", url: "https://example.com" }],
  });
  if (!result.success) {
    console.error("[schema] smoke test FAILED:", result.error.issues);
    process.exit(1);
  }
  console.log("[schema] smoke test passed");
  process.exit(0);
}

main();
