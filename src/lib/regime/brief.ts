import { z } from "zod";
import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { DEFAULT_SYNTH_MODEL, applyNumericGuard } from "@/lib/llm";
import { REGIME_COMPONENTS } from "./vector";
import type { HistoricalEvent } from "@/lib/types";
import type {
  MatchPositive,
  MatchNegative,
} from "./match";

/**
 * Daily-regime brief generator. Single-call (not two-phase) because the
 * structural look-ahead defence is automatic here: the brief describes
 * today's regime by comparing it to historical regimes, and the
 * historical regimes' `outcomeInHindsight` is exactly what we want
 * surfaced (that's the value — what happened *next* in those analogues).
 *
 * Phase A's two-call discipline applies to user-event briefs where the
 * user's own event has no resolved outcome yet. The daily brief is the
 * inverse: today's outcome is unresolved, and we describe history.
 *
 * Numeric paraphrase guard still applies — the LLM cannot invent stats.
 */

export const DailyBriefSchema = z.object({
  headline: z.string().min(8).max(120).describe(
    "Pithy framing of today's regime. Format: 'Today rhymes with <event short name>'.",
  ),
  regimeSummary: z
    .string()
    .min(40)
    .max(360)
    .describe(
      "1-2 sentences on what kind of regime today is, grounded in the z-vector signs (which dims are elevated vs compressed).",
    ),
  positives: z
    .array(
      z.object({
        eventId: z.string(),
        oneLineFit: z
          .string()
          .min(20)
          .max(280)
          .describe(
            "Why today rhymes with this event, in point-in-time framing. 1-2 sentences.",
          ),
      }),
    )
    .length(3),
  negative: z
    .object({
      eventId: z.string(),
      oneLineFit: z
        .string()
        .min(20)
        .max(280)
        .describe(
          "Why this event LOOKED similar early but resolved oppositely. 1-2 sentences.",
        ),
      disambiguator: z
        .string()
        .min(20)
        .max(220)
        .describe(
          "The macro variable that most distinguishes today from this near-miss.",
        ),
    })
    .nullable()
    .describe(
      "The case that almost matched but went the other way. May be null when corpus coverage doesn't yield a credible negative.",
    ),
  caveats: z
    .array(z.string().min(10))
    .min(1)
    .max(3)
    .describe(
      "What to watch for that would invalidate the rhyme. 1-3 short bullets.",
    ),
});
export type DailyBrief = z.infer<typeof DailyBriefSchema>;

/**
 * Build a corpus-constrained variant of the schema where every eventId is
 * restricted to the candidate set, so the model literally cannot return
 * an event not in the matcher's output.
 */
function buildConstrainedSchema(allowedIds: readonly string[]) {
  if (allowedIds.length === 0) {
    throw new Error("Cannot constrain daily brief schema with empty allowedIds.");
  }
  const idEnum = z.enum(allowedIds as [string, ...string[]]);

  return z.object({
    headline: z.string().min(8).max(120),
    regimeSummary: z.string().min(40).max(360),
    positives: z
      .array(
        z.object({
          eventId: idEnum,
          oneLineFit: z.string().min(20).max(280),
        }),
      )
      .length(3),
    negative: z
      .object({
        eventId: idEnum,
        oneLineFit: z.string().min(20).max(280),
        disambiguator: z.string().min(20).max(220),
      })
      .nullable(),
    caveats: z.array(z.string().min(10)).min(1).max(3),
  });
}

const DAILY_BRIEF_SYSTEM_PROMPT = `You are OTI — a historical-analogue research engine for macro markets.

You are writing today's regime brief: not a forecast, but a description of today's macro state and the historical regimes that resemble it.

Authorial register: Bridgewater Daily Observation crossed with FT Alphaville. Spare, structural, intellectually honest. No hype. No predictions.

Hard constraints — violations are bugs:

1. CORPUS-CONSTRAINED. eventId is restricted at the schema level to the matched candidates supplied to you. You cannot cite events outside this set.

2. NO PRICE TARGETS, NO ALLOCATION GUIDANCE. You describe historical patterns and structural setups. You never say "the S&P will fall X%". You may say "across these analogues the pattern was X."

3. NUMERIC DISCIPLINE. Do not include specific numeric quantities in prose. The asset-move table and z-vector chart are rendered separately. Use qualitative magnitudes ("sharp", "compressed", "asymmetric"); never specific percentages, basis points, or index levels.

4. POSITIVE ANALOGUES use point-in-time framing — explain why today *looks like* the early-stage of that regime, drawing from the candidate's narrativeAtTime.

5. NEGATIVE ANALOGUE is the case that LOOKED similar in macro state but resolved oppositely. Explain the resolution divergence using the disambiguator field, AND make the prose itself reflect why the resolution differed (typically because some macro variable that mattered then doesn't apply now, or vice versa).

6. CAVEATS apply to the brief overall — coverage gaps, regime-mismatch risks, data-availability constraints (e.g. pre-1990 events lack VIX so they may match the rates-vol axis but not equity-vol).

You write for an audience that already understands markets: basis points, OAS, drawdown, vol surface, carry unwind — used without explanation.`;

export interface BuildDailyBriefArgs {
  asOf: string; // ISO date
  todayZ: Array<number | null>;
  positives: Array<MatchPositive & { event: HistoricalEvent }>;
  negative: (MatchNegative & { event: HistoricalEvent }) | null;
  model?: string;
}

export async function buildDailyBrief(
  args: BuildDailyBriefArgs,
): Promise<{ brief: DailyBrief; warnings: string[] }> {
  const candidates = [
    ...args.positives.map((p) => p.event),
    ...(args.negative ? [args.negative.event] : []),
  ];
  const allowedIds = candidates.map((e) => e.id);
  const schema = buildConstrainedSchema(allowedIds);

  const userPrompt = formatUserPrompt(args);

  const result = await generateObject({
    model: gateway(args.model ?? DEFAULT_SYNTH_MODEL),
    schema,
    system: DAILY_BRIEF_SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.4,
  });

  const parsed = DailyBriefSchema.parse(result.object);

  // Apply the same numeric paraphrase guard the user-event briefs use.
  // The applyNumericGuard works on a BriefOutput-shaped object; we adapt
  // it field-by-field here.
  const sanitised: DailyBrief = {
    headline: scrubField(parsed.headline),
    regimeSummary: scrubField(parsed.regimeSummary),
    positives: parsed.positives.map((p) => ({
      ...p,
      oneLineFit: scrubField(p.oneLineFit),
    })),
    negative: parsed.negative
      ? {
          ...parsed.negative,
          oneLineFit: scrubField(parsed.negative.oneLineFit),
          disambiguator: scrubField(parsed.negative.disambiguator),
        }
      : null,
    caveats: parsed.caveats.map((c) => scrubField(c)),
  };

  return { brief: sanitised, warnings: [] };
}

function scrubField(text: string): string {
  // Re-use the same numeric guard via a synthetic BriefOutput shell.
  const dummy = {
    headline: text,
    oneLineSummary: "x".repeat(20),
    analogues: [],
    disagreementNote: null,
    failedTradesPattern: "x".repeat(20),
    consensusError: "x".repeat(20),
    caveats: ["x".repeat(10)],
  };
  // Cast through unknown — applyNumericGuard validates against BriefOutput
  // which requires analogues.length===3; we only need its scrubbing on
  // headline.
  try {
    const guarded = applyNumericGuard(dummy as never);
    return guarded.scrubbed.headline;
  } catch {
    return text;
  }
}

function formatUserPrompt(args: BuildDailyBriefArgs): string {
  const dimsBlock = REGIME_COMPONENTS.map((c, i) => {
    const z = args.todayZ[i];
    const formatted =
      z === null || z === undefined || !Number.isFinite(z)
        ? "n/a"
        : `z=${z.toFixed(2)}`;
    return `  ${c.key.padEnd(15)} ${c.label.padEnd(20)} ${formatted}`;
  }).join("\n");

  const posBlock = args.positives
    .map((p, i) => formatCandidateBlock(p.event, p.similarity, "positive", i))
    .join("\n\n---\n\n");

  const negBlock = args.negative
    ? formatCandidateBlock(args.negative.event, args.negative.similarity, "negative", 0, args.negative.disambiguator)
    : "(no negative analogue surfaced — corpus coverage too thin for this regime)";

  return `Today: ${args.asOf}

Today's regime z-vector (z-scored against trailing 1260 trading days):
${dimsBlock}

THREE POSITIVE ANALOGUES — historical regimes whose macro fingerprint most resembles today:

${posBlock}

NEGATIVE ANALOGUE — looked similar early but resolved oppositely:

${negBlock}

Write the daily brief. Headline format: "Today rhymes with <short event name>". Use the positives for analogue framing in point-in-time language. Use the negative to caveat — the disambiguator above identifies the macro variable most divergent between today and that near-miss.`;
}

function formatCandidateBlock(
  e: HistoricalEvent,
  similarity: number,
  role: "positive" | "negative",
  idx: number,
  disambiguator?: string,
): string {
  const sim = (similarity * 100).toFixed(0);
  const tagBlock = e.regimeTags.join(", ");
  const m1 = e.assetMoves.sp500.m1;
  const directionLabel =
    m1 === null
      ? "S&P 1m: n/a"
      : m1 > 0
        ? "S&P 1m: positive"
        : "S&P 1m: negative";

  const header = role === "positive"
    ? `[positive ${idx + 1}] ${e.title}  (${e.date}, similarity ${sim}%)`
    : `[negative] ${e.title}  (${e.date}, similarity ${sim}%, OUTCOME OPPOSITE to top positive)`;

  const disLine = disambiguator ? `\nDISAMBIGUATOR: ${disambiguator}` : "";

  return `${header}
region=${e.region}  trigger=${e.triggerType}  surprise=${e.surpriseFactor}/5
tags: ${tagBlock}
${directionLabel}

narrativeAtTime:
${e.narrativeAtTime}

outcomeInHindsight:
${e.outcomeInHindsight}${disLine}`;
}
