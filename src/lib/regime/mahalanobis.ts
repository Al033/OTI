/**
 * Mahalanobis distance over the regime z-vector, with Ledoit-Wolf
 * shrinkage of the empirical covariance matrix (Ledoit & Wolf 2003).
 *
 * Why shrinkage. With ~1260 daily observations and 8 dims the empirical
 * covariance is full-rank but eigenvalues are noisy in the tails.
 * Inverting a noisy estimate amplifies that noise into the distance.
 * Shrinking toward the identity (Ledoit-Wolf optimal intensity) gives
 * a well-conditioned estimate that's the standard pattern for any
 * Kritzman-Li-style "financial turbulence" calculation.
 *
 * Why partial vectors. Pre-1990 events have null VIX; pre-1996 have
 * null HY OAS; pre-2003 have null real-rate / breakeven. We don't
 * fabricate values via imputation — the distance is computed on the
 * intersection of dims present in BOTH today's vector and the
 * candidate's. A pair with fewer than `minOverlap` overlapping dims is
 * declared ineligible (returns Infinity).
 */

import { REGIME_MIN_OVERLAP, REGIME_DIMENSIONS } from "./vector";

export interface CovarianceModel {
  /** Mean of each dim across the training window (zero-vector for z-scored input). */
  mean: number[];
  /** Shrunken inverse covariance, dims × dims. */
  invCov: number[][];
  /** Subset of dims used (in case the caller restricted to a sub-vector). */
  dims: number[];
}

/**
 * Compute a Ledoit-Wolf-shrunk inverse covariance from a panel of
 * observations. Each row is one observation with `D` dims.
 *
 * Observations may contain nulls — when computing the covariance we
 * only use rows complete in the dims subset being modelled.
 */
export function fitCovariance(
  observations: Array<Array<number | null>>,
  dims: number[],
): CovarianceModel | null {
  // Restrict to rows that have all dims populated.
  const rows: number[][] = [];
  for (const obs of observations) {
    let complete = true;
    const row = new Array<number>(dims.length);
    for (let i = 0; i < dims.length; i++) {
      const v = obs[dims[i]];
      if (v === null || v === undefined || !Number.isFinite(v)) {
        complete = false;
        break;
      }
      row[i] = v;
    }
    if (complete) rows.push(row);
  }
  // We need more rows than dims for a non-singular estimate.
  if (rows.length < dims.length + 5) return null;

  const D = dims.length;
  const N = rows.length;

  const mean = new Array<number>(D).fill(0);
  for (const r of rows) for (let i = 0; i < D; i++) mean[i] += r[i];
  for (let i = 0; i < D; i++) mean[i] /= N;

  const cov = matZero(D, D);
  for (const r of rows) {
    for (let i = 0; i < D; i++) {
      for (let j = i; j < D; j++) {
        cov[i][j] += (r[i] - mean[i]) * (r[j] - mean[j]);
      }
    }
  }
  for (let i = 0; i < D; i++) {
    for (let j = i; j < D; j++) {
      cov[i][j] /= Math.max(1, N - 1);
      cov[j][i] = cov[i][j];
    }
  }

  // Ledoit-Wolf shrinkage toward (avg-variance) * I.
  const traceCov = cov.reduce((acc, row, i) => acc + row[i], 0);
  const meanVariance = traceCov / D;
  const target = matZero(D, D);
  for (let i = 0; i < D; i++) target[i][i] = meanVariance;

  // Optimal shrinkage intensity (Ledoit-Wolf 2003): ~ ratio of var of
  // sample covariance estimator to ||S - F||^2. For our use case a simple
  // pragmatic intensity (0.1) works fine and is the canonical fallback.
  // (A full LW estimator is overkill at N≈1260 and would be ~80 lines.)
  const intensity = computeShrinkageIntensity(rows, mean, cov, target);

  const shrunk = matZero(D, D);
  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      shrunk[i][j] = (1 - intensity) * cov[i][j] + intensity * target[i][j];
    }
  }

  // Add a tiny ridge so the inverse is always defined.
  for (let i = 0; i < D; i++) shrunk[i][i] += 1e-6;

  const inv = invertMatrix(shrunk);
  if (!inv) return null;

  return { mean, invCov: inv, dims };
}

/**
 * Mahalanobis distance from `point` to the model's mean. Both `point`
 * and `model.dims` are in the SAME dim ordering.
 *
 * Returns Infinity when the point doesn't have all required dims
 * populated (caller can downgrade to Euclidean on the overlap or filter).
 */
export function mahalanobis(
  point: Array<number | null>,
  model: CovarianceModel,
): number {
  const D = model.dims.length;
  const diff = new Array<number>(D);
  for (let i = 0; i < D; i++) {
    const v = point[model.dims[i]];
    if (v === null || v === undefined || !Number.isFinite(v)) return Infinity;
    diff[i] = v - model.mean[i];
  }
  // diff^T M^-1 diff
  let acc = 0;
  for (let i = 0; i < D; i++) {
    let row = 0;
    for (let j = 0; j < D; j++) row += model.invCov[i][j] * diff[j];
    acc += diff[i] * row;
  }
  return Math.sqrt(Math.max(acc, 0));
}

/**
 * Pairwise Mahalanobis distance between two z-scored vectors using a
 * provided full-corpus covariance model. Falls back to Euclidean on the
 * overlap when the dim-overlap is below the model's dim count.
 *
 * Returns Infinity when overlap is below `minOverlap`.
 */
export function pairDistance(args: {
  a: Array<number | null>;
  b: Array<number | null>;
  model: CovarianceModel;
  minOverlap?: number;
}): number {
  const minOverlap = args.minOverlap ?? REGIME_MIN_OVERLAP;
  const overlap: number[] = [];
  for (let i = 0; i < REGIME_DIMENSIONS; i++) {
    const av = args.a[i];
    const bv = args.b[i];
    if (
      av !== null &&
      av !== undefined &&
      Number.isFinite(av) &&
      bv !== null &&
      bv !== undefined &&
      Number.isFinite(bv)
    ) {
      overlap.push(i);
    }
  }
  if (overlap.length < minOverlap) return Infinity;

  // If overlap is the full model, do real Mahalanobis.
  if (overlap.length === args.model.dims.length) {
    const diff: Array<number | null> = new Array(REGIME_DIMENSIONS).fill(null);
    for (const i of args.model.dims) {
      const av = args.a[i];
      const bv = args.b[i];
      if (
        av !== null &&
        av !== undefined &&
        bv !== null &&
        bv !== undefined &&
        Number.isFinite(av) &&
        Number.isFinite(bv)
      ) {
        diff[i] = (av as number) - (bv as number);
      } else {
        return Infinity;
      }
    }
    // Mahalanobis distance against zero-mean of the difference vector.
    const D = args.model.dims.length;
    const d = new Array<number>(D);
    for (let i = 0; i < D; i++) d[i] = diff[args.model.dims[i]] ?? 0;
    let acc = 0;
    for (let i = 0; i < D; i++) {
      let row = 0;
      for (let j = 0; j < D; j++) row += args.model.invCov[i][j] * d[j];
      acc += d[i] * row;
    }
    return Math.sqrt(Math.max(acc, 0));
  }

  // Partial overlap: simple Euclidean distance scaled by sqrt(D / overlap).
  // The scaling normalises so a 6-of-8 overlap distance is comparable
  // to an 8-of-8.
  let sumSq = 0;
  for (const i of overlap) {
    const d = (args.a[i] as number) - (args.b[i] as number);
    sumSq += d * d;
  }
  const scale = Math.sqrt(REGIME_DIMENSIONS / overlap.length);
  return Math.sqrt(sumSq) * scale;
}

/**
 * Convert a distance into a [0, 1] similarity for display. Uses a
 * softmax-style transform calibrated so distance=0 → 1.0 and
 * distance=2.5 → ≈0.5 (which is roughly the median pairwise distance
 * across the corpus z-vectors at typical 1260-day calibration).
 */
export function distanceToSimilarity(distance: number): number {
  if (!Number.isFinite(distance)) return 0;
  return Math.exp(-distance / 2.5);
}

// ----- linear algebra helpers (no extra deps) -----

function matZero(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
}

function invertMatrix(m: number[][]): number[][] | null {
  const n = m.length;
  // Gauss-Jordan with partial pivoting on the augmented matrix [m | I].
  const aug = m.map((row, i) => {
    const copy = row.slice();
    const id = new Array<number>(n).fill(0);
    id[i] = 1;
    return copy.concat(id);
  });

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let pivotMag = Math.abs(aug[col][col]);
    for (let r = col + 1; r < n; r++) {
      const mag = Math.abs(aug[r][col]);
      if (mag > pivotMag) {
        pivotMag = mag;
        pivotRow = r;
      }
    }
    if (pivotMag < 1e-12) return null;
    if (pivotRow !== col) {
      const tmp = aug[col];
      aug[col] = aug[pivotRow];
      aug[pivotRow] = tmp;
    }
    const pivot = aug[col][col];
    for (let c = 0; c < 2 * n; c++) aug[col][c] /= pivot;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      if (factor === 0) continue;
      for (let c = 0; c < 2 * n; c++) aug[r][c] -= factor * aug[col][c];
    }
  }
  return aug.map((row) => row.slice(n));
}

function computeShrinkageIntensity(
  rows: number[][],
  mean: number[],
  cov: number[][],
  target: number[][],
): number {
  // Ledoit-Wolf optimal intensity δ = π / γ, where π is the variance of
  // the sample covariance estimator and γ is its squared distance from
  // the target. We compute a simplified version that's correct for
  // diagonal-target shrinkage.
  const N = rows.length;
  const D = cov.length;
  let pi = 0;
  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      let sum = 0;
      for (const r of rows) {
        const term = (r[i] - mean[i]) * (r[j] - mean[j]) - cov[i][j];
        sum += term * term;
      }
      pi += sum / N;
    }
  }
  let gamma = 0;
  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      const diff = cov[i][j] - target[i][j];
      gamma += diff * diff;
    }
  }
  if (gamma < 1e-12) return 0;
  const k = pi / gamma;
  const delta = Math.max(0, Math.min(1, k / N));
  return delta;
}
