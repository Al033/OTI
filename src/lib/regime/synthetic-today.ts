/**
 * Synthetic OTI Daily preview — renders /today as a fully-populated brief
 * even when no FRED key + Postgres is wired up. The cron path (snapshot
 * → match → brief → publish) is the SOURCE OF TRUTH; this module exists
 * so the launch sequence (Show HN, Bluesky, /today/<date> permalinks
 * shared in tweets) lands on a real-shaped page from minute one rather
 * than a "configure POSTGRES_URL" placeholder.
 *
 * Editorial choices baked in:
 *
 *   - The z-vector reflects the May 2026 macro state the W4 essay
 *     ("The closest analogue to the May 2026 Treasury curve isn't 1973.
 *     It's September 1998.") argues for: term curve resteepening from
 *     inverted, real rates compressed, dollar soft, vol contained but
 *     stretched, HY OAS contained, policy stance below trailing mean
 *     (cuts priced).
 *
 *   - Three positives selected to stress-test the rhyme — 1998 Russia /
 *     LTCM (anchor), 2007 BNP Paribas (early-in-the-unwind framing),
 *     2024 Yen carry unwind (most recent compressed-vol-then-spike).
 *
 *   - Negative analogue is 2018 Volmageddon — vol re-priced violently
 *     against an apparently similar setup, but Fed direction was
 *     opposite. Disambiguator does the work.
 *
 *   - Every prose field passes the same point-in-time + numeric-guard
 *     hygiene the cron path enforces.
 *
 * When the cron starts persisting, getRecentBriefs(7) returns rows and
 * the synthetic path is bypassed automatically. The synthetic preview
 * is rendered with a clearly-labelled "PREVIEW" badge so it never
 * masquerades as a live brief.
 */

import type { DailyBrief } from "./brief";

export const SYNTHETIC_DATE = "2026-05-09"; // current date per project clock

/**
 * Hand-curated z-vector for the synthetic preview, in the canonical
 * REGIME_COMPONENTS order:
 *   [vix, move, hy_oas, term_slope, real_rate, breakeven_5y, dollar, policy_stance]
 *
 * Values reflect the May 2026 macro state the W4 essay argues for —
 * compressed equity vol, slightly elevated rates vol, contained credit,
 * resteepening curve, compressed real rates, normal breakevens, soft
 * dollar, dovish policy stance.
 */
export const SYNTHETIC_Z_VECTOR: Array<number | null> = [
  -0.85, // vix          — equity vol compressed
  0.45, // move          — rates vol slightly elevated
  -0.3, // hy_oas        — credit contained
  1.65, // term_slope    — meaningfully resteepening
  -1.2, // real_rate     — real rates compressed
  0.15, // breakeven_5y  — anchored
  -1.05, // dollar       — soft dollar regime
  -0.95, // policy_stance — cutting cycle, below trailing mean
];

/**
 * The hand-curated brief. Headline format matches the live brief schema:
 * "Today rhymes with <event short name>".
 */
export const SYNTHETIC_BRIEF: DailyBrief = {
  headline: "Today rhymes with September 1998: the resteepening compression",
  regimeSummary:
    "Equity vol compressed, term curve resteepening from inversion, real rates falling, dollar soft, policy stance turning dovish — the macro signature of late-cycle capital reallocating away from carry. The historical centroids that match this fingerprint share a common shape: mid-cycle setups where the rates side of the book has already turned but equity vol hasn't yet caught up.",
  positives: [
    {
      eventId: "1998-russia-ltcm",
      oneLineFit:
        "Curve was resteepening into compressed equity vol, dollar was rolling over, and the perceived stable-carry trades sat on a narrow base of leveraged participants. The opening conditions look strikingly similar — including the false-signal lull before the cross-asset re-rating accelerated.",
    },
    {
      eventId: "2007-bnp-paribas",
      oneLineFit:
        "Real rates were already falling, the curve was bull-steepening, and the funding side of structured products was visibly cracking while equity indices held. The early-in-the-unwind framing is the live one — first-order shocks travel through funding before they show up in equity vol.",
    },
    {
      eventId: "2024-yen-carry-unwind",
      oneLineFit:
        "A carry regime that priced like it would extend, set against a dovish-pivot rates backdrop and a soft dollar — until the FX leg moved sharply enough that the convexity flipped overnight. The macro fingerprint is closer than the calendar distance suggests.",
    },
  ],
  negative: {
    eventId: "2018-volmageddon",
    oneLineFit:
      "Looked similar on the vol-compression and complacency axes — short-vol structures had built up against a backdrop that read as benign — but the Fed was tightening, not easing, and the curve was flattening, not steepening. Vol re-priced violently for reasons that don't apply now.",
    disambiguator:
      "Today's policy stance is dovish (cuts priced and delivered) and the term curve is resteepening; in early 2018 the Fed was mid-hike and the curve was flattening. Same surface vol-compression, opposite rates regime — the variable that turned a complacent setup into a tape event.",
  },
  caveats: [
    "Pre-1990 events lack a VIX series — the rhyme rests on rates, dollar, and credit dimensions; equity-vol comparability is thinner than it looks.",
    "The 1998 anchor rhymes on macro fingerprint; market microstructure (passive share, dealer balance sheets, basis dynamics) is materially different. Treat the analogue as a structural template, not a calendar mapping.",
    "Synthetic preview — the live cron flow (FRED snapshot → k-NN → LLM brief) replaces this once POSTGRES_URL + FRED_API_KEY are wired up.",
  ],
};

/**
 * Hand-set similarities corresponding to the three positives + negative.
 * Loose calibration: top-1 highest, monotonically decreasing for the
 * trailing two positives, and the negative sits between positive #2 and
 * positive #3 — that's structurally correct for a near-miss.
 */
export const SYNTHETIC_SIMILARITIES = {
  positives: [0.78, 0.71, 0.64],
  negative: 0.67,
};

/**
 * Convenience bundle for pages that need the full preview state in one
 * read.
 */
export interface SyntheticTodayPreview {
  date: string;
  brief: DailyBrief;
  zVector: Array<number | null>;
  similarities: { positives: number[]; negative: number };
  isSynthetic: true;
}

export function getSyntheticTodayPreview(): SyntheticTodayPreview {
  return {
    date: SYNTHETIC_DATE,
    brief: SYNTHETIC_BRIEF,
    zVector: SYNTHETIC_Z_VECTOR,
    similarities: SYNTHETIC_SIMILARITIES,
    isSynthetic: true,
  };
}
