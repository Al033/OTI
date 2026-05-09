/**
 * Server-side helper that converts the conformal-quantile sidecar +
 * the chosen-3-analogue ensemble into a fully populated
 * `CalibratedIntervals` record ready to ship in PipelineResult.
 *
 * Returns null when no sidecar is loaded (caller falls back to the
 * empirical N=3 bands).
 */

import { getConformalSidecar } from "./conformal-sidecar";
import {
  ALL_ASSETS,
  ALL_HORIZONS,
  calibratedInterval,
  type AssetKey,
  type HorizonKey,
} from "./conformal";
import { bandsForEnsemble } from "./quantiles";
import type { CalibratedIntervals, HistoricalEvent } from "./types";

export function buildCalibratedIntervals(
  chosen: HistoricalEvent[],
): CalibratedIntervals | null {
  const sidecar = getConformalSidecar();
  if (!sidecar) return null;

  const bands = bandsForEnsemble(chosen);
  const out: Partial<CalibratedIntervals> = {};

  for (const asset of ALL_ASSETS) {
    const perAsset: Partial<
      Record<HorizonKey, { lo: number; hi: number; coverage: number } | null>
    > = {};
    for (const horizon of ALL_HORIZONS) {
      const q = sidecar.table[asset]?.[horizon] ?? null;
      const ensembleMedian = bands[asset][horizon].median;
      perAsset[horizon] = calibratedInterval({
        ensembleMedian,
        quantile: q,
      });
    }
    (out as Record<AssetKey, unknown>)[asset] = perAsset;
  }
  return out as CalibratedIntervals;
}
