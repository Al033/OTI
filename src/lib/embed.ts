import { embed } from "ai";
import { gateway } from "@ai-sdk/gateway";

/**
 * Compute a single embedding for a user query at request time.
 * Mirrors the build-script's voyage-3-large + 1024d configuration so
 * query and corpus vectors live in the same space.
 *
 * Returns null when the AI Gateway key is missing — retrieval still
 * works in Jaccard-only mode in that case.
 */

export const QUERY_EMBEDDING_MODEL =
  process.env.OTI_EMBEDDING_MODEL ?? "voyage/voyage-3-large";

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
