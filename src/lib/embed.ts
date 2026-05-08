import { embed } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { fuseTextAndMacro, FUSION_ALPHA } from "./regime/fuse";

/**
 * Compute a single embedding for a user query at request time.
 * Mirrors the build-script's voyage-4-large + 1024d configuration so
 * query and corpus vectors live in the same space.
 *
 * Two output paths:
 *   - embedQuery(): pure text embedding (1024d). Used when no regime
 *     vector is available.
 *   - embedQueryFused(query, todayMacroZ): text + macro fusion (1032d)
 *     per the History Rhymes pattern (arXiv:2511.09754).
 *
 * Returns null when the AI Gateway key is missing — retrieval still
 * works in Jaccard-only mode in that case.
 */

export const QUERY_EMBEDDING_MODEL =
  process.env.OTI_EMBEDDING_MODEL ?? "voyage/voyage-4-large";

export const QUERY_EMBEDDING_DIMENSIONS = Number(
  process.env.OTI_EMBEDDING_DIMENSIONS ?? 1024,
);

export async function embedQuery(query: string): Promise<number[] | null> {
  const hasKey = !!process.env.AI_GATEWAY_API_KEY;
  if (!hasKey) return null;

  try {
    const { embedding } = await embed({
      model: gateway.textEmbeddingModel(QUERY_EMBEDDING_MODEL),
      value: query,
      providerOptions: {
        voyage: { outputDimension: QUERY_EMBEDDING_DIMENSIONS },
      },
    });
    return embedding;
  } catch (err) {
    console.warn("[embed] query embedding failed, falling back to Jaccard:", err);
    return null;
  }
}

/**
 * Embed a query and fuse it with today's macro state vector. The fused
 * vector is L2_normalize([t; α·z]) per History Rhymes (arXiv:2511.09754).
 *
 * `todayMacroZ` is the live regime vector (8-dim, z-scored on the
 * trailing 1260 trading days). Pass null to fall back to text-only.
 */
export async function embedQueryFused(args: {
  query: string;
  todayMacroZ?: Array<number | null> | null;
  alpha?: number;
}): Promise<{
  textEmbedding: number[];
  fusedEmbedding: number[] | null;
  alpha: number;
} | null> {
  const text = await embedQuery(args.query);
  if (!text) return null;

  if (!args.todayMacroZ) {
    return { textEmbedding: text, fusedEmbedding: null, alpha: FUSION_ALPHA };
  }

  const fused = fuseTextAndMacro({
    textEmbedding: text,
    macroZ: args.todayMacroZ,
    alpha: args.alpha,
  });
  return {
    textEmbedding: text,
    fusedEmbedding: fused.vector,
    alpha: fused.alpha,
  };
}
