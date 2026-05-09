# Contributing

The most useful contributions to OTI are not code. They are:

1. **New events for the corpus** — if you can write a high-quality entry for an event we missed, that's the highest-leverage contribution.
2. **Better tags** — the controlled vocabulary in `src/lib/regime-tags.ts` is opinionated and incomplete. Tag refinements that make retrieval more discriminating are welcome.
3. **Verified failed-trade quotes** — every quote in `failedTrades` should have a checkable attribution. PRs that improve attribution are welcome.
4. **Asset-move corrections** — the dataset uses approximate values from public records. PRs that replace them with FRED-sourced canonical numbers are welcome.

## Adding a new event

Open `data/events.ts` and add a new entry to the `EVENTS` array. The schema is `HistoricalEventSchema` in `src/lib/types.ts` — validation runs at module load time, so a malformed entry will break the dev server immediately.

Required fields:

- `id` — kebab-case, unique. Convention: `YYYY-short-slug` (e.g. `2010-flash-crash`).
- `title` — human-readable, ~5 words.
- `date` — ISO yyyy-mm-dd, the day the event broke.
- `region` — one of `US|EU|UK|JP|CN|EM|GLOBAL`.
- `triggerType` — one of the values in `TRIGGER_TYPES`.
- `regimeTags` — 3–7 tags from `REGIME_TAGS`. **Verbatim spelling.** Tags are the structured side of retrieval; mistyped tags silently degrade Jaccard scoring.
- `surpriseFactor` — 1 (priced in) to 5 (extreme tail).
- `description` — 2–3 sentences, point-in-time framing.
- `catalyst` — the proximate trigger.
- `narrativeAtTime` — **what consensus believed _before_ the event resolved.** Critical: do not leak hindsight here.
- `outcomeInHindsight` — what actually happened. Used only by the `consensusError` and `failedTradesPattern` synthesis fields.
- `assetMoves` — return series at 1d / 5d / 1m / 3m / 6m horizons for S&P, UST10Y (bps), DXY (%), gold (%), oil (%), HY OAS (bps), VIX (level points). Use `null` when the underlying index didn't exist (pre-1990 VIX, pre-1996 HY OAS, pre-2003 real rate / breakeven, pre-2006 DXY broad). Hand-curated entries should be approximate; canonical numbers are pulled from FRED + Stooq via `pnpm refresh-prices` and merged at module-load time. Each (event, asset) gets a provenance flag rendered in the UI: "FRED" / "Stooq" (programmatically refreshed) or "approx" (hand-curated).
- `flowPatterns` — narrative description of positioning / flow dynamics.
- `failedTrades` — array of contemporary quotes. Each entry has `quote`, `attribution`, optional `sourceUrl`, optional `archiveUrl` (Wayback snapshot), and `provenance` ∈ {`verified`, `paraphrase_with_source`, `paraphrase_no_source`}. **New quotes added in v0.2+ should be `verified` with `sourceUrl` set.** Existing v0.1 paraphrases without URLs render with a visible "paraphrase" badge in the brief; adding a `sourceUrl` and bumping the provenance is one of the highest-leverage contributions.
- `consensusError` — what consensus systematically got wrong.
- `lessons` — bulleted, transferable insights.
- `sources` — at least one, with verifiable URL.
- `analyticalTrajectory` (optional, v0.6+) — see "Adding an analyticalTrajectory" below.

## Adding an analyticalTrajectory (ARISE pattern, v0.6+)

Every event optionally carries an `analyticalTrajectory` — what
consensus believed, the marginal data points that should have updated
priors, the dated decision points, the dominant bias, what good
analysts actually did. Stored at `data/trajectories.ts` keyed by
event id; merged into the event payload at module load.

**The bar for inclusion:**

- `priorBeliefs` — one-sentence summary of the dominant frame held by
  sell-side research, the financial press, and the median Fed-watcher
  in the days BEFORE the event resolved. Hardest field to write
  correctly because it's tempting to retrofit hindsight; resist.
- `marginalDataPoints` — 2-6 specific gauges that were updating priors.
  NOT "they should have known" — say "this specific gauge was telling
  them": e.g. "ABX BBB index collapsed from 95 to 50 over Q1-Q2 2007".
- `decisionPoints` — 1-4 dated inflection moments. Each is a date +
  the signal available that morning. Specific dates, not "in the
  weeks before".
- `dominantBias` — the single most common cognitive error. e.g.
  "containment bias", "precedent bias", "multilateral-coordination
  bias", "SARS-shaped historical anchoring".
- `whatGoodAnalystsDid` — operationalisable, not vibes. e.g. "Watched
  the cross-currency basis as the dollar-squeeze proxy, lengthened
  duration on the front end". NOT "stayed humble" or "did the work".

**Submitting**: open a PR adding an entry to `data/trajectories.ts`
keyed by the event id (e.g. `"2008-lehman": { ... }`). The schema is
`AnalyticalTrajectorySchema` in `src/lib/types.ts`. `pnpm
validate-event` runs the same hindsight-leakage heuristic on
trajectory text that it runs on `narrativeAtTime` — it'll flag obvious
leaks like "as it turned out" or "in retrospect".

**v0.6.1 status:** all 39 corpus events now carry trajectories — the
v0.7 N=39 milestone landed early. Future trajectory contributions
should focus on:

  - Refining existing trajectories with primary-source citations
    (Bloomberg headline timestamps, FOMC transcript excerpts, BIS
    publication dates) to upgrade `marginalDataPoints` from "this was
    visible" to "this specific source published it on this date".
  - Adding trajectories for new corpus events as they're added past
    the current 39 baseline.
  - Cross-checking dominant-bias claims against contemporaneous
    research notes, sell-side reports, and FOMC discussions.

The 20-event bounty applies to the trajectory-PR depth-of-citation
work going forward: PRs that add 5+ primary-source citations to an
existing trajectory get the same permanent contributor cite +
lifetime API access as the original corpus-card bounty.

## Tag rules

- Pick the **smallest** set of tags that meaningfully describes the regime. 3–5 is ideal; 6+ tends to dilute Jaccard retrieval.
- Tags must be drawn from `REGIME_TAGS`. To add a new tag:
  1. Add it to `REGIME_TAGS` in `src/lib/regime-tags.ts`.
  2. Update the prompt in `src/lib/prompts.ts` so the tagging LLM knows about it.
  3. Re-tag related events for consistency.
  4. Submit one PR for the new tag, separately from event additions.

## Local dev

```bash
pnpm install
cp .env.example .env.local   # add keys
pnpm dev                     # http://localhost:3000
pnpm typecheck               # before pushing
pnpm lint                    # before pushing
pnpm build                   # full build verification
```

The app works without API keys (demo examples) and without a database (Jaccard-only retrieval). The full pipeline requires either `AI_GATEWAY_API_KEY` (recommended) or a direct provider key, plus optionally `POSTGRES_URL` for embeddings.

## What we won't merge

- Events generated by an LLM without source verification.
- "Predictive" features (price targets, allocations, recommendations).
- Backtesting infrastructure. OTI is a memory tool; backtests have a different epistemic standard and a different surface area.
- New chart types beyond Tufte-style sparklines and small-multiples without a strong UX rationale. The visual register is deliberate.

## Validation pipeline

```bash
pnpm validate-event           # zod schema + integrity invariants + leakage heuristic
pnpm schema:export            # regenerate /schema/historical-event.schema.json
pnpm test                     # corpus integrity + retrieval gold-set CI
pnpm refresh-prices --event=<id>   # canonicalise asset moves via FRED + Stooq
```

GitHub Actions runs `pnpm validate-event` on every PR that touches
`data/events.ts`. The schema-export job verifies the JSON Schema is in
sync; if you've edited `src/lib/types.ts` and not regenerated, CI
fails.

The PR template at `.github/PULL_REQUEST_TEMPLATE/new-event.md` walks
contributors through the provenance checklist. Apply it via
`?template=new-event.md` on the GitHub PR URL.

## The 20-event bounty

The first 20 high-quality regime cards merged after May 2026 get a
permanent contributor cite on the methodology page and lifetime API
access (rate-limited free tier upgraded to unlimited). "High quality"
means: FRED/Stooq-verified asset moves, source-URL'd failed-trade
quotes, point-in-time narrative that survives the leakage heuristic.

Cards we'd love right now (pre-1971 + EM gaps):

  - 1944 Bretton Woods agreement
  - 1956 Suez sterling crisis
  - 1980 Hunt brothers silver corner peak (we have a stub — needs depth)
  - 1986 oil collapse to $10
  - 1989 Nikkei peak / 1990 Japan asset deflation
  - 1995 Mexico tequila aftershock (separate from Dec 1994)
  - 1999 dot-com vs LTCM tail
  - 2003 Iraq war start
  - 2005 Greenspan "conundrum"
  - 2010 Greek bailout #1
  - 2012 LIBOR scandal
  - 2017 Volcano (XIV's first warning)
  - 2018 Turkey lira crisis (we have a stub — needs depth)
  - 2022 Sri Lanka default
  - 2023 First Republic / regional-bank-2

## Style

- TypeScript everywhere. Strict mode.
- Avoid abstractions that would only be valuable for a feature we don't have yet.
- Prefer editing existing files to creating new ones.
- Comments only when the WHY is non-obvious.
- Run `pnpm format` before pushing.

If you're not sure whether something fits, open an issue first.
