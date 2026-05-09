# OTI

[![CI](https://github.com/Al033/OTI/actions/workflows/ci.yml/badge.svg)](https://github.com/Al033/OTI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Markets don't predict — they remember.**
> A historical-analogue research engine for macro markets.
> Memory, not prediction.

Type a market event in plain English. OTI streams a one-page brief with three historical analogues, asset behaviour over the next month, flow patterns, the trades that looked obvious but failed, and where consensus went wrong — from a curated corpus of 30 macro events, 1971–2025.

What used to cost $30k/yr at BCA, $10k/mo at Kensho, or a Bloomberg terminal — free, open, and intellectually honest about its limits.

---

## What this is

Every other LLM-in-finance project pretends to predict. They mostly fail and the audience is sceptical. OTI is the opposite: a tool for **memory and pattern recognition**, not forecasting. That positioning is the moat.

The product is one screen. Type an event:

> _"Trump announces 25% tariffs on essentially all US trading partners."_

And get a one-page brief that:

1. **Picks three historical analogues** from a curated corpus of 30 events, with reasoning grounded in each event's _point-in-time_ narrative (not retrospective hindsight).
2. **Shows asset behaviour** at 1d / 5d / 1m / 3m / 6m horizons across S&P, USTs, USD, gold, oil, HY OAS, and VIX — small-multiples Tufte sparklines per asset, per analogue, with hover-to-reveal exact values.
3. **Synthesises the recurring failed-trade pattern** across the three regimes — the obvious-looking trade that didn't work.
4. **Surfaces where consensus went wrong** — the systematic mistake markets made in similar regimes.
5. **Discloses every retrieved candidate** with Jaccard + cosine + RRF combined + rerank scores. The 7 not chosen are still visible. No cherry-picking.
6. **Is honest about fit.** Every analogue includes "where this might not fit"; the brief includes 1–5 caveats; if the three analogues' likely paths conflict, a disagreement banner says so above the fold.

## Why this is different

- **Corpus-of-reasoning, not just corpus-of-outcomes.** Every event optionally carries an `analyticalTrajectory` — what consensus believed, the marginal data points that should have updated priors, the dated decision points, the dominant bias that misled most analysts, what good analysts actually did. Inspired by [ARISE (arXiv:2605.05409)](https://arxiv.org/abs/2605.03242). Phase A injects the trajectory as a cognitive scaffold; the brief reasons over *how to think* about the regime, not just what happened in it.
- **Two-phase synthesis with structural look-ahead defence.** Phase A (analogue selection) only sees `narrativeAtTime` and the t=0 market reaction — never the longer-horizon outcome. Phase B writes the cross-event consensus error and failed-trade pattern with the full hindsight payload. Look-ahead bias prevention is enforced by the prompt context, not by trust.
- **Corpus-constrained synthesis.** The Phase A schema constrains `eventId` to a `z.enum(...candidate IDs)` built dynamically per request. The model literally cannot return events outside the retrieved candidates.
- **Numeric paraphrase guard.** Every prose field is post-processed: digit-runs that aren't whitelisted (years, indices, sample-sizes) get scrubbed. The asset-move table is rendered deterministically from the corpus; the LLM never invents stats.
- **`narrativeAtTime` ≠ `outcomeInHindsight`.** Every event stores point-in-time consensus separately from what actually happened. Embeddings are computed only over the point-in-time text — no leak at the cosine-similarity step.
- **Hybrid retrieval with macro fusion + multi-query expansion + cross-encoder rerank.** Jaccard over the controlled regime-tag vocabulary, plus cosine over [voyage-4-large](https://blog.voyageai.com/2026/01/15/voyage-4/) 1024d text embeddings *concatenated with the standardised macro-state z-vector* (the [History Rhymes](https://arxiv.org/abs/2511.09754) pattern, α=0.5). User queries are expanded into 2-3 paraphrases via Haiku and retrieval is RRF-fused across all parallel rankings; region is a hard filter; a [Voyage rerank-2.5](https://blog.voyageai.com/2025/10/22/the-case-against-llms-as-rerankers/) cross-encoder pass shortens top-15 → top-10. Every score published per candidate.
- **Self-Verifier on every brief** — 7 deterministic invariant checks (candidate consistency, direction coherence, fit-confidence sanity, attribution integrity, whereThisMightNotFit non-triviality, …). Tone-coded badge in the brief header.
- **Negative-analogue retrieval on every brief.** Phase A picks an optional 4th candidate that scored high on macro similarity but whose t=0 reaction was OPPOSITE to the chosen-3 majority — operationalises [CHR (arXiv:2604.04593)](https://arxiv.org/abs/2604.04593). Tells you what almost matched but went the other way.
- **Calibrated 80% intervals on @1m asset returns.** Leave-one-out walk-forward conformal calibration over the corpus. Logit-free path inspired by [LofreeCP](https://arxiv.org/abs/2403.01216) + [ACSE](https://arxiv.org/abs/2605.04295). Run `pnpm conformal` to generate the sidecar; UI shows calibrated coverage alongside the empirical N=3 range.
- **FRED + Stooq programmatic asset-move refresh.** `pnpm refresh-prices` pulls canonical numbers from St. Louis Fed + Stooq into a sidecar; UI badges every asset row "FRED" / "Stooq" / "approx".
- **OTI Daily** — self-publishing daily research artifact. Vercel Cron at 5pm ET runs Mahalanobis k-NN against today's macro fingerprint, picks 3 rhyming regimes + 1 negative analogue, posts to Bluesky + emails the digest at 6am ET.
- **Stacked-breakpoint prompt caching** (1h TTL, ~70% input-cost reduction on synthesis), **AI Gateway model fallback chains** (Sonnet→Haiku→GPT-4o on outage), **Edge Config hot-path reads** (sub-5ms TodayStrip globally).
- **Streaming UI** progressively renders the brief — headline first, then each analogue card, then the cross-event synthesis.
- **Show your work.** Every brief reveals all 10 retrieved candidates with Jaccard / cosine / rerank / combined scores, the LLM's tag rationale, the embedding source, whether rerank ran, whether macro fusion was active, the multi-query count, and the Self-Verifier audit.
- **Sharable permalinks** at `/b/:id`; daily briefs at `/today/<date>`; each gets a custom 1200×675 OG card.
- **MCP server** at `/api/mcp` — connect once at claude.ai/settings/integrations, every conversation can search analogues / fetch events / list the corpus.
- **Long-form research at [`/research`](src/app/research/page.tsx)** — methodology essays + Citrini-pattern reverse-Show-HN regime essays. Markdown source in `/content/research/`, cross-published on Substack.
- **Community PR pipeline** for new events — JSON Schema, validation script, hindsight-leakage heuristic, GitHub Action gate, 8-point provenance checklist. First 20 high-quality regime cards merged get a permanent contributor cite + lifetime API access.
- **Multi-provider via Vercel AI Gateway.** Switch between Claude (Sonnet/Haiku/Opus), OpenAI, Google Gemini, Mistral. One key, plain `provider/model` strings.
- **Observability.** [Langfuse](https://langfuse.com) Cloud free-tier auto-instruments every AI SDK call. Public `/stats` page surfaces aggregate corpus + brief volume metrics.

See [`/methodology`](src/app/methodology/page.tsx) for the full design rationale.

## Architecture

```
User input
    │
    ├─────► Tag (Haiku 4.5) ──────── generateObject + Zod
    │       ► {triggerType, regimeTags[], region, surpriseFactor, ...}
    │
    ├─────► Embed query (voyage-4-large 1024d via AI Gateway)
    │
    ├─────► fetchTodayMacroZ (FRED + Yahoo, 1h cached)
    │       ► z-vector across VIX, MOVE, HY OAS, term slope, real rate,
    │         5y BE, dollar regime, policy stance
    │
    └─────► Multi-query expand (Haiku) ─ 2-3 paraphrases
                │
                ▼
Hybrid retrieval (deterministic, fused, multi-query)
    • Jaccard over regimeTags
    • Cosine over [t; α·z]  (History Rhymes fusion, α=0.5)
    • Region as hard filter
    • Per-query RRF fusion (k=60), one ranking per paraphrase
    • Cross-paraphrase RRF fusion → top-15 candidates
                │
                ▼
Voyage rerank-2.5 cross-encoder pass
    • narrativeAtTime + tags as document text
    • top-15 → top-10
                │
                ▼
Synthesis Phase A (Claude Sonnet 4.6, streamObject)
    • Sees narrativeAtTime + t=0 market reaction only
    • Schema constrains eventId to candidate IDs
    • Emits headline + summary + 3 analogues + disagreementNote
                │
                ▼
Synthesis Phase B (same model, streamObject)
    • Full hindsight for 3 chosen analogues
    • Emits failedTradesPattern + consensusError + caveats
                │
                ▼
Numeric guard scrubs digit-runs from prose
                │
                ▼
Empirical @1m bands computed across N=3 (min/median/max)
                │
                ▼
React streams the brief progressively
    • headline → analogue cards → asset-moves table + bands
    • ShareBar with copy-link / X-intent / print
    • Persists to Postgres for permalink at /b/:id
    • Langfuse OTel traces every LLM call
```

The daily-regime track runs on its own schedule:

```
21:05 UTC weekdays  cron/regime-snapshot
  ├ buildRegimeSnapshot(today)        FRED + Yahoo, 8-vec, z-score
  ├ matchRegime()                     Mahalanobis, Ledoit-Wolf shrinkage
  │   ├─► top-3 positive analogues
  │   └─► 1 negative analogue (similar setup, opposite outcome)
  ├ buildDailyBrief()                 Sonnet, schema-constrained
  └ persist  → regime_snapshots / daily_matches / daily_briefs

10:00 UTC next day  cron/publish-digest
  ├ Bluesky post (headline + OG card via @atproto/api)
  └ Resend email broadcast
```

## Stack

- **Next.js 16** App Router + RSC + Route Handlers
- **Tailwind v4** (CSS-first config) + **shadcn/ui** primitives + Radix
- **Vercel AI SDK v6** with `streamObject` + Zod
- **Vercel AI Gateway** for multi-provider routing (Claude / OpenAI / Google / Mistral) and embeddings (voyage-4-large MoE, Jan 2026)
- **Voyage AI** rerank-2.5 (called directly via `VOYAGE_API_KEY`)
- **Drizzle ORM** + **Neon Postgres** + **pgvector** (HNSW cosine index, 1024d)
- **Visx** for inline Tufte sparklines with hover-to-reveal exact values
- **Geist** for sans + mono typography
- Deploys cleanly on Vercel with **Fluid Compute** (Node 24 LTS)

## Local development

```bash
# 1. Install
pnpm install

# 2. Set up .env.local — copy .env.example and fill in:
#    - AI_GATEWAY_API_KEY     (https://vercel.com/dashboard/ai-gateway)
#    - VOYAGE_API_KEY         (optional — enables rerank pass)
#    - POSTGRES_URL           (Neon, via Vercel Marketplace)
cp .env.example .env.local

# 3. (recommended) Set up the database for embeddings + permalink persistence
pnpm db:push           # apply Drizzle migrations (events + briefs + regime tables)
pnpm seed              # insert the 39 corpus events
pnpm embeddings        # populate voyage-4-large 1024d embeddings into Postgres
                       # OR: pnpm embeddings --json   (also write data/embeddings.json sidecar)
pnpm regime:centroids  # populate per-event regime z-vectors (8-dim) for OTI Daily k-NN
pnpm refresh-prices    # programmatically refresh asset moves from FRED + Stooq
pnpm conformal         # build conformal-quantile sidecar for calibrated 80% intervals

# 4. Dev
pnpm dev
```

### Validation + community contribution

```bash
pnpm test              # corpus integrity + retrieval gold-set CI (recall@3 ≥ 0.80, precision@1 ≥ 0.50)
pnpm validate-event    # zod schema + integrity + hindsight-leakage heuristic on the corpus
pnpm schema:export     # regenerate /schema/historical-event.schema.json
pnpm mcp:submission-pack   # generate the directory submission pack for /out/mcp-submission/
```

The app degrades gracefully:

- **No DB**: retrieval reads embeddings from `data/embeddings.json` sidecar. Permalinks fall back to in-memory store (lost on restart).
- **No `VOYAGE_API_KEY`**: rerank pass is skipped; retrieval uses RRF-fused Jaccard + cosine only.
- **No `AI_GATEWAY_API_KEY`**: query embedding is skipped; retrieval falls back to Jaccard-only. The demo examples (`/examples`) still work without any API keys at all.

## Deploying to Vercel

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# Link the repo
vercel link

# Pull production env (after wiring keys in dashboard)
vercel env pull

# Apply DB migrations (events + briefs + regime tables)
pnpm db:push

# Seed corpus + populate embeddings + populate regime centroids
pnpm seed
pnpm embeddings
pnpm regime:centroids

# Deploy
vercel deploy --prod
```

**Required env vars on Vercel:**

- `POSTGRES_URL` — auto-injected when you install the Neon Marketplace integration.
- `AI_GATEWAY_API_KEY` — from the AI Gateway dashboard. Routes Claude/OpenAI/Google/Mistral chat models *and* the voyage-3-large embedding model.
- `FRED_API_KEY` — free at https://fred.stlouisfed.org/docs/api/api_key.html. Required for daily-regime cron + `pnpm regime:centroids`.
- `CRON_SECRET` — any random string. Vercel sets `Authorization: Bearer ${CRON_SECRET}` on cron invocations automatically.

**Optional but recommended:**

- `VOYAGE_API_KEY` — enables the rerank-2.5 cross-encoder pass; quality drop without it is non-trivial.
- `BSKY_HANDLE` + `BSKY_APP_PWD` — enables the daily Bluesky auto-post.
- `RESEND_API_KEY` + `RESEND_FROM` + `RESEND_AUDIENCE_ID` — enables the daily email digest.

**Vercel plan**: the cron schedules in [`vercel.ts`](vercel.ts) require Vercel **Pro** ($20/mo) — the Hobby tier's ±59min jitter is unacceptable for a market-state snapshot tied to close. Enable **Fluid Compute** on the project so the snapshot route can run for up to 5min when generating a fresh brief.

## Research — long-form essays (v0.5)

`oti.app/research` is the long-form publishing surface. Each essay
lives at a stable permalink with its own 1200×675 OG card and is
cross-published on [oti.substack.com](https://oti.substack.com) via
copy-paste. Two seed essays live in [`/content/research/`](content/research/):

- **W1 methodology** — *Memory, not prediction: how OTI's retrieval
  actually works* (~9 min). The deliberate walk-through of the
  pipeline and the five load-bearing decisions (corpus knowledge
  prime, two-phase synthesis, History Rhymes macro fusion, negative-
  analogue retrieval, logit-free conformal coverage).

- **W4 reverse-Show-HN** — *The closest analogue to the May 2026
  Treasury curve isn't 1973. It's September 1998.* (~22 min, featured).
  Citrini-pattern thought experiment with the OTI engine as supporting
  evidence — six tells, four falsifiable conditions, one neologism
  ("the resteepening compression").

Add a research post: drop a markdown file in `/content/research/<date>-<slug>.md`
with YAML frontmatter (`slug`, `title`, `description`, `publishedAt`,
`substackUrl`, `tags`, `readingMinutes`, optional `featured: true`).
The route renders it; the OG card auto-generates; nav picks it up.

## Community contribution

The corpus is the moat — the codebase is 20% of the value.

```bash
pnpm validate-event       # zod schema + integrity + hindsight-leakage heuristic
pnpm schema:export        # regenerate /schema/historical-event.schema.json
```

A GitHub Action gates every PR that touches `data/events.ts` on
`pnpm validate-event` plus a separate schema-sync job that fails
when the JSON Schema drifts from `src/lib/types.ts`. The
PR template at [`.github/PULL_REQUEST_TEMPLATE/new-event.md`](.github/PULL_REQUEST_TEMPLATE/new-event.md)
walks contributors through an 8-point provenance checklist.

**The 20-event bounty:** the first 20 high-quality regime cards
merged after May 2026 get a permanent contributor cite on the
methodology page + lifetime API access. See [CONTRIBUTING.md](CONTRIBUTING.md)
for the wishlist (1944 Bretton Woods, 1956 Suez, 1986 oil collapse,
1989 Nikkei peak, 2003 Iraq war start, 2010 Greek bailout #1,
2017 XIV pre-warning, …).

## OTI Daily — the regime flywheel (v0.3)

A self-publishing daily research artifact at [`/today`](src/app/today/page.tsx) that re-generates each weekday at 5pm ET:

- Pulls a free 8-component macro-state vector (VIX, MOVE, HY OAS, term slope, real rate, breakeven, dollar regime, policy stance) from FRED + Yahoo at close.
- Z-scores against the trailing 1260 trading days, fits a Ledoit-Wolf-shrunk covariance over the corpus regime centroids, runs Mahalanobis k-NN.
- Returns three positive analogues + **one negative analogue** — the regime that scored similarly on macro state but resolved oppositely on the S&P. The "disambiguator" surfaces the macro variable that distinguishes today from that near-miss. (Inspired by [IntRec](https://arxiv.org/abs/2602.17639) and [Half-Truths Break Similarity Retrieval](https://arxiv.org/abs/2602.23906).)
- Synthesises a daily brief (Claude Sonnet 4.6 by default, schema-constrained to corpus IDs, numeric paraphrase guarded).
- Each day permalinks at `/today/<date>` with a custom 1200×675 [OG card](src/app/api/og/today/[date]/route.tsx) for FinTwit / Bluesky / Substack unfurls.
- A 6am ET cron auto-posts the headline + OG card to **Bluesky** (X is too expensive in 2026 after the Feb pricing change) and sends the **Resend** daily-digest email broadcast.

The corpus centroid build is one command:

```bash
pnpm regime:centroids          # write to Postgres
pnpm regime:centroids --json   # also write data/regime-centroids.json sidecar
```

In dev without a Vercel Cron, you can manually trigger a snapshot:

```bash
curl -X POST localhost:3000/api/cron/regime-snapshot \
     -H "Authorization: Bearer ${CRON_SECRET}"
```

The flywheel: every weekday adds an entry to a public `/today/<date>` archive; each entry has its own OG card; FinTwit accounts can quote-tweet ("OTI says today rhymes with Aug 2007 — here's why I disagree"); the cron runs free; the corpus is the moat.

## API surface

- **`GET /api/events`** — slim list of all 30 events in the corpus. CORS-open, 1h cached.
- **`GET /api/events/:id`** — full event payload. Add `?view=pit` for the point-in-time view (no hindsight, no longer-horizon asset moves).
- **`GET /api/openapi.json`** — OpenAPI 3.1 spec.
- **`POST /api/analyze`** — synchronous JSON pipeline run. Returns the full `PipelineResult` payload. Per-IP rate-limited (token bucket: burst 10, sustained 10/min) and bot-heuristic-gated.
- **`POST /api/analyze/stream`** — newline-delimited JSON streaming variant. The interactive UI uses this. Emits events for each pipeline phase: `started`, `queryTags`, `candidates`, `phaseA` (partials), `phaseAFinal`, `phaseB` (partials), `phaseBFinal`, `complete`, `error`.
- **`POST /api/mcp`** — Model Context Protocol JSON-RPC server. Exposes three tools (`search_analogues`, `get_event`, `list_events`) that any MCP-compatible client (Claude Desktop, Cursor, OpenBB Workspace) can call. See [`/api`](src/app/api/page.tsx) for setup.
- **`GET /b/:id`** — server-rendered permalink for a previously-generated brief. 30-day TTL.

## Use OTI as an MCP server

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "oti": {
      "url": "https://your-oti-deployment.vercel.app/api/mcp",
      "type": "http"
    }
  }
}
```

Restart Claude Desktop. Now `search_analogues`, `get_event`, and `list_events` are tools any conversation can call. Same surface works for Cursor and any agent built on the official MCP SDK.

The full server manifest is at [`mcp/manifest.json`](mcp/manifest.json) — keep it updated when tools change. Directory listings tracked at [`mcp/DIRECTORIES.md`](mcp/DIRECTORIES.md). To prep a manual-submission pack for the directories that don't auto-index, run `pnpm mcp:submission-pack` and commit `out/mcp-submission/`.

Discovery URLs:

- `GET /api/mcp` — JSON-RPC 2.0 server self-description (used by Claude Desktop / Cursor / OpenBB Workspace at runtime)
- `GET /.well-known/mcp` — RFC well-known mirror of the manifest (used by Glama / PulseMCP / mcp.so directory crawlers)
- `GET /api/openapi.json` — OpenAPI 3.1 spec for the public read-only surface

## Tests + eval

```bash
pnpm test    # node:test runner — corpus integrity + retrieval gold-set
pnpm eval    # same, with verbose per-case scoring
```

The retrieval gold set is in [`tests/eval/gold.ts`](tests/eval/gold.ts) — 24 hand-tagged queries with their expected analogues. CI gates on `recall@3 ≥ 0.80` and `precision@1 ≥ 0.50`. Adjust the floors only with a comment explaining why.

## What's new in v0.4

| Feature | What it gets you |
|---------|------------------|
| Voyage 4 large embeddings | +10% NDCG@10 vs v0.3, $0.12/1M (40% cheaper than v3-large), MoE architecture |
| History Rhymes macro-fusion | Retrieval becomes regime-aware: today's high-vol-low-credit setup matches other high-vol-low-credit history regardless of prose overlap |
| Multi-query expansion | +3-5 NDCG@10 points; Haiku generates 2-3 paraphrases, RRF-fuse parallel rankings |
| Empirical @1m range | Honest min/median/max across N=3 — labeled as empirical range, not calibrated coverage |
| `pnpm refresh-prices` | FRED + Stooq programmatic asset-move backfill; UI badges every row "FRED" / "Stooq" / "approx" |
| Corpus 30 → 39 events | Pre-1971 anchors (1929, 1962, 1970), EM gaps (1998 Indonesia, 2002 Argentina, 2018 Turkey), commodity (1980 Hunt), recent (2022 LME nickel, 2023 CS-UBS) |
| Langfuse + /stats | OTel traces for every AI call; public aggregate metrics page |

Deferred to v0.5: LAP CI gate (Anthropic logprobs gap), changepoint anchoring (heavy Python CPD dependency), conformal-calibrated coverage (needs corpus past 50 for meaningful calibration set).

## The dataset

39 hand-curated macro events spanning 1929–2025. Each entry includes structured tags, point-in-time narrative, asset moves, failed trades with provenance flags, and a retrospective lesson. See [`data/events.ts`](data/events.ts) and the [`/dataset`](src/app/dataset/page.tsx) browser.

The events are sourced from public records (FRED, central-bank archives, contemporaneous reporting). Asset-move data is approximate — intended to convey direction and magnitude rather than tick-accuracy.

## Where this gets things wrong

The full list lives in [`/methodology`](src/app/methodology/page.tsx). The big ones:

- Coverage at 39 events still skews developed-market; v0.5 plan continues toward ~50 with 1986-oil-collapse, 2003-Iraq-war, 1976-sterling-IMF, 2024-TOPIX-flash, and a few additional EM entries.
- Asset-move precision is approximate — sourced from public records, not tick-accurate.
- The schema forces three analogues even when the corpus has fewer than three good fits. The "where this might not fit" surface and the disagreement banner mitigate; they are imperfect.
- We have not seen LLM quote fabrication, but we cannot prove its absence.

If you find a concrete failure or want to contribute events, tags, or better source data, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Disclaimer

OTI is for educational and research purposes only. It is not investment advice, a forecast, or a backtest. Outputs may be wrong; treat them as a thinking tool, not a recommendation.

## Licence

MIT. See [`LICENSE`](LICENSE).
