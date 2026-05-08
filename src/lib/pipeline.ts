import {
  tagQuery,
  synthesizeBrief,
  DEFAULT_TAG_MODEL,
  DEFAULT_SYNTH_MODEL,
} from "./llm";
import { embedQuery, QUERY_EMBEDDING_MODEL } from "./embed";
import { retrieve, hydrate, getEmbeddingsSource } from "./retrieval";
import { rerankCandidates } from "./rerank";
import { CORPUS_VERSION } from "./events";
import { fetchTodayMacroZ } from "./regime/today";
import { FUSION_ALPHA } from "./regime/fuse";
import type { PipelineResult, RetrievalAudit } from "./types";

/**
 * End-to-end orchestration: tag → embed → retrieve → rerank → synthesise.
 *
 * The returned PipelineResult is the full audit trail for the brief:
 *   - queryTags: the controlled-vocab interpretation of the input
 *   - candidates: every retrieved candidate (post-rerank) with all scores
 *   - retrievalAudit: which embedding source / rerank model was used
 *   - corpusVersion: stable hash of the corpus identity
 *   - brief: the LLM-synthesised one-pager
 *
 * The UI surfaces this via the "show your work" disclosure.
 */

export interface RunPipelineArgs {
  query: string;
  tagModel?: string;
  synthModel?: string;
  topK?: number;
  /** Pre-rerank pool size. Default 15 → reranked to topK. */
  rerankPool?: number;
}

export async function runPipeline(args: RunPipelineArgs): Promise<PipelineResult> {
  const startedAt = Date.now();

  const tagModel = args.tagModel ?? DEFAULT_TAG_MODEL;
  const synthModel = args.synthModel ?? DEFAULT_SYNTH_MODEL;
  const topK = args.topK ?? 10;
  const pool = Math.max(args.rerankPool ?? 15, topK);

  // Tagging, query-embedding, and today's macro z run in parallel.
  // The macro fetch is cached for 1h across requests, so this is cheap
  // after the first request of the hour.
  const [queryTags, queryEmbedding, todayMacroZ] = await Promise.all([
    tagQuery({ query: args.query, model: tagModel }),
    embedQuery(args.query),
    fetchTodayMacroZ(),
  ]);

  const preRerank = await retrieve(queryTags, {
    topK: pool,
    queryEmbedding,
    queryMacroZ: todayMacroZ,
  });
  if (preRerank.length < 3) {
    throw new Error(
      `Retrieval returned only ${preRerank.length} candidates after region/score filters; loosen the regimeTags or set region=GLOBAL.`,
    );
  }

  const hydrated = hydrate(preRerank);
  const reranked = await rerankCandidates({
    query: args.query,
    candidates: hydrated,
    topK,
  });

  const finalCandidates = reranked.candidates;
  const { brief, warnings } = await synthesizeBrief({
    userQuery: args.query,
    queryTags,
    candidates: finalCandidates,
    model: synthModel,
  });

  if (warnings.length > 0) {
    console.warn("[pipeline] numeric-guard warnings:", warnings);
  }

  const fusedRetrieval = !!queryEmbedding && !!todayMacroZ;
  const retrievalAudit: RetrievalAudit = {
    embeddingsSource: getEmbeddingsSource() ?? "none",
    rerankUsed: reranked.used,
    topKBeforeRerank: pool,
    topKAfterRerank: topK,
    embeddingModel: QUERY_EMBEDDING_MODEL,
    rerankModel: reranked.used ? "voyage/rerank-2.5" : null,
    fusedRetrieval,
    fusionAlpha: fusedRetrieval ? FUSION_ALPHA : undefined,
    multiQueryCount: 1,
  };

  return {
    query: args.query,
    queryTags,
    candidates: finalCandidates.map(({ event: _event, ...rest }) => rest),
    brief,
    modelTag: tagModel,
    modelSynth: synthModel,
    durationMs: Date.now() - startedAt,
    generatedAt: new Date().toISOString(),
    isDemo: false,
    corpusVersion: CORPUS_VERSION,
    retrievalAudit,
  };
}
