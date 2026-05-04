import { EVENTS } from "./events";
import { jaccardSimilarity } from "./regime-tags";
import type {
  HistoricalEvent,
  QueryTags,
  RetrievalCandidate,
} from "./types";

/**
 * Two-stage hybrid retrieval.
 *
 *   Stage A — Jaccard similarity over regimeTags (deterministic, auditable).
 *   Stage B — Cosine similarity over embeddings (semantic), if a query
 *             embedding is available; otherwise skipped.
 *
 *   Combined score = JACCARD_WEIGHT * jaccard + (1 - JACCARD_WEIGHT) * cosine
 *                    + small bonus for matching triggerType.
 *
 * The combined score is reported alongside the component scores so the
 * "show your work" panel can audit how each candidate was ranked.
 */

const JACCARD_WEIGHT = 0.6;
const TRIGGER_BONUS = 0.05;
const REGION_BONUS = 0.02;
const SURPRISE_FACTOR_WEIGHT = 0.03;

export interface RetrievalOptions {
  topK?: number;
  queryEmbedding?: number[] | null;
  /** Optional: clamp candidates to a minimum combined score. */
  minScore?: number;
}

export function retrieve(
  query: QueryTags,
  options: RetrievalOptions = {},
): RetrievalCandidate[] {
  const { topK = 10, queryEmbedding = null, minScore = 0 } = options;

  const candidates: RetrievalCandidate[] = EVENTS.map((event) => {
    const jaccard = jaccardSimilarity(event.regimeTags, query.regimeTags);

    let cosine: number | null = null;
    if (queryEmbedding && event.embedding && event.embedding.length === queryEmbedding.length) {
      cosine = cosineSimilarity(queryEmbedding, event.embedding);
    }

    const triggerBonus = event.triggerType === query.triggerType ? TRIGGER_BONUS : 0;
    const regionBonus =
      event.region === query.region || event.region === "GLOBAL" || query.region === "GLOBAL"
        ? REGION_BONUS
        : 0;

    // Reward similar surprise factors (within 1 step).
    const surpriseDelta = Math.abs(event.surpriseFactor - query.surpriseFactor);
    const surpriseBonus = surpriseDelta <= 1 ? SURPRISE_FACTOR_WEIGHT : 0;

    const semanticPart = cosine ?? 0;
    const combined = clamp01(
      JACCARD_WEIGHT * jaccard +
        (1 - JACCARD_WEIGHT) * semanticPart +
        triggerBonus +
        regionBonus +
        surpriseBonus,
    );

    return {
      eventId: event.id,
      jaccard,
      cosine,
      combined,
    } satisfies RetrievalCandidate;
  });

  return candidates
    .filter((c) => c.combined >= minScore)
    .sort((a, b) => b.combined - a.combined)
    .slice(0, topK);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * Helper: hydrate retrieval candidates with their full event payloads.
 * Used by the synthesis prompt builder so the LLM sees one self-contained
 * blob per candidate rather than re-joining at render time.
 */
export function hydrate(
  candidates: RetrievalCandidate[],
): Array<RetrievalCandidate & { event: HistoricalEvent }> {
  const out: Array<RetrievalCandidate & { event: HistoricalEvent }> = [];
  for (const c of candidates) {
    const event = EVENTS.find((e) => e.id === c.eventId);
    if (event) out.push({ ...c, event });
  }
  return out;
}
