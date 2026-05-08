import { isNotNull } from "drizzle-orm";
import { EVENTS, EVENT_BY_ID } from "./events";
import { jaccardSimilarity } from "./regime-tags";
import { getEmbeddingsSidecar } from "./embeddings-sidecar";
import { getRegimeCentroidsSidecar } from "./regime/centroids-sidecar";
import { fuseTextAndMacro } from "./regime/fuse";
import { getDb, isDbConfigured, schema } from "./db/client";
import type {
  HistoricalEvent,
  QueryTags,
  RetrievalCandidate,
} from "./types";

/**
 * Two-stage hybrid retrieval with reciprocal-rank fusion.
 *
 *   Stage A — Jaccard similarity over regimeTags (deterministic, auditable).
 *   Stage B — Cosine similarity over voyage-3-large 1024d embeddings.
 *             Pulled from Postgres when configured, from a sidecar JSON
 *             at data/embeddings.json otherwise, or skipped (Jaccard-only)
 *             when neither is available.
 *
 * Fusion is reciprocal rank fusion (RRF, k=60). Each signal contributes
 * `weight / (k + rank + 1)`. RRF is robust to score-scale drift between
 * Jaccard (range [0,1]) and cosine (range [-1,1] but for normalised text
 * embeddings effectively [0,1]).
 *
 * Region is a *hard filter*: a US-region query never returns an EU-only
 * event. This replaces a previously-uncalibrated bonus that silently
 * inflated combined scores when an embedding signal was missing.
 *
 * The combined RRF score is reported alongside both component scores so
 * the "show your work" panel can audit how each candidate was ranked.
 */

const RRF_K = 60;
const W_JACCARD = 1.0;
const W_COSINE = 0.7;

export interface RetrievalOptions {
  topK?: number;
  /** Pre-computed query text embedding. If absent, only Jaccard contributes. */
  queryEmbedding?: number[] | null;
  /** Today's macro z-vector. When provided alongside queryEmbedding, the
   *  cosine signal is computed in the History-Rhymes-fused space (text
   *  embedding concatenated with the macro vector, L2-normalised). */
  queryMacroZ?: Array<number | null> | null;
  /** Clamp candidates to a minimum combined score. */
  minScore?: number;
  /** When false, skip the region hard-filter. */
  enforceRegion?: boolean;
}

export async function retrieve(
  query: QueryTags,
  options: RetrievalOptions = {},
): Promise<RetrievalCandidate[]> {
  const {
    topK = 15,
    queryEmbedding = null,
    queryMacroZ = null,
    minScore = 0,
    enforceRegion = true,
  } = options;

  const embeddingsByEventId = await loadEmbeddings();
  const regimeByEventId = await loadRegimeCentroids();

  const filtered = enforceRegion && query.region !== "GLOBAL"
    ? EVENTS.filter((e) => e.region === query.region || e.region === "GLOBAL")
    : [...EVENTS];

  // Pre-compute the fused query vector when both signals are available.
  // History Rhymes (arXiv:2511.09754) fuses [t; α·z] then L2-normalises.
  const useFused =
    !!queryEmbedding &&
    !!queryMacroZ &&
    regimeByEventId.size > 0;
  const fusedQuery = useFused
    ? fuseTextAndMacro({
        textEmbedding: queryEmbedding,
        macroZ: queryMacroZ,
      }).vector
    : null;

  const rows = filtered.map((event) => {
    const jaccard = jaccardSimilarity(event.regimeTags, query.regimeTags);
    const eventEmbedding = embeddingsByEventId.get(event.id) ?? null;
    const eventRegime = regimeByEventId.get(event.id) ?? null;

    let cosine: number | null = null;
    if (queryEmbedding && eventEmbedding) {
      if (
        fusedQuery &&
        eventRegime &&
        eventEmbedding.length === queryEmbedding.length
      ) {
        // Fused-space cosine: candidate's text embedding fused with its
        // historical regime vector, against today-fused query.
        const fusedCandidate = fuseTextAndMacro({
          textEmbedding: eventEmbedding,
          macroZ: eventRegime,
        }).vector;
        cosine = cosineSimilarity(fusedQuery, fusedCandidate);
      } else if (eventEmbedding.length === queryEmbedding.length) {
        // Text-only fallback when either side lacks a regime vector.
        cosine = cosineSimilarity(queryEmbedding, eventEmbedding);
      }
    }
    return { event, jaccard, cosine };
  });

  const jaccardRanks = rankIndices(rows.map((r) => r.jaccard));
  const hasCosine = rows.length > 0 && rows[0].cosine !== null;
  const cosineRanks = hasCosine
    ? rankIndices(rows.map((r) => r.cosine ?? -Infinity))
    : null;

  const candidates: RetrievalCandidate[] = rows.map((r, i) => {
    const jRank = jaccardRanks[i];
    const cRank = cosineRanks?.[i] ?? null;

    const jPart = W_JACCARD / (RRF_K + jRank + 1);
    const cPart = cRank === null ? 0 : W_COSINE / (RRF_K + cRank + 1);

    // Normalise so that "best possible RRF on this configuration" maps to 1.
    const bestPossible =
      cRank === null
        ? W_JACCARD / (RRF_K + 1)
        : (W_JACCARD + W_COSINE) / (RRF_K + 1);
    const combined = bestPossible === 0 ? 0 : (jPart + cPart) / bestPossible;

    return {
      eventId: r.event.id,
      jaccard: r.jaccard,
      cosine: r.cosine,
      combined,
    } satisfies RetrievalCandidate;
  });

  return candidates
    .filter((c) => c.combined >= minScore)
    .sort((a, b) => b.combined - a.combined)
    .slice(0, topK);
}

function rankIndices(scores: number[]): number[] {
  const order = scores
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s - a.s);
  const ranks = new Array<number>(scores.length);
  for (let r = 0; r < order.length; r++) ranks[order[r].i] = r;
  return ranks;
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

let _embeddingsCache: Map<string, number[]> | null = null;
let _embeddingsSource: "db" | "sidecar" | "none" | null = null;

async function loadEmbeddings(): Promise<Map<string, number[]>> {
  if (_embeddingsCache) return _embeddingsCache;

  if (isDbConfigured()) {
    try {
      const db = getDb();
      const rows = await db
        .select({ id: schema.events.id, embedding: schema.events.embedding })
        .from(schema.events)
        .where(isNotNull(schema.events.embedding));
      const map = new Map<string, number[]>();
      for (const row of rows) {
        if (row.embedding) map.set(row.id, row.embedding);
      }
      if (map.size > 0) {
        _embeddingsCache = map;
        _embeddingsSource = "db";
        return _embeddingsCache;
      }
    } catch (err) {
      console.warn("[retrieval] DB embedding lookup failed, falling back:", err);
    }
  }

  const sidecar = getEmbeddingsSidecar();
  if (sidecar) {
    _embeddingsCache = sidecar;
    _embeddingsSource = "sidecar";
    return _embeddingsCache;
  }

  _embeddingsCache = new Map();
  _embeddingsSource = "none";
  return _embeddingsCache;
}

export function getEmbeddingsSource(): "db" | "sidecar" | "none" | null {
  return _embeddingsSource;
}

let _regimeCache: Map<string, Array<number | null>> | null = null;
let _regimeSource: "db" | "sidecar" | "none" | null = null;

async function loadRegimeCentroids(): Promise<Map<string, Array<number | null>>> {
  if (_regimeCache) return _regimeCache;

  if (isDbConfigured()) {
    try {
      const db = getDb();
      const rows = await db
        .select({
          id: schema.events.id,
          z: schema.events.regimeZVector,
        })
        .from(schema.events)
        .where(isNotNull(schema.events.regimeZVector));
      const m = new Map<string, Array<number | null>>();
      for (const row of rows) if (row.z) m.set(row.id, row.z);
      if (m.size > 0) {
        _regimeCache = m;
        _regimeSource = "db";
        return m;
      }
    } catch (err) {
      console.warn("[retrieval] DB regime-centroid lookup failed:", err);
    }
  }

  const sidecar = getRegimeCentroidsSidecar();
  if (sidecar) {
    const m = new Map<string, Array<number | null>>();
    for (const [id, c] of Object.entries(sidecar.centroids)) m.set(id, c.z);
    _regimeCache = m;
    _regimeSource = "sidecar";
    return m;
  }

  _regimeCache = new Map();
  _regimeSource = "none";
  return _regimeCache;
}

export function getRegimeSource(): "db" | "sidecar" | "none" | null {
  return _regimeSource;
}

/**
 * Hydrate retrieval candidates with their full event payloads. O(1) per
 * candidate via the EVENT_BY_ID map.
 */
export function hydrate(
  candidates: RetrievalCandidate[],
): Array<RetrievalCandidate & { event: HistoricalEvent }> {
  const out: Array<RetrievalCandidate & { event: HistoricalEvent }> = [];
  for (const c of candidates) {
    const event = EVENT_BY_ID.get(c.eventId);
    if (event) out.push({ ...c, event });
  }
  return out;
}

/**
 * Synchronous Jaccard-only retrieval. Used by the demo-cache module at
 * load time — no DB, no embeddings, no rerank, no async. Producing an
 * audit panel for the precomputed demos doesn't need the full pipeline.
 */
export function retrieveSync(
  query: QueryTags,
  options: Pick<RetrievalOptions, "topK" | "minScore" | "enforceRegion"> = {},
): RetrievalCandidate[] {
  const { topK = 15, minScore = 0, enforceRegion = true } = options;
  const filtered = enforceRegion && query.region !== "GLOBAL"
    ? EVENTS.filter((e) => e.region === query.region || e.region === "GLOBAL")
    : [...EVENTS];

  const rows = filtered.map((event) => ({
    event,
    jaccard: jaccardSimilarity(event.regimeTags, query.regimeTags),
  }));

  const jaccardRanks = rankIndices(rows.map((r) => r.jaccard));
  const candidates: RetrievalCandidate[] = rows.map((r, i) => {
    const jPart = W_JACCARD / (RRF_K + jaccardRanks[i] + 1);
    const bestPossible = W_JACCARD / (RRF_K + 1);
    return {
      eventId: r.event.id,
      jaccard: r.jaccard,
      cosine: null,
      combined: bestPossible === 0 ? 0 : jPart / bestPossible,
    };
  });

  return candidates
    .filter((c) => c.combined >= minScore)
    .sort((a, b) => b.combined - a.combined)
    .slice(0, topK);
}
