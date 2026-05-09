# Changelog

All notable changes to OTI. See [README](README.md) for installation and usage.

## v0.4 — Retrieval frontier + corpus + observability (May 2026)

The retrieval pipeline catches up to mid-2026 academic SOTA, the corpus
crosses the pre-1971 floor, and every LLM call is now traceable.

### Retrieval

- **Voyage 4 large** (`voyage/voyage-4-large`) replaces voyage-3-large. MoE
  architecture, 40% cheaper at $0.12/1M tokens, RTEB-leading per Voyage's
  Jan 2026 announcement. NEW vector space → existing deployments must run
  `pnpm embeddings --force` to re-embed.
- **History Rhymes macro-fused query embeddings** (arXiv:2511.09754).
  Retrieval cosine is now computed in a 1032-dim fused space:
  `q = norm([t; α·z])` with α=0.5, where `z` is today's standardised
  8-component macro state vector. Falls back to text-only when macro data
  is unavailable.
- **Multi-query expansion via Haiku.** 2-3 paraphrases generated per query;
  parallel retrievals are RRF-fused (k=60). Standard +3-5 NDCG@10 lift on
  small expert corpora.

### Asset moves

- **`pnpm refresh-prices`** programmatically pulls canonical numbers from
  FRED + Stooq into `data/asset-moves.json`. The UI renders a
  "FRED" / "Stooq" / "approx" provenance badge on each asset row.
- **Empirical @1m range column** shows min / median / max across the 3
  chosen analogues — explicitly labeled as empirical range, not calibrated
  coverage.

### Corpus

- **30 → 39 events.** New entries close the highest-leverage retrieval gaps:
  - Pre-1971: 1929 Black Tuesday, 1962 Cuban Missile Crisis, 1970 Penn
    Central. (Was 0 events before 1971.)
  - EM: 1998 Indonesia / Suharto, 2002 Argentina convertibility break,
    2018 Turkey lira / Erdogan-Trump escalation.
  - Commodities: 1980 Hunt Brothers silver corner.
  - Recent: 2022 LME nickel halt + trade cancellation, 2023 Credit
    Suisse–UBS forced merger.
- **Gold-set retrieval eval expanded 20 → 24 cases** with new entries for
  commercial-paper-run, em-currency-board-break, commodity-corner, and
  geopolitical-binary-tail — exercising the new events.

### Observability

- **Langfuse Cloud OTel tracing.** `instrumentation.ts` auto-loads when
  `LANGFUSE_PUBLIC_KEY` is set; every AI SDK v6 call (generateObject,
  streamObject, embed) carries a `functionId`-tagged span for filtering
  in the Langfuse UI. Free tier: 50k spans/month.
- **Public `/stats` page.** Aggregate corpus size + brief volume + top-10
  most-retrieved events, hourly-cached. Falls back to "no DB configured"
  when Postgres is absent.

### Deferred to v0.5 (with rationale)

- **LAP (Lookahead Propensity) CI gate** — Claude doesn't expose per-token
  logprobs via the public Messages API as of May 2026, so a black-box LAP
  computation needs a proxy logits provider. Revisit when Anthropic ships
  logprobs OR when a satisfactory cross-provider fallback is wired.
- **LLM-augmented changepoint anchoring** — would require either Python
  CPD libraries (`ruptures`, `arch`) called from a build step or a from-
  scratch JS implementation. Heavy for v0.4.
- **Conformal-calibrated coverage** at N=3 — even Stable Localized CP
  (arXiv:2605.01452) requires a calibration set ≥30 to be meaningful.
  Empirical bands ship today; conformal returns once corpus expansion
  brings the candidate pool past 50.

---

## v0.3 — OTI Daily / regime flywheel (May 2026)

A self-publishing daily research artifact at `/today` that re-generates each
weekday at 5pm ET, plus a 6am ET digest cron.

- **8-dim macro state vector + Mahalanobis k-NN.** VIX, MOVE, HY OAS, term
  slope, real rate, 5y BE, dollar regime, policy stance — z-scored against
  trailing 1260 trading days, Ledoit-Wolf-shrunk covariance, partial-overlap
  handling for pre-1990 events.
- **Negative analogue.** Each daily brief surfaces the regime that scored
  similarly on macro state but resolved oppositely. Disambiguator string
  identifies the divergent z-dim. (IntRec arXiv:2602.17639 / Half-Truths
  arXiv:2602.23906 shape.)
- **Daily brief generator** — schema-constrained, point-in-time framing,
  numeric guard, persisted to `daily_briefs`.
- **`/today` page + `/today/<date>` permalinks** + custom 1200×675 OG cards
  per day via `next/og`.
- **Vercel Cron** — two schedules (21:05 UTC snapshot + 10:00 UTC publish)
  declared in `vercel.ts`, gated by `CRON_SECRET`.
- **Bluesky publisher** via `@atproto/api`. (X is too expensive in 2026.)
- **Resend email digest** with hand-rolled HTML + plain-text dual view.

---

## v0.2 — best-in-class retrieval + structural integrity (May 2026)

- **DB-backed pgvector retrieval** with HNSW index. Voyage-3-large
  embeddings, RRF-fused with Jaccard, region as a hard filter.
- **Voyage rerank-2.5** cross-encoder pass over top-15 → top-10.
- **Two-phase synthesis** with structural look-ahead defence: Phase A sees
  only `narrativeAtTime` + t=0 reaction; Phase B sees full hindsight after
  picks lock.
- **Numeric paraphrase guard** scrubs digit-runs from prose.
- **Prompt injection sanitiser** strips bidi controls + triple-quote
  breakouts.
- **Streaming UI** via NDJSON, progressive Brief rendering.
- **Deep-linkable briefs** at `/b/<id>` with stable hash IDs, KV-cached,
  ShareBar (copy-link / X-intent / print).
- **MCP server** at `/api/mcp` (stateless JSON-RPC) — `search_analogues`,
  `get_event`, `list_events` tools for Claude Desktop / Cursor / OpenBB.
- **Public read-only API** + OpenAPI 3.1 spec at `/api/openapi.json`.
- **Quote provenance flag** on `failedTrades`. UI renders a "paraphrase"
  warning badge on unverified quotes.
- **Walk-forward CI test** + 20-case retrieval gold set with pinned
  recall@3 ≥ 0.80 / precision@1 ≥ 0.50 floors.
- **Sparkline accessibility** — drops aria-hidden, adds hover tooltips
  with exact values.
- **Print stylesheet**, **rate limit + bot defence**, **error tightening**.

---

## v0.1 — initial release (May 2026)

- 30-event hand-curated corpus, 1971–2025.
- Tag → retrieve → synthesise pipeline with Claude Sonnet 4.6 + Haiku 4.5.
- Schema-constrained `eventId` enums for hallucination-free analogues.
- Show-your-work UI with retrieval scores published.
- Six precomputed demo briefs working without API keys.
