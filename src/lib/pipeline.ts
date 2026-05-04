import { tagQuery, synthesizeBrief, DEFAULT_TAG_MODEL, DEFAULT_SYNTH_MODEL } from "./llm";
import { retrieve, hydrate } from "./retrieval";
import type { PipelineResult } from "./types";

/**
 * End-to-end orchestration: tag → retrieve → synthesise.
 *
 * Returned PipelineResult is the full audit trail for the brief, including
 * every retrieval candidate considered and both component scores. The UI
 * surfaces this via the "show your work" disclosure.
 */

export interface RunPipelineArgs {
  query: string;
  tagModel?: string;
  synthModel?: string;
  topK?: number;
}

export async function runPipeline(args: RunPipelineArgs): Promise<PipelineResult> {
  const startedAt = Date.now();

  const tagModel = args.tagModel ?? DEFAULT_TAG_MODEL;
  const synthModel = args.synthModel ?? DEFAULT_SYNTH_MODEL;

  const queryTags = await tagQuery({ query: args.query, model: tagModel });

  const candidates = retrieve(queryTags, { topK: args.topK ?? 10 });
  if (candidates.length < 3) {
    throw new Error(
      `Retrieval returned only ${candidates.length} candidates; corpus is too small or tags too narrow.`,
    );
  }

  const hydrated = hydrate(candidates);
  const brief = await synthesizeBrief({
    userQuery: args.query,
    queryTags,
    candidates: hydrated,
    model: synthModel,
  });

  return {
    query: args.query,
    queryTags,
    candidates,
    brief,
    modelTag: tagModel,
    modelSynth: synthModel,
    durationMs: Date.now() - startedAt,
    generatedAt: new Date().toISOString(),
    isDemo: false,
  };
}
