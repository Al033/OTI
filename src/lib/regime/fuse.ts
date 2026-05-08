/**
 * Macro-fused query embeddings — the History Rhymes (arXiv:2511.09754)
 * pattern, applied to OTI's text + 8-component regime vector.
 *
 *   q_fused = L2_normalize([ t ; α · z ])
 *
 * where `t` is the text embedding (voyage-4-large, 1024d) and `z` is
 * the standardised regime vector (8d, z-scored on the 1260-day window).
 *
 * Why fuse. The pure text-embedding cosine retrieves on prose similarity —
 * "Trump tariffs" rhymes with "Nixon import surcharge" because the
 * narrative descriptions overlap on policy-uncertainty language. But it
 * misses cases where the prose is different but the macro setup is
 * identical. Concatenating the regime z-vector pulls in the structural
 * signal so retrieval becomes regime-aware: today's high-vol-low-credit
 * setup gets matched to other high-vol-low-credit historical regimes
 * regardless of whether the prose mentions "tariff" or "Lehman."
 *
 * α controls the fusion strength. The paper recommends 0.5; smaller
 * keeps the text signal dominant, larger tilts toward macro state.
 *
 * Empirical norms: voyage-4-large embeddings are unit-normalised, so
 * `||t|| = 1`. The z-vector is mean-zero unit-variance per dim — its
 * Euclidean norm grows roughly with √D. We rescale by `α / sqrt(D)` so
 * the macro contribution is comparable in scale to the text component
 * regardless of how many regime dims are populated.
 *
 * Missing dims: if a corpus event has nulls in its z-vector (pre-1990
 * VIX, etc.), those positions become 0 in the fused vector. This is
 * the Right Thing — a null dim contributes nothing rather than biasing
 * the cosine.
 */

import { REGIME_DIMENSIONS } from "./vector";

export const FUSION_ALPHA = Number(process.env.OTI_FUSION_ALPHA ?? 0.5);

export interface FusedVector {
  /** The L2-normalised concatenation [t; α·z]. */
  vector: number[];
  /** The text-embedding dimension (1024 for voyage-4-large at default tier). */
  textDims: number;
  /** The macro-vector dimension (REGIME_DIMENSIONS = 8). */
  macroDims: number;
  /** α value used. */
  alpha: number;
  /** How many of the macro dims were populated (the rest filled with 0). */
  populatedMacroDims: number;
}

/**
 * Fuse a text embedding with a (possibly partial) macro z-vector.
 * Both inputs are read-only; output is a fresh array.
 */
export function fuseTextAndMacro(args: {
  textEmbedding: number[];
  macroZ: Array<number | null>;
  alpha?: number;
}): FusedVector {
  const alpha = args.alpha ?? FUSION_ALPHA;
  const textDims = args.textEmbedding.length;
  const macroDims = REGIME_DIMENSIONS;

  // Scale the macro contribution so its L2 norm is comparable to the
  // text embedding's (which is unit-norm). After this rescale, the
  // alpha parameter's interpretation is clean: alpha=0 → macro ignored,
  // alpha=1 → equal weight, etc.
  const macroNorm = 1 / Math.sqrt(macroDims);
  const macroScale = alpha * macroNorm;

  let populated = 0;
  const fused = new Array<number>(textDims + macroDims);
  for (let i = 0; i < textDims; i++) fused[i] = args.textEmbedding[i];
  for (let i = 0; i < macroDims; i++) {
    const v = args.macroZ[i];
    if (v === null || v === undefined || !Number.isFinite(v)) {
      fused[textDims + i] = 0;
    } else {
      fused[textDims + i] = v * macroScale;
      populated += 1;
    }
  }

  // L2-normalise the full fused vector.
  let sumSq = 0;
  for (let i = 0; i < fused.length; i++) sumSq += fused[i] * fused[i];
  const norm = Math.sqrt(sumSq);
  if (norm > 1e-12) {
    for (let i = 0; i < fused.length; i++) fused[i] /= norm;
  }

  return {
    vector: fused,
    textDims,
    macroDims,
    alpha,
    populatedMacroDims: populated,
  };
}

/** Total fused dim for a given text-embedding dim. */
export function fusedDimensions(textDims: number): number {
  return textDims + REGIME_DIMENSIONS;
}
