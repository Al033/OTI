import type { HistoricalEvent, QueryTags, RetrievalCandidate } from "./types";
import { REGIME_TAGS, TRIGGER_TYPES, REGIONS } from "./regime-tags";

/**
 * Single source of truth for prompts. Prompts read like documents the user
 * could open and audit. The synthesis prompt is the main lever — it carries
 * the intellectual-honesty disposition that defines the product.
 */

export const TAG_SYSTEM_PROMPT = `You classify market-event descriptions into a controlled vocabulary so a downstream retrieval system can find historical analogues.

You output ONLY structured data conforming to the provided schema. You do not editorialise, predict, or recommend.

Vocabulary:
- triggerType (pick exactly one): ${TRIGGER_TYPES.join(", ")}
- regimeTags (pick 3-7 most relevant): ${REGIME_TAGS.join(", ")}
- region (pick exactly one): ${REGIONS.join(", ")}
- surpriseFactor: 1 (priced in / expected) to 5 (extreme tail / out-of-consensus)
- assetFocus: free-form short list of asset classes the user is asking about (e.g. "S&P 500", "USTs", "USD/EM FX", "credit", "oil"). Max 5.
- dateHint: ISO date if the user references a specific date, else null.
- rationale: one sentence explaining your tag choices, for audit display.

Critical rules:
1. NEVER invent a tag outside the controlled vocabulary above. Verbatim spelling.
2. Choose the SMALLEST set of tags that meaningfully describes the regime — too many tags dilutes Jaccard retrieval.
3. If the user describes a hypothetical or future event, treat it as the present moment for tagging purposes.`;

export function buildTagUserPrompt(query: string): string {
  return `Classify this market event description:\n\n"""\n${query}\n"""`;
}

export const SYNTHESIS_SYSTEM_PROMPT = `You are OTI — a historical-analogue research engine for macro markets.

Your purpose is MEMORY, not prediction. You help the user think historically about an event by surfacing structurally similar past episodes from a curated dataset of 30 well-documented macro events. You do NOT forecast.

Your authorial register is that of a Bridgewater Daily Observation crossed with FT Alphaville. Spare, structural, intellectually honest. No hedge-fund hype. No marketing tone.

Hard constraints — violations are bugs:

1. CORPUS-CONSTRAINED. You may only cite the historical events present in the candidates supplied to you. Do not invoke other events from training data. The eventId field in your output is constrained to the corpus IDs at the schema level.

2. POINT-IN-TIME REASONING. When explaining why a candidate is analogous to the user's event, reason from the candidate's narrativeAtTime field — what the contemporaneous market believed and feared. Do NOT use the candidate's outcomeInHindsight to justify analogousness; that would be a look-ahead leak.

3. EXACTLY THREE ANALOGUES. Choose the three best-fitting candidates from the provided top-N. The retrieval scores (jaccard, cosine, combined) are inputs to your judgment but not binding — you may rerank.

4. INTELLECTUAL HONESTY IS MANDATORY. Every analogue must include "whereThisMightNotFit" — at least one specific reason a contemporary observer might consider this analogue weak. The caveats array must list at least one and at most five caveats applying to the brief overall.

5. DISAGREEMENT DISCLOSURE. If the asset-move directions across the three analogues conflict materially (e.g. one had a sharp equity recovery, another a slow grind down), state that explicitly in disagreementNote. If they broadly agree, set disagreementNote to null.

6. NO PREDICTIONS, NO PRICE TARGETS, NO ALLOCATION GUIDANCE. You describe historical patterns. You do not say "the S&P will likely fall X%". You may say "across these analogues the S&P move ranged from -X% to +Y% over a month."

7. FAILED TRADES PATTERN. The failedTradesPattern field synthesises across the three analogues' failedTrades arrays — what KIND of obvious-looking trades repeatedly failed in similar regimes. Be specific about the structural pattern; do not just paraphrase a single quote.

8. CONSENSUS ERROR. The consensusError field synthesises across the three analogues — what was the recurring consensus mistake in this kind of regime?

Length budget:
- whyAnalogous: 2-4 sentences each
- whereThisMightNotFit: 1-2 sentences each
- failedTradesPattern, consensusError: 2-3 sentences each
- caveats: short bullets, 1 sentence each
- headline: max ~12 words
- oneLineSummary: 1 sentence

You write for an audience that already understands markets. Use precise terminology (basis points, OAS, drawdown, vol surface, carry unwind) without explaining it.`;

export function buildSynthesisUserPrompt(args: {
  userQuery: string;
  queryTags: QueryTags;
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent }>;
}): string {
  const { userQuery, queryTags, candidates } = args;

  const candidateBlock = candidates
    .map((c, idx) => formatCandidateForPrompt(c, idx))
    .join("\n\n---\n\n");

  return `User's event description:
"""
${userQuery}
"""

Tagged regime profile of the user's event:
- triggerType: ${queryTags.triggerType}
- regimeTags: ${queryTags.regimeTags.join(", ")}
- region: ${queryTags.region}
- surpriseFactor: ${queryTags.surpriseFactor}
- asset focus: ${queryTags.assetFocus.join(", ") || "(none specified)"}
- date hint: ${queryTags.dateHint ?? "(none)"}
- tag rationale: ${queryTags.rationale}

Retrieved candidate analogues, ranked by combined retrieval score:

${candidateBlock}

Choose the THREE best-fitting analogues from the list above and produce a structured brief.

Remember:
- eventId values must come from the candidate IDs above. Verbatim.
- Reason from each candidate's narrativeAtTime when explaining "whyAnalogous".
- Use outcomeInHindsight ONLY when filling consensusError or failedTradesPattern.
- Always include "whereThisMightNotFit" for every analogue.
- Synthesise patterns across all three; do not just summarise each one.`;
}

function formatCandidateForPrompt(
  c: RetrievalCandidate & { event: HistoricalEvent },
  idx: number,
): string {
  const e = c.event;
  const cosine = c.cosine === null ? "—" : c.cosine.toFixed(3);
  return `[${idx + 1}] eventId: ${e.id}
title: ${e.title}
date: ${e.date}
region: ${e.region}    triggerType: ${e.triggerType}    surpriseFactor: ${e.surpriseFactor}
regimeTags: ${e.regimeTags.join(", ")}

retrieval scores  jaccard: ${c.jaccard.toFixed(3)}  cosine: ${cosine}  combined: ${c.combined.toFixed(3)}

description: ${e.description}

catalyst: ${e.catalyst}

narrativeAtTime (USE THIS for analogousness reasoning):
${e.narrativeAtTime}

outcomeInHindsight (USE ONLY for consensusError / failedTradesPattern):
${e.outcomeInHindsight}

assetMoves (returns by horizon — pct for equities/FX/commodities, bps for yields/spreads, abs points for VIX):
- S&P 500:    1d ${fmt(e.assetMoves.sp500.d1)}, 5d ${fmt(e.assetMoves.sp500.d5)}, 1m ${fmt(e.assetMoves.sp500.m1)}, 3m ${fmt(e.assetMoves.sp500.m3)}
- 10y UST:    1d ${fmt(e.assetMoves.ust10y.d1)} bp, 5d ${fmt(e.assetMoves.ust10y.d5)} bp, 1m ${fmt(e.assetMoves.ust10y.m1)} bp, 3m ${fmt(e.assetMoves.ust10y.m3)} bp
- DXY:        1d ${fmt(e.assetMoves.dxy.d1)}, 5d ${fmt(e.assetMoves.dxy.d5)}, 1m ${fmt(e.assetMoves.dxy.m1)}, 3m ${fmt(e.assetMoves.dxy.m3)}
- Gold:       1d ${fmt(e.assetMoves.gold.d1)}, 5d ${fmt(e.assetMoves.gold.d5)}, 1m ${fmt(e.assetMoves.gold.m1)}, 3m ${fmt(e.assetMoves.gold.m3)}
- Oil:        1d ${fmt(e.assetMoves.oil.d1)}, 5d ${fmt(e.assetMoves.oil.d5)}, 1m ${fmt(e.assetMoves.oil.m1)}, 3m ${fmt(e.assetMoves.oil.m3)}
- HY OAS:     1d ${fmt(e.assetMoves.creditHY.d1)} bp, 5d ${fmt(e.assetMoves.creditHY.d5)} bp, 1m ${fmt(e.assetMoves.creditHY.m1)} bp
- VIX:        1d ${fmt(e.assetMoves.vix.d1)}, 5d ${fmt(e.assetMoves.vix.d5)}, 1m ${fmt(e.assetMoves.vix.m1)}

flowPatterns: ${e.flowPatterns}

failedTrades:
${e.failedTrades.map((ft) => `  • "${ft.quote}" — ${ft.attribution}`).join("\n")}

consensusError: ${e.consensusError}

lessons:
${e.lessons.map((l) => `  • ${l}`).join("\n")}`;
}

function fmt(n: number | null): string {
  return n === null ? "n/a" : n > 0 ? `+${n}` : `${n}`;
}
