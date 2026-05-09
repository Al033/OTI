import { NextRequest } from "next/server";
import { z } from "zod";
import { tagQuery, streamSynthesisPhaseA, streamSynthesisPhaseB, applyNumericGuard, isAllowedModel, DEFAULT_TAG_MODEL, DEFAULT_SYNTH_MODEL } from "@/lib/llm";
import { embedQuery, QUERY_EMBEDDING_MODEL } from "@/lib/embed";
import { retrieve, hydrate, getEmbeddingsSource } from "@/lib/retrieval";
import { rerankCandidates } from "@/lib/rerank";
import { fetchTodayMacroZ } from "@/lib/regime/today";
import { FUSION_ALPHA } from "@/lib/regime/fuse";
import { verifyBrief } from "@/lib/verifier";
import { buildCalibratedIntervals } from "@/lib/conformal-apply";
import { expandQuery, reciprocalRankFusion } from "@/lib/multi-query";
import { sanitiseUserQuery } from "@/lib/prompts";
import {
  consumeRateLimitToken,
  rateLimitKey,
  looksLikeBot,
} from "@/lib/rate-limit";
import { CORPUS_VERSION } from "@/lib/events";
import { saveBrief, briefIdFor } from "@/lib/brief-store";
import type {
  AnalogueOutput,
  BriefOutput,
  HistoricalEvent,
  PipelineResult,
  RetrievalAudit,
  RetrievalCandidate,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RequestSchema = z.object({
  query: z.string().min(8).max(2000),
  tagModel: z.string().optional(),
  synthModel: z.string().optional(),
});

/**
 * Streaming variant of /api/analyze. Emits newline-delimited JSON events:
 *
 *   {"kind":"started"}
 *   {"kind":"queryTags","queryTags":...}
 *   {"kind":"candidates","candidates":[...],"retrievalAudit":...}
 *   {"kind":"phaseA","partial":{headline?,oneLineSummary?,analogues?,disagreementNote?}}
 *   ...
 *   {"kind":"phaseAFinal","data":...}
 *   {"kind":"phaseB","partial":{failedTradesPattern?,consensusError?,caveats?}}
 *   ...
 *   {"kind":"phaseBFinal","data":...}
 *   {"kind":"complete","result":<full PipelineResult>,"briefId":"..."}
 *   {"kind":"error","code":"..."}
 *
 * The client reads the stream line-by-line and progressively updates state.
 */

export async function POST(req: NextRequest) {
  // Bot + rate-limit guards (same shape as the JSON endpoint).
  if (looksLikeBot(req)) {
    return new Response(
      ndjson({ kind: "error", code: "bot_detected" }),
      { status: 429, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }
  const rl = consumeRateLimitToken(rateLimitKey(req));
  if (!rl.ok) {
    return new Response(
      ndjson({
        kind: "error",
        code: "rate_limited",
        resetSeconds: rl.resetSeconds,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/x-ndjson",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rl.resetSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      ndjson({ kind: "error", code: "invalid_json" }),
      { status: 400, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      ndjson({ kind: "error", code: "invalid_request" }),
      { status: 400, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }
  const { tagModel, synthModel } = parsed.data;
  const query = sanitiseUserQuery(parsed.data.query);
  if (query.length < 8) {
    return new Response(
      ndjson({ kind: "error", code: "query_too_short_after_sanitisation" }),
      { status: 400, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }
  if (tagModel && !isAllowedModel(tagModel)) {
    return new Response(
      ndjson({ kind: "error", code: "tag_model_not_allowed" }),
      { status: 400, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }
  if (synthModel && !isAllowedModel(synthModel)) {
    return new Response(
      ndjson({ kind: "error", code: "synth_model_not_allowed" }),
      { status: 400, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }
  if (
    !process.env.AI_GATEWAY_API_KEY &&
    !process.env.ANTHROPIC_API_KEY &&
    !process.env.OPENAI_API_KEY
  ) {
    return new Response(
      ndjson({ kind: "error", code: "no_provider_configured" }),
      { status: 503, headers: { "Content-Type": "application/x-ndjson" } },
    );
  }

  const startedAt = Date.now();
  const tagModelFinal = tagModel ?? DEFAULT_TAG_MODEL;
  const synthModelFinal = synthModel ?? DEFAULT_SYNTH_MODEL;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (payload: unknown) =>
        controller.enqueue(encoder.encode(ndjson(payload)));

      try {
        send({ kind: "started" });

        // Tagging, query embedding, today's macro z, and paraphrase
        // expansion in parallel. The first three are cheap; expansion
        // is one Haiku call.
        const [queryTags, queryEmbedding, todayMacroZ, paraphrases] = await Promise.all([
          tagQuery({ query, model: tagModelFinal }),
          embedQuery(query),
          fetchTodayMacroZ(),
          expandQuery({ query, model: tagModelFinal }),
        ]);
        send({ kind: "queryTags", queryTags });

        // Primary retrieval — original query.
        const primaryRanking = await retrieve(queryTags, {
          topK: 15,
          queryEmbedding,
          queryMacroZ: todayMacroZ,
        });
        if (primaryRanking.length < 3) {
          send({ kind: "error", code: "too_few_candidates" });
          controller.close();
          return;
        }

        // Paraphrase retrievals + RRF fusion.
        const paraphraseRankings: RetrievalCandidate[][] = [];
        if (paraphrases.length > 0 && queryEmbedding) {
          const paraphraseEmbeddings = await Promise.all(
            paraphrases.map((p) => embedQuery(p)),
          );
          for (let i = 0; i < paraphrases.length; i++) {
            const pe = paraphraseEmbeddings[i];
            if (!pe) continue;
            const ranked = await retrieve(queryTags, {
              topK: 10,
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
                { topK: 15 },
              );

        const hydrated = hydrate(preRerank);
        const reranked = await rerankCandidates({
          query,
          candidates: hydrated,
          topK: 10,
        });
        const finalCandidates = reranked.candidates;

        const fusedRetrieval = !!queryEmbedding && !!todayMacroZ;
        const retrievalAudit: RetrievalAudit = {
          embeddingsSource: getEmbeddingsSource() ?? "none",
          rerankUsed: reranked.used,
          topKBeforeRerank: 15,
          topKAfterRerank: 10,
          embeddingModel: QUERY_EMBEDDING_MODEL,
          rerankModel: reranked.used ? "voyage/rerank-2.5" : null,
          fusedRetrieval,
          fusionAlpha: fusedRetrieval ? FUSION_ALPHA : undefined,
          multiQueryCount: 1 + paraphraseRankings.length,
        };

        send({
          kind: "candidates",
          candidates: finalCandidates.map(({ event: _event, ...rest }) => rest),
          retrievalAudit,
        });

        // Phase A: streaming.
        const phaseAStream = streamSynthesisPhaseA({
          userQuery: query,
          queryTags,
          candidates: finalCandidates,
          model: synthModelFinal,
        });

        let phaseAFinal: PhaseAObject | null = null;
        for await (const partial of phaseAStream.partialObjectStream) {
          send({ kind: "phaseA", partial });
        }
        // After the stream ends, the AI SDK exposes the final object.
        phaseAFinal = (await phaseAStream.object) as PhaseAObject;
        send({ kind: "phaseAFinal", data: phaseAFinal });

        // Phase B: now that we know which 3 events were chosen.
        const chosen: HistoricalEvent[] = phaseAFinal.analogues.map((a) => {
          const found = finalCandidates.find((c) => c.eventId === a.eventId);
          if (!found) {
            throw new Error(`Phase A returned eventId ${a.eventId} not in candidates`);
          }
          return found.event;
        });

        const phaseBStream = streamSynthesisPhaseB({
          userQuery: query,
          queryTags,
          chosen,
          model: synthModelFinal,
        });

        for await (const partial of phaseBStream.partialObjectStream) {
          send({ kind: "phaseB", partial });
        }
        const phaseBFinal = (await phaseBStream.object) as PhaseBObject;
        send({ kind: "phaseBFinal", data: phaseBFinal });

        // Merge into final brief and apply numeric guard.
        const merged: BriefOutput = {
          headline: phaseAFinal.headline,
          oneLineSummary: phaseAFinal.oneLineSummary,
          analogues: phaseAFinal.analogues as AnalogueOutput[],
          negativeAnalogue:
            (phaseAFinal as PhaseAObject & {
              negativeAnalogue: BriefOutput["negativeAnalogue"];
            }).negativeAnalogue ?? null,
          disagreementNote: phaseAFinal.disagreementNote,
          failedTradesPattern: phaseBFinal.failedTradesPattern,
          consensusError: phaseBFinal.consensusError,
          caveats: phaseBFinal.caveats,
        };
        const { scrubbed: brief, warnings } = applyNumericGuard(merged);
        if (warnings.length > 0) {
          console.warn("[analyze/stream] numeric-guard warnings:", warnings);
        }

        const verifierAudit = verifyBrief({
          brief,
          candidates: finalCandidates,
          numericGuardWarnings: warnings,
        });
        if (!verifierAudit.passed) {
          console.warn("[analyze/stream] verifier issues:", verifierAudit.issues);
        }

        const chosenEvents = brief.analogues
          .map((a) => finalCandidates.find((c) => c.eventId === a.eventId)?.event)
          .filter((e): e is NonNullable<typeof e> => !!e);
        const calibratedIntervals =
          buildCalibratedIntervals(chosenEvents) ?? undefined;

        const result: PipelineResult = {
          query,
          queryTags,
          candidates: finalCandidates.map(({ event: _event, ...rest }) => rest as RetrievalCandidate),
          brief,
          modelTag: tagModelFinal,
          modelSynth: synthModelFinal,
          durationMs: Date.now() - startedAt,
          generatedAt: new Date().toISOString(),
          isDemo: false,
          corpusVersion: CORPUS_VERSION,
          retrievalAudit,
          verifierAudit,
          calibratedIntervals,
        };

        const briefId = briefIdFor(
          query,
          tagModelFinal,
          synthModelFinal,
          CORPUS_VERSION,
        );
        // Fire-and-forget: failure to persist shouldn't kill the stream.
        saveBrief(briefId, result).catch((err) => {
          console.warn("[analyze/stream] saveBrief failed:", err);
        });

        send({ kind: "complete", result, briefId });
        controller.close();
      } catch (err) {
        console.error("[analyze/stream] failed:", err);
        send({ kind: "error", code: "pipeline_failed" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Accel-Buffering": "no",
    },
  });
}

function ndjson(obj: unknown): string {
  return JSON.stringify(obj) + "\n";
}

interface PhaseAObject {
  headline: string;
  oneLineSummary: string;
  analogues: Array<{
    eventId: string;
    whyAnalogous: string;
    whereThisMightNotFit: string;
    fitConfidence: number;
  }>;
  disagreementNote: string | null;
}

interface PhaseBObject {
  failedTradesPattern: string;
  consensusError: string;
  caveats: string[];
}
