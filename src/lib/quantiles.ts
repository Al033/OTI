import type { ReturnSeries, AssetMoves } from "./types";

/**
 * Empirical quantile bands across an analogue ensemble.
 *
 * v0.4 ships honest empirical ranges — `{min, median, max}` across the
 * N=3 chosen analogues. NOT calibrated conformal coverage. Per the May
 * 2026 brief: with N=3 you have zero statistical power for a meaningful
 * conformal interval; even Stable Localized CP (arXiv:2605.01452) needs
 * a calibration set ≥30. Surfacing min/median/max with the explicit
 * "empirical range over N=3 analogues" label is the analyst's honest
 * choice — anything tighter would be theatre.
 *
 * The corresponding labelled framing in the UI: a small summary row
 * below each asset table showing the empirical range with a footnote
 * disclaiming statistical interpretation.
 */

export type AssetKey = keyof AssetMoves;
export type HorizonKey = "d1" | "d5" | "m1" | "m3" | "m6";

export const ALL_HORIZONS: HorizonKey[] = ["d1", "d5", "m1", "m3", "m6"];

export interface QuantileBand {
  min: number | null;
  median: number | null;
  max: number | null;
  /** Number of non-null values that contributed to this band. */
  n: number;
}

/** Compute the empirical {min, median, max} of a list of nullable values. */
export function quantileBand(values: Array<number | null>): QuantileBand {
  const present = values.filter(
    (v): v is number => v !== null && Number.isFinite(v),
  );
  if (present.length === 0) {
    return { min: null, median: null, max: null, n: 0 };
  }
  const sorted = [...present].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median =
    sorted.length % 2 === 1
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  return { min, median, max, n: present.length };
}

/** Compute the band per (asset, horizon) across an array of analogue events. */
export function bandsForEnsemble(
  events: Array<{ assetMoves: AssetMoves }>,
): Record<AssetKey, Record<HorizonKey, QuantileBand>> {
  const out: Partial<Record<AssetKey, Record<HorizonKey, QuantileBand>>> = {};
  const assets: AssetKey[] = [
    "sp500",
    "ust10y",
    "dxy",
    "gold",
    "oil",
    "creditHY",
    "vix",
  ];
  for (const asset of assets) {
    const horizonBands: Partial<Record<HorizonKey, QuantileBand>> = {};
    for (const horizon of ALL_HORIZONS) {
      const values = events.map((e) => {
        const series = e.assetMoves[asset] as ReturnSeries;
        return series[horizon];
      });
      horizonBands[horizon] = quantileBand(values);
    }
    out[asset] = horizonBands as Record<HorizonKey, QuantileBand>;
  }
  return out as Record<AssetKey, Record<HorizonKey, QuantileBand>>;
}
