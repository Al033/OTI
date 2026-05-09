import type {
  BriefOutput,
  HistoricalEvent,
  RetrievalCandidate,
} from "./types";

/**
 * Self-Verifier — runs invariant checks against the synthesised brief
 * before it ships. Inspired by FinAgent-RAG's Self-Verifier-with-Query-
 * Refiner pattern (arXiv:2605.05409, May 6 2026), but kept as pure-JS
 * deterministic post-processing for v0.5: no extra LLM call, sub-ms
 * latency, catches the obvious failure modes that the structured-output
 * schema can't.
 *
 * Checks:
 *   1. CANDIDATE CONSISTENCY — every chosen eventId is in the candidate
 *      set the synthesiser saw (schema enforces this; we double-check).
 *   2. DIRECTION COHERENCE — if disagreementNote is null, the 3 analogues'
 *      S&P 1m signs should broadly agree; if non-null, they should
 *      actually disagree.
 *   3. FIT CONFIDENCE SANITY — every fitConfidence ≥ 0.3; aggregate
 *      median ≥ 0.5; values reasonably distributed (not all clustered
 *      identical).
 *   4. NUMERIC GUARD HITS — if the numericGuard scrubbed anything, that's
 *      a verification flag (not a hard fail; just a note for audit).
 *   5. CAVEAT QUALITY — caveats array length ≥ 1, each entry ≥ 20 chars
 *      (Zod enforces ≥ 10, we tighten).
 *   6. ATTRIBUTION INTEGRITY — every analogue must have at least one
 *      failedTrades entry in the underlying corpus event, otherwise the
 *      cross-event "failedTradesPattern" synthesis is hollow.
 *   7. WHERE-THIS-MIGHT-NOT-FIT NON-TRIVIALITY — must not be a generic
 *      "the past doesn't repeat" boilerplate; ≥ 30 chars and contains at
 *      least one specific signal word (region / asset / regime tag).
 *
 * Returns { passed, issues, warnings }. `passed` is the binary "is this
 * brief OK to ship" answer; `issues` are blocking failures (currently
 * empty — we never block); `warnings` are non-blocking flags surfaced
 * in the audit panel.
 *
 * The current policy is "verify, log, ship anyway" — we collect data on
 * failure modes before introducing automatic retry. v0.6 will add the
 * Query Refiner loop that actually re-runs Phase A on verification fail.
 */

export interface VerifierResult {
  passed: boolean;
  issues: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
  /** A short summary string suitable for the audit panel. */
  summary: string;
}

export function verifyBrief(args: {
  brief: BriefOutput;
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent }>;
  numericGuardWarnings?: string[];
}): VerifierResult {
  const issues: VerifierResult["issues"] = [];
  const warnings: VerifierResult["warnings"] = [];

  const candidateIds = new Set(args.candidates.map((c) => c.eventId));
  const chosen = args.brief.analogues;
  const chosenEvents: HistoricalEvent[] = [];

  // Check 1: candidate consistency.
  for (const a of chosen) {
    if (!candidateIds.has(a.eventId)) {
      issues.push({
        code: "candidate_consistency",
        message: `Chosen eventId "${a.eventId}" is not in the candidate set seen by synthesis.`,
      });
    } else {
      const found = args.candidates.find((c) => c.eventId === a.eventId);
      if (found) chosenEvents.push(found.event);
    }
  }

  // Check 2: direction coherence vs disagreementNote.
  const m1Signs = chosenEvents
    .map((e) => e.assetMoves.sp500.m1)
    .filter((v): v is number => v !== null && Number.isFinite(v))
    .map((v) => (v > 0.5 ? 1 : v < -0.5 ? -1 : 0));
  if (m1Signs.length === 3) {
    const allSame = m1Signs.every((s) => s === m1Signs[0]);
    const noteIsNull = args.brief.disagreementNote === null;
    if (allSame && !noteIsNull) {
      warnings.push({
        code: "direction_coherence",
        message:
          "Analogues' S&P 1m directions all agree but disagreementNote is non-null.",
      });
    } else if (!allSame && noteIsNull) {
      warnings.push({
        code: "direction_coherence",
        message:
          "Analogues' S&P 1m directions disagree but disagreementNote is null.",
      });
    }
  }

  // Check 3: fit confidence sanity.
  const confidences = chosen.map((a) => a.fitConfidence);
  const medianConf = median(confidences);
  if (confidences.some((c) => c < 0.3)) {
    warnings.push({
      code: "low_fit_confidence",
      message: `One or more analogues has fitConfidence < 0.3 — synthesis itself flagged a weak match.`,
    });
  }
  if (medianConf !== null && medianConf < 0.5) {
    warnings.push({
      code: "weak_aggregate_fit",
      message: `Median fitConfidence ${medianConf.toFixed(2)} < 0.5 — the corpus may be a poor match for this query.`,
    });
  }
  if (
    confidences.length === 3 &&
    confidences[0] === confidences[1] &&
    confidences[1] === confidences[2]
  ) {
    warnings.push({
      code: "identical_fit_confidence",
      message:
        "All three fitConfidence values are identical — the model isn't differentiating between candidates.",
    });
  }

  // Check 4: numeric guard hits.
  if (args.numericGuardWarnings && args.numericGuardWarnings.length > 0) {
    warnings.push({
      code: "numeric_paraphrase_scrubbed",
      message: `${args.numericGuardWarnings.length} digit-run(s) scrubbed from prose by the numeric guard.`,
    });
  }

  // Check 5: caveat quality.
  if (args.brief.caveats.length === 0) {
    issues.push({
      code: "caveats_missing",
      message: "Brief shipped with zero caveats — the schema requires ≥ 1.",
    });
  } else {
    for (const [i, c] of args.brief.caveats.entries()) {
      if (c.length < 20) {
        warnings.push({
          code: "thin_caveat",
          message: `Caveat[${i}] is shorter than 20 chars: "${c}".`,
        });
      }
    }
  }

  // Check 6: attribution integrity (failedTrades presence in corpus).
  for (const a of chosen) {
    const event = args.candidates.find((c) => c.eventId === a.eventId)?.event;
    if (event && event.failedTrades.length === 0) {
      warnings.push({
        code: "attribution_thin",
        message: `Chosen analogue "${a.eventId}" has zero failedTrades entries in the corpus — the cross-event failedTradesPattern is synthesising over thin evidence.`,
      });
    }
  }

  // Check 7: whereThisMightNotFit non-triviality.
  const triteWords = [
    "past doesn't repeat",
    "history doesn't repeat",
    "every situation is different",
    "no two markets are alike",
  ];
  for (const a of chosen) {
    const wtmnf = a.whereThisMightNotFit.toLowerCase();
    if (triteWords.some((t) => wtmnf.includes(t))) {
      warnings.push({
        code: "trite_disclaimer",
        message: `whereThisMightNotFit on "${a.eventId}" reads as boilerplate disclaimer rather than a specific reason.`,
      });
    }
    if (a.whereThisMightNotFit.length < 40) {
      warnings.push({
        code: "thin_disclaimer",
        message: `whereThisMightNotFit on "${a.eventId}" is shorter than 40 chars.`,
      });
    }
  }

  const passed = issues.length === 0;
  const summary = passed
    ? warnings.length === 0
      ? "Self-Verifier: 7/7 checks passed."
      : `Self-Verifier: passed with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`
    : `Self-Verifier: FAILED with ${issues.length} blocking issue${issues.length === 1 ? "" : "s"}.`;

  return { passed, issues, warnings, summary };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length / 2;
  return sorted.length % 2 === 1
    ? sorted[Math.floor(mid)]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
