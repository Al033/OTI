# OTI

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

- **Two-phase synthesis with structural look-ahead defence.** Phase A (analogue selection) only sees `narrativeAtTime` and the t=0 market reaction — never the longer-horizon outcome. Phase B writes the cross-event consensus error and failed-trade pattern with the full hindsight payload. Look-ahead bias prevention is enforced by the prompt context, not by trust.
- **Corpus-constrained synthesis.** The Phase A schema constrains `eventId` to a `z.enum(...candidate IDs)` built dynamically per request. The model literally cannot return events outside the retrieved candidates. No hallucinated 2003 crisis. No fictional Lehman moment.
- **Numeric paraphrase guard.** Every prose field is post-processed: digit-runs that aren't whitelisted (years, indices, sample-sizes) get scrubbed. The asset-move table is rendered deterministically from the corpus; the LLM never invents stats.
- **`narrativeAtTime` ≠ `outcomeInHindsight`.** Every event stores point-in-time consensus separately from what actually happened. Embeddings are computed only over the point-in-time text — no leak at the cosine-similarity step.
- **Two-stage hybrid retrieval with RRF fusion + cross-encoder rerank.** Jaccard over a controlled vocabulary of regime tags (deterministic, auditable) plus cosine over voyage-3-large 1024d embeddings (semantic). Both rankings fused via reciprocal-rank fusion (k=60), with region as a hard filter, then a Voyage rerank-2.5 pass over the top-15 → top-10. Every score published per candidate.
- **Streaming UI.** The brief streams in progressively — headline first, then each analogue card, then the cross-event synthesis. No 20-second blank-screen wait.
- **Show your work.** Every brief reveals all 10 retrieved candidates with scores, the LLM's tag rationale, the model used, the embedding source, whether rerank ran, and the wall-clock time. Intellectual honesty is enforced at the UI surface, not aspirational.
- **Sharable permalinks.** Generated briefs are persisted with stable hash-IDs at `/b/:id` — copy a link, share it on FinTwit, the recipient sees the same analogues without re-running the LLM.
- **Multi-provider via Vercel AI Gateway.** Switch between Claude (Sonnet/Haiku/Opus), OpenAI (GPT-4o, o1), Google Gemini, Mistral. One key, plain `provider/model` strings.

See [`/methodology`](src/app/methodology/page.tsx) for the full design rationale.

## Architecture

```
User input
    │
    ├─────► Tag (Haiku 4.5)  ─── generateObject + Zod
    │       ► {triggerType, regimeTags[], region, surpriseFactor, ...}
    │
    └─────► Embed query (voyage-3-large @ 1024d via AI Gateway)
                │
                ▼
Two-stage hybrid retrieval (deterministic)
    • Jaccard over regimeTags
    • Cosine over voyage-3-large embeddings (Postgres + pgvector HNSW)
    • Region as hard filter; RRF (k=60) for fusion (weights: J 1.0, C 0.7)
    • top-15 candidates
                │
                ▼
Voyage rerank-2.5 pass (cross-encoder)
    • narrativeAtTime + tags as document text
    • top-15 → top-10
                │
                ▼
Synthesis Phase A (default: Claude Sonnet 4.6, streamObject)
    • Sees narrativeAtTime + t=0 market reaction only
    • Schema constrains eventId to candidate IDs
    • Emits: headline, summary, 3 analogues with whyAnalogous + whereThisMightNotFit, disagreementNote
                │
                ▼
Synthesis Phase B (same model, streamObject)
    • Sees full hindsight payload for the 3 chosen analogues
    • Emits: failedTradesPattern, consensusError, caveats
                │
                ▼
Numeric guard scrubs digit-runs from prose
                │
                ▼
React streams the brief progressively
    • headline → analogue cards → asset-moves table → synthesis prose
    • ShareBar with copy-link / X-intent / print
    • Persists to Postgres for permalink at /b/:id
```

## Stack

- **Next.js 16** App Router + RSC + Route Handlers
- **Tailwind v4** (CSS-first config) + **shadcn/ui** primitives + Radix
- **Vercel AI SDK v6** with `streamObject` + Zod
- **Vercel AI Gateway** for multi-provider routing (Claude / OpenAI / Google / Mistral) and embeddings (voyage-3-large)
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
pnpm db:push       # apply Drizzle migrations (events + briefs tables)
pnpm seed          # insert the 30 events
pnpm embeddings    # populate voyage-3-large 1024d embeddings into Postgres
                   # OR: pnpm embeddings --json   (also write data/embeddings.json sidecar)

# 4. Dev
pnpm dev
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

# Deploy
vercel deploy --prod
```

Recommended: install the **Neon** Marketplace integration — `POSTGRES_URL` is auto-injected. Set `AI_GATEWAY_API_KEY` from the AI Gateway dashboard, and optionally `VOYAGE_API_KEY` for the rerank pass.

## API surface

- **`POST /api/analyze`** — synchronous JSON pipeline run. Returns the full `PipelineResult` payload. Per-IP rate-limited (token bucket: burst 10, sustained 10/min) and bot-heuristic-gated. Use this for programmatic access.
- **`POST /api/analyze/stream`** — newline-delimited JSON streaming variant. The interactive UI uses this. Emits events for each pipeline phase: `started`, `queryTags`, `candidates`, `phaseA` (partials), `phaseAFinal`, `phaseB` (partials), `phaseBFinal`, `complete`, `error`.
- **`GET /b/:id`** — server-rendered permalink for a previously-generated brief. 30-day TTL.

## The dataset

30 hand-curated macro events spanning 1971–2025. Each entry includes structured tags, point-in-time narrative, asset moves, failed trades with attribution, and a retrospective lesson. See [`data/events.ts`](data/events.ts) and the [`/dataset`](src/app/dataset/page.tsx) browser.

The events are sourced from public records (FRED, central-bank archives, contemporaneous reporting). Asset-move data is approximate — intended to convey direction and magnitude rather than tick-accuracy.

## Where this gets things wrong

The full list lives in [`/methodology`](src/app/methodology/page.tsx). The big ones:

- Coverage clusters around developed-market crises; EM and pre-1971 events are under-represented.
- Asset-move precision is approximate — sourced from public records, not tick-accurate.
- The schema forces three analogues even when the corpus has fewer than three good fits. The "where this might not fit" surface and the disagreement banner mitigate; they are imperfect.
- We have not seen LLM quote fabrication, but we cannot prove its absence.

If you find a concrete failure or want to contribute events, tags, or better source data, see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Disclaimer

OTI is for educational and research purposes only. It is not investment advice, a forecast, or a backtest. Outputs may be wrong; treat them as a thinking tool, not a recommendation.

## Licence

MIT. See [`LICENSE`](LICENSE).
