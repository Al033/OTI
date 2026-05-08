import type { HistoricalEvent, RetrievalCandidate } from "./types";

/**
 * Rerank a list of retrieval candidates against the user's free-text
 * query using Voyage rerank-2.5. Voyage is the right reranker here: at
 * the small-corpus scale OTI operates at, dedicated cross-encoder
 * rerankers materially out-perform LLM-as-reranker (Voyage's Oct 2025
 * "Case Against LLM Rerankers" reports +12% NDCG and 9-48× lower latency
 * vs GPT-5 / Claude / Gemini reranking).
 *
 * Falls back to a no-op pass-through when VOYAGE_API_KEY is not set, so
 * dev environments without keys still work — we just skip the rerank.
 */

const VOYAGE_RERANK_URL = "https://api.voyageai.com/v1/rerank";

export interface RerankResult {
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent; rerankScore: number | null }>;
  used: boolean;
}

export async function rerankCandidates(args: {
  query: string;
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent }>;
  topK?: number;
  model?: string;
  signal?: AbortSignal;
}): Promise<RerankResult> {
  const apiKey = process.env.VOYAGE_API_KEY;
  const topK = args.topK ?? 10;

  if (!apiKey || args.candidates.length === 0) {
    return {
      candidates: args.candidates
        .slice(0, topK)
        .map((c) => ({ ...c, rerankScore: null })),
      used: false,
    };
  }

  // The reranker reads narrativeAtTime — strictly point-in-time prose, no
  // outcomeInHindsight leakage at the rerank step.
  const documents = args.candidates.map((c) => buildRerankInput(c.event));

  try {
    const res = await fetch(VOYAGE_RERANK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: args.query,
        documents,
        model: args.model ?? "rerank-2.5",
        top_k: Math.min(topK, args.candidates.length),
      }),
      signal: args.signal,
    });

    if (!res.ok) {
      console.warn(`[rerank] voyage ${res.status}: passing through`);
      return {
        candidates: args.candidates
          .slice(0, topK)
          .map((c) => ({ ...c, rerankScore: null })),
        used: false,
      };
    }

    const json = (await res.json()) as VoyageRerankResponse;

    const reranked = json.data
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .map((r) => ({
        ...args.candidates[r.index],
        rerankScore: r.relevance_score,
      }));

    return { candidates: reranked.slice(0, topK), used: true };
  } catch (err) {
    console.warn("[rerank] failed, passing through:", err);
    return {
      candidates: args.candidates
        .slice(0, topK)
        .map((c) => ({ ...c, rerankScore: null })),
      used: false,
    };
  }
}

function buildRerankInput(e: HistoricalEvent): string {
  // Keep this concise — the reranker is trained on retrieval-shape inputs,
  // not full document blobs. We feed it title + date + narrativeAtTime.
  return [
    `${e.title} (${e.date}, ${e.region})`,
    `Tags: ${e.regimeTags.join(", ")}`,
    e.narrativeAtTime,
  ].join("\n");
}

interface VoyageRerankResponse {
  object: "list";
  data: Array<{
    index: number;
    relevance_score: number;
    document?: string;
  }>;
  model: string;
  usage: { total_tokens: number };
}
