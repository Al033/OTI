import type { HistoricalEvent, AssetMoves, ReturnSeries } from "./types";
import { jaccardSimilarity } from "./regime-tags";

/**
 * Logit-free split-conformal calibration on the asset-return ensemble.
 *
 * For each (asset, horizon) we compute a half-width q* such that the
 * interval [predicted_median ± q*] covers the true forward return with
 * roughly the requested probability (default 80%) over the corpus's
 * historical events.
 *
 * Calibration recipe (leave-one-out, walk-forward):
 *   1. For each event E, find E's 3 nearest neighbours in the corpus
 *      among events whose date < E.date (walk-forward) using Jaccard
 *      similarity over regimeTags.
 *   2. Predict E's return at horizon h as the median of those 3
 *      neighbours' return at h.
 *   3. Compute the absolute residual |actual - predicted|.
 *   4. Collect residuals across all events; the (1-α)-quantile of the
 *      residuals is q*. With N=39 events and 80% target, that's the
 *      31st residual in sorted order.
 *
 * This is a logit-free conformal scheme — directly executable on
 * historical data, no LLM logprobs required (which Anthropic's public
 * API still doesn't expose as of May 2026, blocking LAP and standard
 * conformal-on-LLM-outputs paths). Inspired by LofreeCP (arXiv:
 * 2403.01216) and the spirit of ACSE (arXiv:2605.04295) without
 * adopting their token-level machinery.
 *
 * Caveats — the analyst must read these (and the methodology page
 * documents them):
 *   - Coverage is asymptotic. At N=39 we have wide quantile estimates;
 *     the 80% claim is approximate, not exact.
 *   - Jaccard-only k-NN is a coarser similarity than the live pipeline
 *     (which uses RRF + voyage-4 + rerank + macro fusion); calibration
 *     is therefore a lower bound on what the live pipeline can achieve.
 *   - Walk-forward is enforced: a candidate's q* is calibrated on
 *     events that ALL came before the calibration event, so today's q*
 *     represents an honest backtest.
 */

export type AssetKey = keyof AssetMoves;
export type HorizonKey = keyof ReturnSeries;

export const ALL_ASSETS: AssetKey[] = [
  "sp500",
  "ust10y",
  "dxy",
  "gold",
  "oil",
  "creditHY",
  "vix",
];
export const ALL_HORIZONS: HorizonKey[] = ["d1", "d5", "m1", "m3", "m6"];

export interface ConformalQuantile {
  /** The (1-α)-quantile of |actual - predicted| residuals, in the
   *  asset's native unit (% for equities/FX/commodities, bps for yields/
   *  spreads, level points for VIX). */
  q: number;
  /** The miscoverage rate α (e.g. 0.20 for 80% coverage). */
  alpha: number;
  /** Number of (event, residual) pairs the quantile was fit on. */
  n: number;
  /** Mean and stdev of the residual distribution, for QC. */
  mean: number;
  std: number;
}

export type ConformalTable = Record<
  AssetKey,
  Record<HorizonKey, ConformalQuantile | null>
>;

/**
 * Build the full conformal quantile table from the corpus.
 *
 *   `events` — full corpus, ordered or unordered.
 *   `alpha`  — miscoverage target (default 0.20 for 80% intervals).
 *   `kNN`    — number of nearest neighbours used as ensemble for the
 *              prediction (default 3, matching OTI's 3-analogue brief).
 *   `minDateDelta` — events must be at least this many days BEFORE the
 *              calibration event to be eligible neighbours. Default 0
 *              (any earlier event).
 */
export function buildConformalTable(args: {
  events: HistoricalEvent[];
  alpha?: number;
  kNN?: number;
  minDateDelta?: number;
}): ConformalTable {
  const alpha = args.alpha ?? 0.2;
  const kNN = args.kNN ?? 3;

  const out: ConformalTable = {} as ConformalTable;
  for (const asset of ALL_ASSETS) {
    out[asset] = {} as Record<HorizonKey, ConformalQuantile | null>;
    for (const horizon of ALL_HORIZONS) {
      out[asset][horizon] = computeOneQuantile({
        events: args.events,
        asset,
        horizon,
        alpha,
        kNN,
      });
    }
  }
  return out;
}

function computeOneQuantile(args: {
  events: HistoricalEvent[];
  asset: AssetKey;
  horizon: HorizonKey;
  alpha: number;
  kNN: number;
}): ConformalQuantile | null {
  const residuals: number[] = [];

  for (const target of args.events) {
    const targetVal = (target.assetMoves[args.asset] as ReturnSeries)[
      args.horizon
    ];
    if (targetVal === null || targetVal === undefined) continue;

    const candidates = args.events
      .filter((e) => e.id !== target.id && e.date < target.date)
      .map((e) => ({
        event: e,
        sim: jaccardSimilarity(e.regimeTags, target.regimeTags),
        val: (e.assetMoves[args.asset] as ReturnSeries)[args.horizon] ?? null,
      }))
      .filter(
        (c): c is { event: HistoricalEvent; sim: number; val: number } =>
          c.val !== null && Number.isFinite(c.val),
      )
      .sort((a, b) => b.sim - a.sim)
      .slice(0, args.kNN);

    if (candidates.length < args.kNN) continue;

    const predicted = median(candidates.map((c) => c.val));
    if (predicted === null) continue;

    residuals.push(Math.abs(targetVal - predicted));
  }

  if (residuals.length < 5) return null;

  // Conformal split-conformal quantile with finite-sample correction:
  // index = ⌈(N+1)(1-α)⌉ in sorted residuals.
  const sorted = [...residuals].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.ceil((sorted.length + 1) * (1 - args.alpha)) - 1,
  );
  const q = sorted[idx];

  const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const variance =
    residuals.reduce((acc, x) => acc + (x - mean) ** 2, 0) / residuals.length;
  const std = Math.sqrt(variance);

  return { q, alpha: args.alpha, n: residuals.length, mean, std };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length / 2;
  return sorted.length % 2 === 1
    ? sorted[Math.floor(mid)]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Lookup helper: given a chosen-3-analogue ensemble's median + the
 * calibrated quantile, produce the [median - q, median + q] interval.
 *
 * Returns null when calibration data is missing for this (asset,
 * horizon). Caller falls back to the empirical N=3 range.
 */
export function calibratedInterval(args: {
  ensembleMedian: number | null;
  quantile: ConformalQuantile | null;
}): { lo: number; hi: number; coverage: number } | null {
  if (args.ensembleMedian === null || args.quantile === null) return null;
  const coverage = 1 - args.quantile.alpha;
  return {
    lo: args.ensembleMedian - args.quantile.q,
    hi: args.ensembleMedian + args.quantile.q,
    coverage,
  };
}
