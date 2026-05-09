import { isNotNull } from "drizzle-orm";
import { EVENT_BY_ID } from "@/lib/events";
import { REGIME_COMPONENTS } from "./vector";
import { isDbConfigured, getDb, schema } from "@/lib/db/client";
import {
  REGIME_DIMENSIONS,
  REGIME_MIN_OVERLAP,
} from "./vector";
import {
  fitCovariance,
  pairDistance,
  distanceToSimilarity,
  type CovarianceModel,
} from "./mahalanobis";
import { getRegimeCentroidsSidecar } from "./centroids-sidecar";
import type { HistoricalEvent } from "@/lib/types";

/**
 * Match today's regime z-vector against the corpus's historical centroids.
 *
 *   1. Load all corpus events that have a populated regimeZVector.
 *   2. Fit a Ledoit-Wolf-shrunk covariance over the population so the
 *      Mahalanobis distance is calibrated to the corpus distribution.
 *   3. Compute pair distances from today to each centroid.
 *   4. Return the top-K positives, plus a single "negative analogue" —
 *      the closest event whose 1-month S&P sign is OPPOSITE to today's
 *      top-1 positive.
 *
 * The negative is the v0.3 differentiator: a case that looked similar
 * but resolved the other way. The disambiguator string surfaces which
 * dimension(s) most distinguish today's vector from the negative's.
 */

export interface MatchPositive {
  eventId: string;
  distance: number;
  similarity: number;
}

export interface MatchNegative extends MatchPositive {
  disambiguator: string;
}

export interface MatchResult {
  positives: MatchPositive[];
  negative: MatchNegative | null;
  /** Dimensions used for the covariance fit (full vector or restricted). */
  modelDims: number[];
  /** Number of corpus events with valid centroids that contributed. */
  candidatesConsidered: number;
}

let _centroidsCache: Map<string, Array<number | null>> | null = null;
let _centroidsSource: "db" | "sidecar" | "none" | null = null;

async function loadCentroids(): Promise<Map<string, Array<number | null>>> {
  if (_centroidsCache) return _centroidsCache;

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
        _centroidsCache = m;
        _centroidsSource = "db";
        return m;
      }
    } catch (err) {
      console.warn("[regime-match] DB load failed, falling back:", err);
    }
  }

  const sidecar = getRegimeCentroidsSidecar();
  if (sidecar) {
    const m = new Map<string, Array<number | null>>();
    for (const [id, c] of Object.entries(sidecar.centroids)) m.set(id, c.z);
    _centroidsCache = m;
    _centroidsSource = "sidecar";
    return m;
  }

  _centroidsCache = new Map();
  _centroidsSource = "none";
  return _centroidsCache;
}

export function getCentroidsSource(): "db" | "sidecar" | "none" | null {
  return _centroidsSource;
}

export async function matchRegime(args: {
  todayZ: Array<number | null>;
  topK?: number;
  /** Restrict matching to corpus events with date >= this ISO. Defaults
   *  to 1990-01-01 so the daily regime match doesn't anchor on pre-VIX
   *  events with sparse vectors. */
  minDate?: string;
}): Promise<MatchResult> {
  const topK = args.topK ?? 3;
  const minDate = args.minDate ?? "1990-01-01";

  const centroids = await loadCentroids();
  const eligible: Array<{ event: HistoricalEvent; z: Array<number | null> }> = [];
  for (const [id, z] of centroids) {
    const event = EVENT_BY_ID.get(id);
    if (!event) continue;
    if (event.date < minDate) continue;
    eligible.push({ event, z });
  }

  if (eligible.length < topK + 2) {
    return {
      positives: [],
      negative: null,
      modelDims: [],
      candidatesConsidered: eligible.length,
    };
  }

  // Fit a covariance model over the full vector (all 8 dims). If too many
  // candidates lack enough dims we'll fall back automatically inside
  // pairDistance via the partial-overlap path.
  const fullDims = Array.from({ length: REGIME_DIMENSIONS }, (_, i) => i);
  const observations = eligible.map((e) => e.z);
  let model: CovarianceModel | null = fitCovariance(observations, fullDims);
  if (!model) {
    // Fall back: drop the dims with most missing data and retry.
    const presentByDim = new Array(REGIME_DIMENSIONS).fill(0);
    for (const obs of observations) {
      for (let i = 0; i < REGIME_DIMENSIONS; i++) {
        if (obs[i] !== null && Number.isFinite(obs[i] as number))
          presentByDim[i] += 1;
      }
    }
    const ranked = presentByDim
      .map((p, i) => ({ p, i }))
      .sort((a, b) => b.p - a.p);
    const reducedDims = ranked.slice(0, REGIME_MIN_OVERLAP).map((x) => x.i);
    model = fitCovariance(observations, reducedDims);
    if (!model) {
      return {
        positives: [],
        negative: null,
        modelDims: [],
        candidatesConsidered: eligible.length,
      };
    }
  }

  // Score each eligible event.
  type Scored = {
    event: HistoricalEvent;
    distance: number;
    similarity: number;
  };
  const scored: Scored[] = [];
  for (const { event, z } of eligible) {
    const d = pairDistance({
      a: args.todayZ,
      b: z,
      model,
    });
    if (!Number.isFinite(d)) continue;
    scored.push({
      event,
      distance: d,
      similarity: distanceToSimilarity(d),
    });
  }

  scored.sort((a, b) => a.distance - b.distance);
  if (scored.length === 0) {
    return {
      positives: [],
      negative: null,
      modelDims: model.dims,
      candidatesConsidered: eligible.length,
    };
  }

  const positives: MatchPositive[] = scored.slice(0, topK).map((s) => ({
    eventId: s.event.id,
    distance: s.distance,
    similarity: s.similarity,
  }));

  const negative = pickNegativeAnalogue({
    today: args.todayZ,
    positives: scored.slice(0, topK),
    candidates: scored,
    minSeparation: 0.4,
  });

  return {
    positives,
    negative,
    modelDims: model.dims,
    candidatesConsidered: eligible.length,
  };
}

/**
 * "Negative analogue": a case that's close in macro state to today (or to
 * the top-1 positive) but whose 1-month S&P direction was OPPOSITE to
 * the top-1 positive's. Operationalises "look-similar-but-resolved-
 * differently" — the IntRec / Half-Truths research shape.
 *
 * Algorithm:
 *   - Take the dominant direction of the top-1 positive (sign of S&P 1m).
 *     If null, use 1-day sign.
 *   - Among candidates outside the top-K positive set, find the smallest-
 *     distance event whose dominant direction is opposite.
 *   - Require the candidate's distance be within `minSeparation` of the
 *     top-1 positive's distance — otherwise the "near miss" framing is
 *     dishonest (it's just a far-away case, not an analogue).
 *
 * disambiguator describes which z-dimension differs most between the
 * candidate and today — the macro variable that would have steered a
 * correct read away from this near-miss.
 */
function pickNegativeAnalogue(args: {
  today: Array<number | null>;
  positives: Array<{
    event: HistoricalEvent;
    distance: number;
  }>;
  candidates: Array<{
    event: HistoricalEvent;
    distance: number;
    similarity: number;
  }>;
  minSeparation: number;
}): MatchNegative | null {
  if (args.positives.length === 0) return null;
  const top = args.positives[0].event;
  const direction = sp500Direction(top);
  if (direction === 0) return null;

  const positiveIds = new Set(args.positives.map((p) => p.event.id));

  for (const c of args.candidates) {
    if (positiveIds.has(c.event.id)) continue;
    if (sp500Direction(c.event) !== -direction) continue;
    if (c.distance - args.positives[0].distance > args.minSeparation * 4) {
      // Too far away to be a near-miss — distance gap exceeds the threshold.
      continue;
    }
    return {
      eventId: c.event.id,
      distance: c.distance,
      similarity: distanceToSimilarity(c.distance),
      disambiguator: describeDisambiguator(args.today, c.event),
    };
  }
  return null;
}

function sp500Direction(e: HistoricalEvent): -1 | 0 | 1 {
  const m1 = e.assetMoves.sp500.m1;
  if (m1 === null) {
    const d1 = e.assetMoves.sp500.d1;
    if (d1 === null) return 0;
    if (d1 > 0.5) return 1;
    if (d1 < -0.5) return -1;
    return 0;
  }
  if (m1 > 1) return 1;
  if (m1 < -1) return -1;
  return 0;
}

function describeDisambiguator(
  today: Array<number | null>,
  candidate: HistoricalEvent,
): string {
  // The events.ts module exports a wider type that includes
  // regimeZVector at runtime; the narrow HistoricalEvent type used as
  // the parameter shape doesn't surface it. Cast to access.
  const candZ = (
    candidate as unknown as { regimeZVector?: Array<number | null> | null }
  ).regimeZVector;
  if (!candZ || !Array.isArray(candZ)) {
    return "(disambiguator unavailable: candidate centroid not stored)";
  }
  let bestIdx = -1;
  let bestGap = -Infinity;
  for (let i = 0; i < REGIME_DIMENSIONS; i++) {
    const a = today[i];
    const b = candZ[i];
    if (a === null || b === null) continue;
    const gap = Math.abs(a - b);
    if (gap > bestGap) {
      bestGap = gap;
      bestIdx = i;
    }
  }
  if (bestIdx < 0) return "vector overlap too sparse to identify the divergent dim";

  const comp = REGIME_COMPONENTS[bestIdx];
  const todayVal = today[bestIdx] as number;
  const candVal = candZ[bestIdx] as number;
  const direction = todayVal > candVal ? "elevated" : "compressed";
  return `Today's ${comp.label.toLowerCase()} reading is ${direction} relative to ${candidate.title.split(" — ")[0]} (z=${todayVal.toFixed(2)} vs ${candVal.toFixed(2)})`;
}

/**
 * Convenience: hydrate match positives/negative with their full event
 * payloads in one go for renderers.
 */
export function hydrateMatch(
  match: MatchResult,
): {
  positives: Array<MatchPositive & { event: HistoricalEvent }>;
  negative: (MatchNegative & { event: HistoricalEvent }) | null;
} {
  const positives = match.positives
    .map((p) => {
      const event = EVENT_BY_ID.get(p.eventId);
      return event ? { ...p, event } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const negEvent = match.negative ? EVENT_BY_ID.get(match.negative.eventId) : null;
  const negative =
    match.negative && negEvent
      ? { ...match.negative, event: negEvent }
      : null;
  return { positives, negative };
}

export type { MatchResult as RegimeMatchResult };
