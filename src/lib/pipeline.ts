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
import { expandQuery, reciprocalRankFusion } from "./multi-query";
import { verifyBrief } from "./verifier";
import { buildCalibratedIntervals } from "./conformal-apply";
import type {
  PipelineResult,
  RetrievalAudit,
  RetrievalCandidate,
} from "./types";

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

  // Tagging, query-embedding, today's macro z, and paraphrase expansion
  // all run in parallel. The macro fetch is cached for 1h. Paraphrase
  // expansion is one Haiku call (~50ms, cents-per-1000) and adds 2-3
  // extra embeddings worth ~$0.0001.
  const [queryTags, queryEmbedding, todayMacroZ, paraphrases] = await Promise.all([
    tagQuery({ query: args.query, model: tagModel }),
    embedQuery(args.query),
    fetchTodayMacroZ(),
    expandQuery({ query: args.query, model: tagModel }),
  ]);

  // Primary retrieval — original query.
  const primaryRanking = await retrieve(queryTags, {
    topK: pool,
    queryEmbedding,
    queryMacroZ: todayMacroZ,
  });
  if (primaryRanking.length < 3) {
    throw new Error(
      `Retrieval returned only ${primaryRanking.length} candidates after region/score filters; loosen the regimeTags or set region=GLOBAL.`,
    );
  }

  // Paraphrase retrievals — same tags + macro z (deterministic), but
  // re-embed the paraphrase text. Skipped silently if expansion failed
  // or no Gateway key. Use a smaller pool (pool/2) per paraphrase to
  // keep total embedding cost minimal.
  const paraphraseRankings: RetrievalCandidate[][] = [];
  if (paraphrases.length > 0 && queryEmbedding) {
    const paraphraseEmbeddings = await Promise.all(
      paraphrases.map((p) => embedQuery(p)),
    );
    for (let i = 0; i < paraphrases.length; i++) {
      const pe = paraphraseEmbeddings[i];
      if (!pe) continue;
      const ranked = await retrieve(queryTags, {
        topK: Math.max(8, Math.floor(pool / 2)),
        queryEmbedding: pe,
        queryMacroZ: todayMacroZ,
      });
      if (ranked.length > 0) paraphraseRankings.push(ranked);
    }
  }

  const preRerank: RetrievalCandidate[] =
    paraphraseRankings.length === 0
      ? primaryRanking
      : reciprocalRankFusion(
          [
            { items: primaryRanking, idOf: (c) => c.eventId },
            ...paraphraseRankings.map((r) => ({
              items: r,
              idOf: (c: RetrievalCandidate) => c.eventId,
            })),
          ],
          { topK: pool },
        );

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

  const verifierAudit = verifyBrief({
    brief,
    candidates: finalCandidates,
    numericGuardWarnings: warnings,
  });
  if (!verifierAudit.passed) {
    console.warn("[pipeline] verifier issues:", verifierAudit.issues);
  }
  if (verifierAudit.warnings.length > 0) {
    console.info("[pipeline] verifier warnings:", verifierAudit.warnings);
  }

  // Conformal-calibrated intervals for the chosen 3 analogues. Null
  // when the sidecar isn't present; UI falls back to empirical bands.
  const chosenEvents = brief.analogues
    .map((a) => finalCandidates.find((c) => c.eventId === a.eventId)?.event)
    .filter((e): e is NonNullable<typeof e> => !!e);
  const calibratedIntervals = buildCalibratedIntervals(chosenEvents) ?? undefined;

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
    multiQueryCount: 1 + paraphraseRankings.length,
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
    verifierAudit,
    calibratedIntervals,
  };
}
