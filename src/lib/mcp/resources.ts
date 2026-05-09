import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { EVENTS, CORPUS_VERSION } from "@/lib/events";

/**
 * MCP Resources surface — read-only context that connected clients
 * (Claude.ai, Claude Code, Cursor) can pull into their session without
 * burning a tool-call. Resources are the "files" of the MCP world.
 *
 * URIs use the `oti://` scheme. The connected client lists resources,
 * picks the ones it wants, and pins them to its working context.
 */

interface ResourceDescriptor {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

export const MCP_RESOURCES: ReadonlyArray<ResourceDescriptor> = [
  {
    uri: "oti://corpus/events.json",
    name: "OTI Corpus — full event payloads",
    description:
      "The complete OTI macro-history corpus as JSON. 39 events spanning 1929-2025, each with structured tags, point-in-time narrative, outcome-in-hindsight, asset moves at 5 horizons, failed-trade quotes with attribution, and per-event consensusError. Pulling this as a Resource lets Claude.ai reason over the corpus without per-event tool calls.",
    mimeType: "application/json",
  },
  {
    uri: "oti://corpus/manifest.json",
    name: "OTI Corpus — slim manifest",
    description:
      "Slim version of the corpus: id, title, date, region, triggerType, regimeTags, surpriseFactor per event. Use this as a fast-load reference for discovery; pull events.json when you need full payloads.",
    mimeType: "application/json",
  },
  {
    uri: "oti://schema/historical-event.json",
    name: "OTI HistoricalEvent JSON Schema",
    description:
      "JSON Schema 2020-12 for the event payload shape. Reference this when constructing or validating event entries.",
    mimeType: "application/schema+json",
  },
  {
    uri: "oti://methodology",
    name: "OTI methodology — point-in-time defence + retrieval recipe",
    description:
      "How OTI's pipeline works: controlled-vocab tagging → voyage-finance-2 + macro-fused embeddings → Voyage rerank → two-phase synthesis with structural look-ahead defence → 7-invariant Self-Verifier → conformal-calibrated 80% coverage. Methodology, not prediction.",
    mimeType: "text/markdown",
  },
  {
    uri: "oti://corpus/version",
    name: "OTI Corpus version hash",
    description:
      "FNV-1a 32-bit hash of the corpus identity. Bumps any time an event is added, removed, or renamed. Use this to detect when cached references to corpus.json need refresh.",
    mimeType: "text/plain",
  },
];

export function readResourceContent(uri: string): ResourceContent | null {
  switch (uri) {
    case "oti://corpus/events.json": {
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          { corpusVersion: CORPUS_VERSION, count: EVENTS.length, events: EVENTS },
          null,
          2,
        ),
      };
    }
    case "oti://corpus/manifest.json": {
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            corpusVersion: CORPUS_VERSION,
            count: EVENTS.length,
            events: EVENTS.map((e) => ({
              id: e.id,
              title: e.title,
              date: e.date,
              region: e.region,
              triggerType: e.triggerType,
              regimeTags: e.regimeTags,
              surpriseFactor: e.surpriseFactor,
            })),
          },
          null,
          2,
        ),
      };
    }
    case "oti://schema/historical-event.json": {
      const schemaPath = join(
        process.cwd(),
        "schema",
        "historical-event.schema.json",
      );
      if (!existsSync(schemaPath)) return null;
      return {
        uri,
        mimeType: "application/schema+json",
        text: readFileSync(schemaPath, "utf8"),
      };
    }
    case "oti://methodology": {
      // Stable summary of the methodology — kept short for token-economy
      // when an agent pins this resource.
      return {
        uri,
        mimeType: "text/markdown",
        text: `# OTI methodology — short form

OTI is a historical-analogue research engine for macro markets. **Memory, not prediction.**

## Pipeline

1. **Tag** the user's event into controlled vocab via Haiku.
2. **Embed** the query with voyage-finance-2 (default) at 1024d.
3. **Fuse** the text embedding with today's standardised macro state vector — \`q = norm([t; 0.5·z])\` per History Rhymes (arXiv:2511.09754).
4. **Multi-query expand** via Haiku paraphrases; RRF-fuse the parallel rankings.
5. **Region** is a hard filter; top-15 candidates pass through.
6. **Rerank** via Voyage rerank-2.5 cross-encoder; top-10 pass to synthesis.
7. **Phase A** (Sonnet 4.6) sees only narrativeAtTime + t=0 reaction. Picks 3 best-fit analogues + 1 negative-analogue (CHR pattern, arXiv:2604.04593).
8. **Phase B** sees the full hindsight payload for the 3 chosen events. Emits failedTradesPattern, consensusError, caveats.
9. **Numeric guard** scrubs digit-runs from prose.
10. **Self-Verifier** runs 7 invariant checks; tone-coded badge.
11. **Conformal calibration** (logit-free, walk-forward over the corpus) gives 80% intervals on @1m asset returns.

## What's protected

- **Look-ahead bias**: Phase A's prompt context excludes hindsight. Embedding texts exclude outcomeInHindsight. Calibration uses walk-forward folds.
- **Hallucinated events**: Phase A schema constrains eventId to a Zod enum of the candidate IDs.
- **Hallucinated stats**: Numeric guard scrubs invented digit-runs from prose.
- **Calibrated uncertainty**: Logit-free conformal coverage replaces empirical N=3 ranges with calibrated 80% intervals.

## What's deliberately not done

- No price targets, no allocation guidance.
- No backtests.
- No fine-tuned domain LLM.
- No vision input (deferred to v0.6+).

Repo: https://github.com/Al033/OTI · Live: https://oti-seven.vercel.app
`,
      };
    }
    case "oti://corpus/version": {
      return {
        uri,
        mimeType: "text/plain",
        text: CORPUS_VERSION,
      };
    }
    default:
      return null;
  }
}
