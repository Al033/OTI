/**
 * Build the 8-component regime vector for a given as-of date.
 *
 * Used by:
 *   - `scripts/build-regime-centroids.ts` to populate
 *     events.regime_raw_vector / events.regime_z_vector at build time.
 *   - The daily cron at /api/cron/regime-snapshot for "today".
 *
 * Both raw and z-scored vectors are returned. The z-score window is
 * the trailing 1260 trading days of (transformed) history ending the
 * day BEFORE the as-of date — so today's vector doesn't z-score
 * itself.
 */

import {
  REGIME_COMPONENTS,
  REGIME_DIMENSIONS,
  REGIME_VECTOR_VERSION,
  applyTransform,
  zScore,
  type RegimeComponent,
} from "./vector";
import { fetchFredWindow, type FredObservation } from "./fred";
import { fetchYahooDaily } from "./yahoo";

export interface RegimeSnapshotResult {
  asOf: string; // ISO date
  rawVector: Array<number | null>;
  zVector: Array<number | null>;
  meta: {
    version: string;
    components: Array<{
      key: string;
      source: "fred" | "yahoo" | "missing";
      transformedValue: number | null;
      zValue: number | null;
      historyPoints: number;
      latencyMs: number;
    }>;
  };
}

export async function buildRegimeSnapshot(asOf: string): Promise<RegimeSnapshotResult> {
  const rawVector: Array<number | null> = new Array(REGIME_DIMENSIONS).fill(null);
  const zVector: Array<number | null> = new Array(REGIME_DIMENSIONS).fill(null);
  const componentsMeta: RegimeSnapshotResult["meta"]["components"] = [];

  // Resolve all components in parallel — each touches a different upstream.
  await Promise.all(
    REGIME_COMPONENTS.map(async (comp, idx) => {
      const start = Date.now();
      const result = await resolveComponent(comp, asOf);
      const latencyMs = Date.now() - start;
      rawVector[idx] = result.transformedValue;
      zVector[idx] = result.zValue;
      componentsMeta.push({
        key: comp.key,
        source: result.source,
        transformedValue: result.transformedValue,
        zValue: result.zValue,
        historyPoints: result.historyPoints,
        latencyMs,
      });
    }),
  );

  return {
    asOf,
    rawVector,
    zVector,
    meta: {
      version: REGIME_VECTOR_VERSION,
      components: componentsMeta,
    },
  };
}

async function resolveComponent(
  comp: RegimeComponent,
  asOf: string,
): Promise<{
  source: "fred" | "yahoo" | "missing";
  transformedValue: number | null;
  zValue: number | null;
  historyPoints: number;
}> {
  // If the as-of date is before the series start, we have nothing.
  if (asOf < comp.startDate) {
    return { source: "missing", transformedValue: null, zValue: null, historyPoints: 0 };
  }

  let source: "fred" | "yahoo" | "missing" = "missing";
  let history: Array<{ date: string; value: number }> = [];

  if (comp.fredSeries) {
    const fred = await fetchFredWindow({
      seriesId: comp.fredSeries,
      asOf,
      yearsBack: 6,
    });
    history = fred.map(toGenericPoint);
    if (history.length > 0) source = "fred";
  } else if (comp.yahooSymbol) {
    const ydata = await fetchYahooDaily({
      symbol: comp.yahooSymbol,
      asOf,
      yearsBack: 6,
    });
    history = ydata.map((p) => ({ date: p.date, value: p.close }));
    if (history.length > 0) source = "yahoo";
  }

  if (history.length === 0) {
    return { source, transformedValue: null, zValue: null, historyPoints: 0 };
  }

  // Transform every point (so we can z-score against transformed history).
  const transformedSeries: Array<{ date: string; value: number }> = [];
  for (let i = 0; i < history.length; i++) {
    const pointAsOf = history[i].date;
    const t = applyTransform({
      component: comp,
      asOfDate: pointAsOf,
      history: history.slice(0, i + 1),
    });
    if (t !== null && Number.isFinite(t)) {
      transformedSeries.push({ date: pointAsOf, value: t });
    }
  }

  const transformedAtAsOf = applyTransform({
    component: comp,
    asOfDate: asOf,
    history,
  });

  if (transformedAtAsOf === null) {
    return { source, transformedValue: null, zValue: null, historyPoints: history.length };
  }

  // Z-score the as-of value against the transformed history strictly
  // BEFORE the as-of date. This avoids the value z-scoring itself.
  const priorWindow = transformedSeries
    .filter((p) => p.date < asOf)
    .map((p) => p.value);
  const z = zScore(transformedAtAsOf, priorWindow);

  return {
    source,
    transformedValue: transformedAtAsOf,
    zValue: z,
    historyPoints: history.length,
  };
}

function toGenericPoint(o: FredObservation): { date: string; value: number } {
  return { date: o.date, value: o.value };
}
