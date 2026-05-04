# Project Plan — Historical Market Analogue Engine

> **Working title:** _Analoguer_ (suggested) / _What Happened Next_ / _Memory Engine_ / _Echoes_
> **One-line pitch:** _An LLM-powered tool that doesn't predict markets — it remembers them._

---

## 1. The product, in one paragraph

A web app where you type a plain-English description of a market event ("Trump just announced 25% tariffs on EU autos", "Fed surprises with 50bps cut", "yields spike to 5%"). It returns a single beautifully designed one-page brief showing **three historical analogues** (with reasoning), how **assets behaved over the next month** in each, the **flow / positioning patterns**, the **trades that looked obvious at the time but failed**, and **where consensus went wrong**. Not predictive. Honest about its limits. Useful as a thinking tool, not an oracle.

## 2. Why this angle is the angle

Every LLM-in-finance project currently published is **pretending to be predictive** (TradingAgents, FinGPT-Forecaster, agentic stock-pickers). They mostly fail and the audience is becoming sceptical. The differentiator here is **deliberate humility**: this is a tool for *memory and pattern recognition*, not forecasting. That positioning:

- Is intellectually honest (and the audience can tell)
- Mirrors how real macro PMs actually use history (Druckenmiller, Howard Marks, Druck again)
- Sidesteps the "your backtest is overfit" critique
- Reads like a Bridgewater Daily Observation, not a robo-advisor

This framing is the moat. It's worth more than any code.

## 3. Competitive landscape (what's out there, what's missing)

| Tool | What it does | Pricing | Why it doesn't fill this gap |
|------|--------------|---------|------------------------------|
| **Kensho** ([kensho.com](https://kensho.com/)) | S&P-owned, NL queries over historical events, NERD entity graph | ~**$10k/month** | Locked inside S&P credentials, no public demo, opaque methodology |
| **AlphaSense / Sentieo** ([alpha-sense.com](https://www.alpha-sense.com/)) | Earnings-call & filings AI search; 90% of S&P 100 are customers | **$10–20k/seat/yr** | Search engine over content, not a synthesiser of macro analogues |
| **Aiera** ([aiera.com](https://aiera.com/)) | Live earnings event coverage, 60k+ events/yr, 99% transcription accuracy | Enterprise | Single-stock micro-events, not macro analogue |
| **Bloomberg Event Analysis** | Event-driven historical study inside Terminal | **$2,700/month** | UI from 1995, BBG syntax fluency required, shallow analogue logic |
| **Macrobond** ([macrobond.com](https://www.macrobond.com/)) | Macro time-series workbench, 2,400+ sources | **~$15k/yr** | No LLM reasoning layer, no analogue search |
| **Two Sigma Venn** ([venn.twosigma.com](https://www.venn.twosigma.com/overview)) | Factor analytics, 18 factors (the [Two Sigma Factor Lens](https://www.venn.twosigma.com/factor-lens)) | Enterprise | Portfolio analytics, not event-driven |
| **BCA Research** | Macro narrative + 18 specialised products | **$30–100k+/yr** | PDF + webinar product, no interactive surface |
| **OpenBB + Copilot** ([openbb.co](https://www.openbb.co/)) | Open-source Bloomberg alt; chat-with-data copilot | Free OSS / paid Pro | Terminal-replacement framing, not a brief generator |
| **Bridgewater Daily Observations** | The cultural archetype to rhyme with | Not productised, LP-only | Inspiration, not competitor |
| **TradingAgents** ([github](https://github.com/tauricresearch/tradingagents)) / **virattt/ai-hedge-fund** ([github](https://github.com/virattt/ai-hedge-fund)) — 43k★ | Multi-agent LLM trading simulators | Free OSS | Predictive stock-picking, not retrospective analogues |

**The gap:** smart-retail + FinTwit + junior-associate segment that institutional incumbents ignore. Nothing free, public, well-designed, and intellectually honest fills this slot. Compete on **curation + design + honesty**, not data scale.

**README framing line worth using:** _"What used to cost $30k a year, free and open."_

## 4. Inspirations to study

**Research-note design language to imitate:**
- [Bridgewater Daily Observations](https://www.bridgewater.com/research-and-insights) — the gold standard for one-page macro narrative
- Goldman Sachs Top of Mind, Morgan Stanley Sunday Start — single-page densely-packed structure
- [FT Alphaville](https://www.ft.com/alphaville) — voice and chart density
- Edward Tufte sparklines — small multiples, mono numerals, high data:ink ratio
- [Visual Capitalist](https://www.visualcapitalist.com/) — viral-quality information design

**Open-source repos with portfolio shine — README & launch templates:**
- [virattt/ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) — **43k★**, gold standard for finance/AI README: educational disclaimer up top, agent-architecture diagram, screenshots, reproducible setup. Steal this structure.
- [Wealthfolio](https://github.com/afadil/wealthfolio) — open-source desktop portfolio tracker that hit HN front page Sept 2024. Lessons: privacy-first messaging, beautiful UI, no-subscription model.
- [DariusLukasukas/stocks](https://github.com/DariusLukasukas/stocks) — Next.js 14 + shadcn + Tailwind stock tracker; direct stack reference.
- [proprietary/cftc-cot-viewer](https://github.com/proprietary/cftc-cot-viewer) — narrow-purpose, beautiful CFTC COT visualiser; UI inspiration for our positioning panel.
- [TauricResearch/TradingAgents](https://github.com/tauricresearch/tradingagents) — clean code, arxiv companion paper as supporting credibility.
- next-forge (Vercel's reference monorepo) — engineering polish patterns.

**Design north stars:**
- [Tufte sparklines](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/) and [Tufte's Executive Dashboards](https://www.edwardtufte.com/notebook/executive-dashboards/) essay — the layout template
- [Datawrapper Data Vis Dispatch](https://www.datawrapper.de/blog/data-vis-dispatch-december-31-2024) — weekly "what good looks like"
- [Visual Capitalist 2024 winners](https://www.visualcapitalist.com/visual-of-the-year-2024-winners-crowned/) — viral-quality information design
- The Pudding, FT Visual Storytelling, Reuters Graphics — narrative scrollytelling for the methodology page
- Linear, Vercel, Stripe docs, Posthog — design language indie engineers respond to on HN/LinkedIn

**Read for tone:** Howard Marks memos, Druckenmiller "history rhymes" interviews, Damodaran on humility in valuation, [Bridgewater "How the Economic Machine Works"](https://orcamgroup.com/wp-content/uploads/2013/08/How-the-Economic-Machine-Works-A-Template-for-Understanding-What-is-Happening-Now-Ray-Dalio-Bridgewater.pdf) — Dalio's productivity / short-debt / long-debt cycle schema is the analytical frame sophisticated readers expect.

## 5. Architecture

```
┌──────────────────────────┐
│ User: plain-English event │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│ Tag (Claude Haiku, generateObject + Zod)         │
│ → {triggerType, regimeTags[], surpriseFactor,    │
│    assetFocus[], region, dateHint}               │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│ Two-stage hybrid retrieval (deterministic)       │
│   • Stage A: Jaccard similarity over regimeTags  │
│   • Stage B: cosine over event-description       │
│              embeddings (pgvector)               │
│   • Combine: weighted score, return top-10       │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│ Synthesis (Claude Sonnet, generateObject)        │
│ Input: user query + 10 candidates +              │
│        precomputed asset return matrices         │
│ Output strict Zod schema:                         │
│   • analogues: array of EXACTLY 3, eventId       │
│        constrained to enum(...corpusIds)         │
│   • whyAnalogous (per analogue, citing tags)     │
│   • whereThisMightNotFit (per analogue)          │
│   • failedTrades (only quotes from corpus)       │
│   • consensusError, caveats[]                    │
└──────────┬───────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│ React streams the brief                          │
│ shadcn/ui + Observable Plot (small multiples) +  │
│ Visx sparklines for inline rows                  │
│ Asset returns are deterministic numbers, not LLM │
└──────────────────────────────────────────────────┘
```

**Why this beats other approaches:**
- **Two-stage retrieval (Jaccard tags + cosine embeddings)** is more defensible than pure-vector or pure-BM25. Jaccard is structured/auditable; cosine catches semantic nuance. Show the score breakdown in the "show your work" panel.
- **`eventId` constrained to a Zod enum of corpus IDs** — the LLM literally cannot hallucinate events not in the dataset. This is the move.
- **Asset returns are deterministic** — computed from price files at request time and cached. The LLM only narrates patterns; numbers are real.
- **Show all 10 candidates with scores**, not just the top 3 — anti-cherry-pick disclosure that builds trust.
- **Cacheable** for same input via Vercel Runtime Cache (24h TTL with `cacheTag` for corpus updates).

## 6. Tech stack (Vercel-native, modern, defensible)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 16 App Router** | RSC, PPR, Cache Components, default on Vercel |
| UI | **shadcn/ui + Tailwind v4** | Industry-standard, beautiful defaults, dark mode out of the box |
| Charts | **Observable Plot** for small multiples + **Visx** for inline sparklines | Plot's small-multiple API is unmatched; Visx for the in-row Tufte sparklines |
| AI orchestration | **Vercel AI SDK v6** (`generateObject`, `streamObject`) | Structured output via Zod; streaming for progressive UI |
| LLM | **Claude Sonnet 4.6** (synthesis) + **Haiku 4.5** (tagging) via [AI Gateway](https://vercel.com/docs/ai-gateway) | Best reasoning quality for the buck; gateway gives fallback + observability |
| DB | **Neon Postgres** (Vercel Marketplace) | One-click, free tier, pgvector built-in, scale-to-zero |
| Vector | **pgvector** | Co-located with relational data; cheaper than Pinecone at our scale |
| Tag retrieval | **Jaccard over `regimeTags[]`** (plain SQL/JS) | Auditable, deterministic, no extension needed |
| ORM | **Drizzle + Zod** | Single source of schema truth between DB, API, and AI calls |
| Cache | **Vercel Runtime Cache** with `cacheTag` | Same-input within 24h returns instantly; tag-based invalidation when corpus updates |
| Compute | **Vercel Functions (Fluid Compute)** | Default, Node 24 LTS, 300s timeout |
| Bot defence | **Vercel BotID** + per-IP rate limit | Demo could go viral; we don't want it scraped to death |
| Observability | Vercel Analytics + AI Gateway dashboards | Built-in |
| Config | **`vercel.ts`** with `@vercel/config` | TypeScript-typed config |

**One config file. No Docker. No Kubernetes. No microservices. Boring tech that ships.**

## 7. The dataset (this is the actual work)

The code is 20% of the value. The curated dataset is 80%. Plan: **30 events at MVP, 60 at v1**, hand-curated.

### Schema for each event

```typescript
type HistoricalEvent = {
  id: string;
  title: string;            // "Lehman bankruptcy"
  date: string;             // ISO date
  region: "US"|"EU"|"UK"|"CN"|"JP"|"EM"|"GLOBAL";
  triggerType: TriggerType; // policy | geopolitical | default | bubble_burst | fiscal | currency | commodity
  regimeTags: RegimeTag[];  // ["inflation_rising","fed_hiking","usd_strong","credit_widening", ...]
  surpriseFactor: 1|2|3|4|5;// How unanticipated was this at the time

  // CRITICAL: split point-in-time view from hindsight to fight look-ahead bias
  narrativeAtTime: string;  // What was the consensus / market view JUST BEFORE? (point-in-time)
  catalyst: string;         // The proximate trigger
  outcomeInHindsight: string;// What actually happened. Used only for the "consensus error" surface.

  assetMoves: {
    sp500: ReturnSeries;    // T+1d, T+5d, T+1m, T+3m, T+6m  — computed from FRED/Stooq, NOT LLM
    ust10y: ReturnSeries;   // bps changes
    dxy: ReturnSeries;
    gold: ReturnSeries;
    oil: ReturnSeries;
    creditIG: ReturnSeries; // OAS bps
    creditHY: ReturnSeries;
    vix: ReturnSeries;
  };
  flowPatterns: string;     // CFTC COT pre/post, fund-manager survey, ETF flows
  failedTrades: Array<{     // Contemporaneous calls that flopped — verified quotes only
    quote: string;
    attribution: string;    // FT/WSJ/BBG/Reuters with date
    sourceUrl?: string;
  }>;
  consensusError: string;   // 1-2 sentences: "What everyone got wrong" (uses outcomeInHindsight)
  lessons: string[];        // Bullet form, transferable insights
  sources: Array<{title: string; url: string}>;
  embedding?: number[];     // 1536-dim, computed offline at build time
};
```

**The `narrativeAtTime` / `outcomeInHindsight` split is the single most important schema decision.** During synthesis the LLM only sees `narrativeAtTime` when reasoning about analogousness — it cannot leak post-event knowledge into the "why this fits your event" surface. `outcomeInHindsight` is read only when filling the `consensusError` field.

### Event taxonomy

```
- monetary_policy: { rate_cut, rate_hike, qe_announce, qt_announce, surprise_meeting }
- fiscal: { stimulus, austerity, debt_ceiling, default }
- trade: { tariff_announce, trade_deal, sanctions, embargo }
- geopolitics: { war_outbreak, terrorist_attack, regime_change, election_shock }
- credit: { bank_failure, sovereign_default, rating_downgrade, spread_widening }
- currency: { devaluation, peg_break, intervention }
- commodity: { oil_shock, supply_disruption }
- structural: { bubble_burst, flash_crash, vol_spike }
- pandemic / disaster
```

### Seed list of 30+ candidate events

```
1971-08  Bretton Woods / Nixon shock                  [currency, structural]
1973-10  OPEC oil embargo                             [commodity, geopolitics]
1979-10  Volcker shock                                [monetary_policy]
1982-08  Mexican default / LatAm debt crisis          [credit]
1985-09  Plaza Accord                                 [currency]
1987-10  Black Monday                                 [structural]
1990-08  Iraq invades Kuwait                          [geopolitics]
1992-09  Sterling ERM exit (Black Wednesday)          [currency]
1994-02  Greenspan surprise hike                      [monetary_policy]
1997-07  Asian currency crisis                        [currency, credit]
1998-08  Russia default + LTCM                        [credit, structural]
2000-03  Dot-com peak                                 [bubble_burst]
2001-09  9/11 attacks                                 [geopolitics]
2007-08  Quant quake / BNP halt                       [credit]
2008-03  Bear Stearns                                 [credit]
2008-09  Lehman                                       [credit]
2010-05  Flash crash                                  [structural]
2010-05  Greek bailout #1                             [credit, currency]
2011-08  S&P US downgrade                             [credit]
2013-05  Bernanke taper tantrum                       [monetary_policy]
2014-10  Bund flash crash                             [structural]
2015-08  China yuan devaluation                       [currency]
2016-01  Oil at $26                                   [commodity]
2016-06  Brexit vote                                  [geopolitics]
2016-11  Trump election                               [geopolitics]
2018-02  Volmageddon (XIV ETN)                        [structural]
2018-03  Trump tariffs round 1                        [trade]
2018-12  Powell pivot eve                             [monetary_policy]
2020-03  COVID crash + Fed unlimited QE               [pandemic, monetary_policy]
2021-01  GameStop / meme squeeze                      [structural]
2022-02  Russia invades Ukraine                       [geopolitics]
2022-09  UK Mini-budget / gilt crisis                 [credit, currency]
2023-03  SVB / regional bank crisis                   [credit]
2024-08  Yen carry unwind                             [currency, structural]
2025-04  Trump tariffs round 2 ("Liberation Day")    [trade]
... room to grow ...
```

### Sources for the dataset

| Layer | Source | Notes |
|-------|--------|-------|
| **Prices (primary)** | [FRED API](https://fred.stlouisfed.org/docs/api/fred/) | Free, API key, 840k series; best for indices, yields, FX, oil, gold proxies. Use first. |
| Prices (global EOD) | [Stooq](https://stooq.com/db/h/) via `pandas-datareader` | Free, 60+ exchanges, 30+ years; bulk-downloadable |
| Prices (paid fallback) | [Tiingo Starter $7/mo](https://www.tiingo.com/about/pricing) | Clean US equity/ETF EOD back to 1962. Only if needed for current snapshot. |
| ⚠ Avoid for production | yfinance | Unreliable post-2024 (rate-limited, IP-banned). Prototyping only. |
| Recession dates | [FRED USREC](https://fred.stlouisfed.org/series/USREC) | NBER official turning points since 1854 |
| Positioning | [CFTC COT historical](https://www.cftc.gov/MarketReports/CommitmentsofTraders/HistoricalCompressed/index.htm) + [`cot_reports`](https://github.com/NDelventhal/cot_reports) Python lib | Free public domain. **High-leverage data most retail tools ignore.** |
| **Consensus surveys** | [Philly Fed Survey of Professional Forecasters](https://www.philadelphiafed.org/surveys-and-data/real-time-data-research/survey-of-professional-forecasters) | Free, machine-readable. Brilliant for "what consensus expected." |
| Headlines | [GDELT DOC 2.0 API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) | 1979→present, 100+ languages, 15-min update; ISQUOTE param extracts quotes |
| Fund flows (free) | [ICI weekly flows](https://www.ici.org/research/stats/flows) | Mutual fund + ETF combined, weekly |
| Fund flows (paid) | EPFR / Lipper | Mention as "future paid integration" in README |
| Pre-event polls | Reuters polls + BBG econ surveys | Manual scrape — the slow part |

**Critical pre-fetch:** download all OHLC + COT + SPF data for the 30 events into Postgres at build time. **No live API calls during user requests** — bad latency + rate-limit + license risk.

## 8. UX — the one-page brief

### Layout

```
╭─────────────────────────────────────────────────────────────────╮
│  [INPUT BAR — magazine-size typography, single text field]      │
│                                                                 │
│  ▼ user submits                                                  │
│                                                                 │
│  Headline: "Three echoes of: <user's event>"                    │
│                                                                 │
│  ┌─Analogue 1──┬─Analogue 2──┬─Analogue 3──┐                    │
│  │ Title       │ Title       │ Title       │   horizontally     │
│  │ Date        │ Date        │ Date        │   scrollable       │
│  │ ▁▂▃▅▆▇ S&P  │ ▁▂▃▅▆▇      │ ▁▂▃▅▆▇      │   on mobile        │
│  │ Fit: ●●●○○  │ Fit: ●●●●○  │ Fit: ●●○○○  │                    │
│  └─────────────┴─────────────┴─────────────┘                    │
│                                                                 │
│  ── Asset moves (next month, all 3 analogues, small multiples)──│
│  S&P    UST10Y  USD    Gold   Oil    HY OAS  VIX                │
│  ▁▂▃▆▇  ▇▆▅▃▁  ▁▂▆▇  ▁▆▇▆  ▁▂▃   ▆▇▇▆▅  ▆▇▆▁                  │
│                                                                 │
│  ── Flow patterns ───────────────────────────────────────────── │
│  Narrative + COT positioning chart                              │
│                                                                 │
│  ── Trades that looked obvious but failed ───────────────────── │
│  • [Quote] — Source, date                                       │
│  • [Quote] — Source, date                                       │
│                                                                 │
│  ── Where consensus went wrong ──────────────────────────────── │
│  Two-paragraph synthesis with footnoted citations               │
│                                                                 │
│  [▼ Show your work — reveals retrieval scores + reasoning trace]│
│  [⚠ Why this might not fit your event]                          │
╰─────────────────────────────────────────────────────────────────╯
```

### Visual language

- **Typography:** Inter Display for headlines, Inter for body, JetBrains Mono for numerals (with `font-feature-settings: 'tnum' 1`)
- **Palette:** FT-style off-white background `#FFF1E5` (light) / `#0A0A0A` (dark), Klein blue accent `#0B5FFF`, FT pink for negative numbers
- **Sparklines:** custom Visx, 60×16px, tracked alignment with text
- **Density:** Edward Tufte rule — high data:ink ratio, no chart junk

### Honest design moves (the integrity signals)

These are why this app earns trust — they're the rare signal in the LLM-finance market.

1. **Confidence bar** on each analogue
2. **"Where this might not fit"** card per analogue (auto-generated by the LLM, schema-enforced)
3. **Disagreement disclosure** — if the 3 analogues' forward-return distributions disagree, the app says so above the fold (e.g., "Two of three analogues saw equities recover within 30d. The third saw a 15% drawdown.")
4. **Show ranges, not point estimates** — for any aggregated forward return across analogues, show **median + 25/75 percentile**. N=3 is not a forecast.
5. **`/methodology` route** (and matching `METHODOLOGY.md`) addressing every limitation explicitly:
   - Why this isn't predictive
   - Why N=50 is the point, not a bug
   - Where look-ahead bias could creep in (and the `narrativeAtTime` split that prevents it)
   - Why we curate by hand instead of LLM-generating
6. **"Show your work"** disclosure → all 10 retrieved candidates with Jaccard + cosine scores, the tagging output, the LLM's reasoning trace
7. **Examples gallery** with both *good* and *deliberately broken* examples ("here's an event the tool handles badly — and why")
8. **Educational disclaimer** on every page — copy [virattt/ai-hedge-fund's](https://github.com/virattt/ai-hedge-fund) language for credibility signal

## 9. Risks / pitfalls (and how we avoid them)

| Risk | How it kills the project | Mitigation |
|------|-------------------------|------------|
| **Look-ahead bias** | Tool "knew" what happened next when describing the analogue | Store `preEventConsensus` separately from `consensusError`; prompt enforces point-in-time framing |
| **Cherry-picked analogues** | LLM rationalises any 3 events as fitting | Hybrid retrieval is deterministic; rerank scores published |
| **Over-claiming** | "This is the next 1987" headlines | Schema *forces* the model to write the "might not fit" section |
| **Ugly output** | Looks like a hackathon project | Disproportionate time on the one-pager design; FT/Bridgewater references |
| **Thin dataset** | 5 events feels gimmicky | Hard floor: don't launch under 30 |
| **Cost runaway** | Demo gets posted to HN, $$$ in API calls | Vercel Runtime Cache + BotID + per-IP rate limit + cached top-50 example queries |
| **Scope creep** | Tempting to add backtesting, alerts, account flow | Explicitly out of scope. One page, one feature. |
| **Stock data licensing** | yfinance terms of service | Pre-fetch and cache; cite Stooq as alt source; don't redistribute raw price data |
| **Hallucinated quotes** in "failed trades" | Reputational disaster | Every quote must have a verified source URL; LLM only paraphrases what's in the dataset |

## 10. The LinkedIn launch

The repo + write-up is the product as much as the app is.

### Repo polish

- MIT licence
- README leads with **the philosophy**, not features ("LLMs in finance are obsessed with prediction. This tool is for memory.")
- Animated GIF demo at the top
- One-paragraph problem framing
- Architecture diagram (the one above)
- "Things this gets wrong" section — *visible* near the top
- Methodology + dataset citation
- `CONTRIBUTING.md` for adding events (community moat)

### Live demo

- Memorable URL — suggested options: `analoguer.app`, `whathappenednext.app`, `echoes.markets`, `pasthistor.io`
- 5 cached example prompts on the landing page (so it works instantly without LLM cost)
- BotID + per-IP cap

### LinkedIn newsletter post structure

1. **Lead screenshot:** output for "Trump 2025 tariffs"
2. **Hook:** "I built an LLM tool that doesn't predict markets — it just remembers them. Here's why that's better."
3. **The price hook:** _"What used to cost $30k/yr at BCA, $10k/mo at Kensho, or a Bloomberg terminal — free and open."_
4. **The intellectual honesty pitch** (3 paragraphs — the moat)
5. **How it works** (1 paragraph + arch diagram)
6. **The dataset** (1 paragraph + table)
7. **What it gets wrong** (1 paragraph — *this* is the credibility signal)
8. **Try it / fork it / contribute events** (CONTRIBUTING.md flow)
9. **Tags:** #FinTech #LLM #MacroMarkets #OpenSource #Vercel

## 11. Build phases

| Phase | Time | Deliverables |
|-------|------|--------------|
| **0 — Approve** | now | This plan signed off |
| **1 — Scaffold** | ~2h | Next.js 16 + shadcn + Tailwind + AI SDK + Neon Postgres + pgvector live on Vercel preview |
| **2 — Schema + 5 seed events** | ~4h | Zod schemas, DB tables, 5 hand-curated events with full asset data |
| **3 — Pipeline E2E** | ~4h | Parse → retrieve → rerank → synthesize working with 5 events; structured output renders |
| **4 — UI: one-pager** | ~6h | Hero input, 3 analogue cards, sparkline grid, all sections rendered; dark mode |
| **5 — Dataset to 30** | ~10h | Hand-curate 25 more events with prices, consensus, failed trades. **Slowest phase by far.** |
| **6 — Polish** | ~4h | Confidence bars, "show your work" panel, methodology page, mobile responsive |
| **7 — Deploy + launch** | ~2h | Production deploy, README, LinkedIn post draft |

**Conservative estimate: ~32 hours (a long week or two weekends).**
Aggressive: ~16 hours if dataset is held to 15 events for v0.

## 12. Open questions for you (need answers before I start coding)

1. **Dataset depth at launch** — minimum 30 events (recommended) or ship at 15 to move faster?
2. **LLM provider** — Claude via AI Gateway only, or multi-provider (Claude + GPT) with toggle?
3. **Domain name** — pick from suggestions, propose your own, or punt to a Vercel `*.vercel.app` URL for v0?
4. **Visual references** — are you OK with the FT/Bridgewater aesthetic, or do you want something more "techy" (Vercel, Linear)?
5. **Repo name** — what should the GitHub repo be called? (different from app name potentially)
6. **Time budget** — weekend, week, two weeks?

Once these are settled I'll scaffold and start shipping.
