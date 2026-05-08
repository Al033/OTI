/**
 * End-to-end orchestration for a single day's regime brief: snapshot
 * vector → match → synthesise → persist. Idempotent on date — if a
 * brief already exists, returns it without regenerating.
 *
 * Used by:
 *   - /api/cron/regime-snapshot (daily 21:05 UTC)
 *   - /today and /today/[date] when the requested day has no persisted
 *     brief yet AND we're allowed to generate on demand (dev only).
 */

import { buildRegimeSnapshot } from "./snapshot";
import { matchRegime, hydrateMatch } from "./match";
import { buildDailyBrief, type DailyBrief } from "./brief";
import {
  saveSnapshot,
  saveMatches,
  saveBrief,
  getSnapshot,
  getMatches,
  getDailyBrief,
} from "./store";
import { CORPUS_VERSION } from "@/lib/events";
import { DEFAULT_SYNTH_MODEL } from "@/lib/llm";

export interface OrchestrateResult {
  date: string;
  zVector: Array<number | null>;
  rawVector: Array<number | null>;
  positives: Array<{ eventId: string; similarity: number; distance: number }>;
  negative:
    | {
        eventId: string;
        similarity: number;
        distance: number;
        disambiguator: string;
      }
    | null;
  brief: DailyBrief;
  modelSynth: string;
  corpusVersion: string;
  source: "cached" | "freshly_generated";
}

export interface OrchestrateOptions {
  /** ISO date. Defaults to today (UTC date). */
  asOf?: string;
  /** Override the default synthesis model. */
  synthModel?: string;
  /** When true, bypass the cache and re-run every step. */
  force?: boolean;
  /** When true, skip persistence (for ad-hoc tests). */
  dryRun?: boolean;
}

export async function orchestrateDailyBrief(
  opts: OrchestrateOptions = {},
): Promise<OrchestrateResult> {
  const asOf = opts.asOf ?? new Date().toISOString().slice(0, 10);
  const synthModel = opts.synthModel ?? DEFAULT_SYNTH_MODEL;

  // Cache hit?
  if (!opts.force) {
    const existing = await getDailyBrief(asOf);
    if (existing) {
      const snap = await getSnapshot(asOf);
      const matches = await getMatches(asOf);
      if (snap && matches) {
        return {
          date: asOf,
          zVector: snap.zVector,
          rawVector: snap.rawVector,
          positives: matches.positives,
          negative: matches.negative,
          brief: existing.brief,
          modelSynth: existing.modelSynth,
          corpusVersion: existing.corpusVersion,
          source: "cached",
        };
      }
    }
  }

  // 1. Snapshot.
  const snap = await buildRegimeSnapshot(asOf);
  if (!opts.dryRun) {
    await saveSnapshot({
      date: asOf,
      rawVector: snap.rawVector,
      zVector: snap.zVector,
      meta: snap.meta as unknown as Record<string, unknown>,
      createdAt: new Date(),
    });
  }

  // 2. Match.
  const match = await matchRegime({ todayZ: snap.zVector, topK: 3 });
  if (match.positives.length < 3) {
    throw new Error(
      `regime match returned only ${match.positives.length}/3 positives; ` +
        `corpus centroids may be missing — run \`pnpm regime:centroids\``,
    );
  }
  const hydrated = hydrateMatch(match);

  if (!opts.dryRun) {
    await saveMatches({
      date: asOf,
      positives: match.positives,
      negative: match.negative,
      createdAt: new Date(),
    });
  }

  // 3. Synthesise.
  const { brief } = await buildDailyBrief({
    asOf,
    todayZ: snap.zVector,
    positives: hydrated.positives,
    negative: hydrated.negative,
    model: synthModel,
  });

  if (!opts.dryRun) {
    await saveBrief({
      date: asOf,
      brief,
      modelSynth: synthModel,
      corpusVersion: CORPUS_VERSION,
    });
  }

  return {
    date: asOf,
    zVector: snap.zVector,
    rawVector: snap.rawVector,
    positives: match.positives,
    negative: match.negative,
    brief,
    modelSynth: synthModel,
    corpusVersion: CORPUS_VERSION,
    source: "freshly_generated",
  };
}
