import { fetchFredSeries } from "@/lib/regime/fred";
import { fetchStooqDaily } from "./stooq";
import {
  ASSET_SOURCES,
  HORIZON_OFFSETS,
  type Asset,
  type AssetSource,
  type HorizonKey,
  type Transform,
} from "./sources";
import type { ReturnSeries } from "@/lib/types";

/**
 * Compute the return series for a single event date across the OTI
 * asset list. For each asset we pull a window covering [t-5d, t+6m+5d]
 * once, then snap to the closest available trading day at each horizon
 * and compute the return per the asset's transform.
 *
 * Returns a partial ReturnSeries per asset. Keys missing from the map
 * mean either the underlying series didn't exist on that date (pre-1990
 * VIX) or the fetch failed.
 */

export interface ComputedAssetMoves {
  asset: Asset;
  transform: Transform;
  source: "fred" | "stooq" | "missing";
  series: Partial<ReturnSeries>;
  /** ISO of the as-of trading day actually used for t (closest preceding
   *  observation to the requested event date). */
  asOf: string | null;
  /** Number of horizon points populated. */
  populatedHorizons: number;
}

export async function computeAssetMovesForEvent(args: {
  eventDate: string;
}): Promise<ComputedAssetMoves[]> {
  const out: ComputedAssetMoves[] = [];
  for (const src of ASSET_SOURCES) {
    if (args.eventDate < src.startDate) {
      out.push({
        asset: src.asset,
        transform: src.transform,
        source: "missing",
        series: {},
        asOf: null,
        populatedHorizons: 0,
      });
      continue;
    }
    out.push(await computeOneAsset(src, args.eventDate));
  }
  return out;
}

async function computeOneAsset(
  src: AssetSource,
  eventDate: string,
): Promise<ComputedAssetMoves> {
  // Pull a window: 10 trading days before to ~150 calendar days after.
  const start = isoOffset(eventDate, -14);
  const end = isoOffset(eventDate, 200);

  let history: Array<{ date: string; value: number }> = [];
  let source: "fred" | "stooq" | "missing" = "missing";

  if (src.fred) {
    try {
      const fred = await fetchFredSeries({
        seriesId: src.fred,
        observationStart: start,
        observationEnd: end,
        sortOrder: "asc",
      });
      if (fred.length > 0) {
        history = fred;
        source = "fred";
      }
    } catch (err) {
      console.warn(`[refresh] ${src.asset} fred ${src.fred}: ${err}`);
    }
  }

  if (history.length === 0 && src.stooq) {
    const stooq = await fetchStooqDaily({
      symbol: src.stooq,
      start,
      end,
    });
    if (stooq.length > 0) {
      history = stooq.map((p) => ({ date: p.date, value: p.close }));
      source = "stooq";
    }
  }

  if (history.length === 0) {
    return {
      asset: src.asset,
      transform: src.transform,
      source: "missing",
      series: {},
      asOf: null,
      populatedHorizons: 0,
    };
  }

  // Find t: the closest trading-day observation on or before the event date.
  // If the event date itself is a trading day with a data point, use it;
  // otherwise step back.
  const tIdx = findIndexOnOrBefore(history, eventDate);
  if (tIdx < 0) {
    return {
      asset: src.asset,
      transform: src.transform,
      source,
      series: {},
      asOf: null,
      populatedHorizons: 0,
    };
  }
  const tValue = history[tIdx].value;
  const tDate = history[tIdx].date;

  const series: Partial<ReturnSeries> = {};
  let populated = 0;
  for (const h of HORIZON_OFFSETS) {
    const targetIdx = tIdx + h.days;
    if (targetIdx >= history.length) {
      // Window doesn't reach the horizon — leave undefined (later JSON
      // serialisation fills it with null when merged).
      continue;
    }
    const future = history[targetIdx].value;
    const ret = transformReturn(tValue, future, src.transform);
    if (ret === null) continue;
    series[h.key as HorizonKey] = ret;
    populated += 1;
  }

  return {
    asset: src.asset,
    transform: src.transform,
    source,
    series,
    asOf: tDate,
    populatedHorizons: populated,
  };
}

function transformReturn(
  base: number,
  future: number,
  transform: Transform,
): number | null {
  if (!Number.isFinite(base) || !Number.isFinite(future)) return null;
  switch (transform) {
    case "pct":
      if (base <= 0) return null;
      return Math.round(((future / base - 1) * 100 + Number.EPSILON) * 10) / 10;
    case "bps":
      // base/future are in percentage points (e.g. 4.65 means 4.65%).
      // Convert to basis points and round.
      return Math.round((future - base) * 100);
    case "lvl":
      return Math.round((future - base) * 10) / 10;
  }
}

function findIndexOnOrBefore(
  history: Array<{ date: string }>,
  target: string,
): number {
  // history is sorted ascending by date.
  // Linear scan — O(N) is fine at ~150 points.
  let best = -1;
  for (let i = 0; i < history.length; i++) {
    if (history[i].date <= target) best = i;
    else break;
  }
  return best;
}

function isoOffset(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
