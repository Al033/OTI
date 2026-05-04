# OTI

> **Markets don't predict — they remember.**
> A historical-analogue research engine for macro markets.
> Memory, not prediction.

Type a market event in plain English. OTI returns a one-page brief with three historical analogues, asset behaviour over the next month, flow patterns, trades that looked obvious but failed, and where consensus went wrong. From a curated corpus of 30 macro events, 1971–2025.

What used to cost $30k/yr at BCA, $10k/mo at Kensho, or a Bloomberg terminal — free, open, and intellectually honest about its limits.

---

## What this is

Every other LLM-in-finance project pretends to predict. They mostly fail and the audience is sceptical. OTI is the opposite: a tool for **memory and pattern recognition**, not forecasting. That positioning is the moat.

The product is one screen. Type an event:

> _"Trump announces 25% tariffs on essentially all US trading partners."_

And get a one-page brief that:

1. **Picks three historical analogues** from a curated corpus of 30 events, with reasoning grounded in each event's _point-in-time_ narrative (not retrospective hindsight).
2. **Shows asset behaviour** at 1d / 5d / 1m / 3m / 6m horizons across S&P, USTs, USD, gold, oil, HY OAS, and VIX — small-multiples Tufte sparklines per asset, per analogue.
3. **Synthesises the recurring failed-trade pattern** across the three regimes — the obvious-looking trade that didn't work, with verifiable contemporary quotes.
4. **Surfaces where consensus went wrong** — the systematic mistake markets made in similar regimes.
5. **Discloses every retrieved candidate** with Jaccard + cosine + combined retrieval scores. The 7 not chosen are still visible. No cherry-picking.
6. **Is honest about fit.** Every analogue includes "where this might not fit"; the brief includes 1–5 caveats; if the three analogues' likely paths conflict, a disagreement banner says so above the fold.

## Why this is different

- **Corpus-constrained synthesis.** The brief schema constrains `eventId` to a `z.enum(...30 corpus IDs)`. The model literally cannot return events outside the dataset. No hallucinated 2003 crisis. No fictional Lehman moment. Auditable.
- **`narrativeAtTime` ≠ `outcomeInHindsight`.** Every event stores point-in-time consensus separately from what actually happened. Synthesis prompts only see the point-in-time view when reasoning about analogousness — the structural defence against look-ahead bias.
- **Two-stage hybrid retrieval.** Jaccard over a controlled vocabulary of regime tags (deterministic, auditable) plus cosine over event embeddings (semantic). Both scores are published per candidate. If the system picks a weak analogue, the audit panel shows you why.
- **Show your work.** Every brief reveals all 10 retrieved candidates with scores, the LLM's tag rationale, the model used, the wall-clock time. Intellectual honesty is enforced at the UI surface, not aspirational.
- **Multi-provider via Vercel AI Gateway.** Switch between Claude (Sonnet/Haiku/Opus), OpenAI (GPT-4o, o1), Google Gemini, Mistral. One key, plain `provider/model` strings.

See [`/methodology`](src/app/methodology/page.tsx) for the full design rationale.

## Architecture

```
User input
    │
    ▼
Tag (Claude Haiku 4.5)  ─── generateObject + Zod
    │   {triggerType, regimeTags[], region, surpriseFactor, ...}
    ▼
Two-stage hybrid retrieval (deterministic)
    │   Jaccard over regimeTags + cosine over embeddings
    │   + small bonuses for triggerType and region match
    │   ► top-10 candidates
    ▼
Synthesise (Claude Sonnet 4.6 by default)
    │   Schema constrains eventId to corpus IDs
    │   Prompt enforces point-in-time framing + caveats
    ▼
Brief renders in React with:
    │   - 3 analogue cards + sparklines + fit-confidence
    │   - small-multiples asset-move grid
    │   - failed-trades pattern + quotes
    │   - consensus-error synthesis
    │   - caveats
    │   - "show your work" disclosure
```

## Stack

- **Next.js 16** App Router + RSC
- **Tailwind v4** (CSS-first config) + **shadcn/ui** primitives + Radix
- **Vercel AI SDK v6** with `generateObject` + Zod
- **Vercel AI Gateway** for multi-provider routing
- **Drizzle ORM** + **Neon Postgres** + **pgvector**
- **Visx** for inline Tufte sparklines
- **Geist** for sans + mono typography
- Deploys cleanly on Vercel with **Fluid Compute** (Node 24 LTS)

## Local development

```bash
# 1. Install
pnpm install

# 2. Set up .env.local — copy .env.example and fill in:
#    - AI_GATEWAY_API_KEY     (https://vercel.com/dashboard/ai-gateway)
#    - POSTGRES_URL           (Neon, via Vercel Marketplace)
cp .env.example .env.local

# 3. (optional) Set up the database for embeddings + persistence
pnpm db:push       # apply Drizzle migrations
pnpm seed          # insert the 30 events
pnpm embeddings    # populate cosine-search embeddings

# 4. Dev
pnpm dev
```

The app runs end-to-end without a database — retrieval falls back to deterministic Jaccard scoring only. The database is only required for cosine-search and persistence.

The demo examples (`/examples`) work without any API keys at all.

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

Recommended: install the **Neon** Marketplace integration — `POSTGRES_URL` is auto-injected. Set `AI_GATEWAY_API_KEY` from the AI Gateway dashboard.

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
