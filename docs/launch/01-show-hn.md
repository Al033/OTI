# Show HN — May 13 2026, 08:30 ET

## Pre-flight checklist (Monday May 12 evening)

- [ ] Repo README has the architecture diagram + the "why this is different" pillar list visible above the fold
- [ ] `oti.dev` resolves (DNS propagated)
- [ ] `oti-seven.vercel.app` and `oti.dev` both render the home page
- [ ] At least one demo brief (`/examples` page) loads in <2 seconds without keys
- [ ] The Treasury-curve essay at `/research/treasury-curve-1998` renders with OG card visible in a Twitter-card validator
- [ ] You have HN account ≥3 months old with ≥10 karma — fresh accounts get auto-throttled. If you don't, post via a co-founder/friend
- [ ] 3 friends pre-warned to upvote (they comment substantively too — vote rings get killed)
- [ ] You're at your laptop 08:30 ET → 14:30 ET, replying within 5 min to every comment

---

## Title

```
Show HN: OTI – Open-source historical-macro-analogue engine for retail/junior analysts
```

**Why this title**:
- "Show HN:" prefix is the genre signal; HN gives Show HN posts more grace on early-vote thresholds
- "Open-source" is upvote currency on HN
- "historical-macro-analogue engine" is precise — readers self-select
- "for retail/junior analysts" sets the audience and is not over-claiming as institutional
- 75 chars — under the 80-char wrap

---

## URL

```
https://github.com/Al033/OTI
```

**Why repo not Vercel URL**: HN voters click into the README to evaluate. The README is your above-the-fold pitch. Vercel URL is one click deeper and dilutes the "oh this is a real project" signal.

---

## Body

(Body is what shows on the post page. ~300 words is the sweet spot.)

```
Hi HN — I built OTI because every "LLM in finance" project I'd seen
was pretending to predict, and that's a lost game. OTI is the opposite:
a tool for memory and pattern-recognition, not forecasting. You type a
market event in plain English ("Trump announces 25% tariffs on EU
autos", "Fed surprises with a 50bp cut"), and it returns 3 historical
analogues from a curated 39-event corpus (1929–2025), with conformal-
calibrated 80% intervals on each asset's 1-month return.

Three architectural decisions that I think distinguish it from the
default RAG-on-finance shape:

1) Two-phase synthesis with structural look-ahead defence. Phase A
(analogue selection) sees only narrativeAtTime + the t=0 market
reaction — never the longer-horizon outcome. Phase B (cross-event
synthesis) sees the full hindsight payload only after the 3 analogues
are locked. The model literally cannot leak hindsight into the
"why this analogue fits" reasoning.

2) Negative-analogue retrieval (CHR pattern, arXiv:2604.04593). Every
brief surfaces a 4th case that scored high on macro similarity but
resolved oppositely on direction — "the case that almost matched but
went the other way." The disambiguator surfaces the macro variable
that distinguishes today from the near-miss.

3) Logit-free conformal coverage. Anthropic doesn't expose per-token
logprobs, so standard conformal-on-LLM schemes are blocked. Instead
we calibrate on the historical data via leave-one-out walk-forward
folds — interval coverage on the asset bands is empirical, not vibes.

The corpus, prompts, retrieval pipeline, and JSON Schema for events
are all open source. There's a community PR pipeline for new event
contributions (CONTRIBUTING.md). The MCP server at /api/mcp is
listed in the major directories — Claude Desktop / Cursor / OpenBB
users can call OTI directly.

Live: https://oti.dev (or https://oti-seven.vercel.app if DNS still
propagating).

Things I know are wrong / want feedback on:
  - 39 events is small. EM coverage is thin. Pre-1971 is one event.
  - Most failedTrades quotes are paraphrase_no_source — flagged in
    the UI but the verified-source rate is low.
  - The negative-analogue retrieval works but is N=1 and could be
    miscalibrated; we're collecting click data to iterate.
  - "Memory not prediction" is the framing; if you want price
    targets, OTI is wrong by design.

Repo: https://github.com/Al033/OTI · Methodology: oti.dev/methodology
```

---

## First comment (post within 60 seconds of submission)

This is the "single most upvote-rich comment slot." Use it to share what's NOT in the title or body. HN voters specifically reward this kind of self-criticism.

```
Author here. A few things I left out of the body for length:

The retrieval is voyage-finance-2 + History Rhymes-style macro fusion
(arXiv:2511.09754) + Voyage rerank-2.5, fused via reciprocal-rank
fusion with Jaccard over a controlled regime-tag vocab. The "macro
fusion" piece — concatenating today's standardized macro state vector
to the text embedding before cosine — is what lets it match on
structural setup rather than just on prose similarity. Trump tariffs
2025 rhymes with Nixon 1971 not because the prose mentions tariffs
in both, but because both are USD-source policy shocks happening
into a real-rate-elevated, vol-compressed, dollar-weakening regime.

Honest caveats:

- N=39 events. The corpus is the actual moat (the code's a weekend);
  we're recruiting community PRs for the next 30 events via a public
  bounty. Wishlist: 1944 Bretton Woods, 1956 Suez, 1986 oil collapse,
  1989 Nikkei peak, 2017 XIV pre-warning. CONTRIBUTING.md has the
  schema + provenance checklist.

- Anthropic's logprobs gap is real and limits what we can do for
  uncertainty calibration. If/when they ship logprobs, we add a LAP
  CI gate (arXiv:2512.23847) for memorization-driven false-positive
  fits. For now: leave-one-out walk-forward conformal on the asset
  bands is the best honest answer we have.

- The MCP server is listed at /api/mcp — Claude Desktop config snippet
  in the README. The Resources surface (oti://corpus/events.json,
  oti://corpus/manifest.json, oti://methodology) lets connected clients
  pin the corpus into their working context without burning tool-calls.

- We deliberately don't do: price targets, allocations, backtests,
  fine-tuned domain LLMs. The "not what this is" list is in /methodology.

Happy to answer specific questions about the look-ahead-defence design,
the conformal recipe, the corpus contribution flow, or the deferred
features (vision input for chart-paste, Multiagent migration, hard-
negative contrastive fine-tune). I'll be on this thread for the next
6 hours.
```

---

## How to handle the predictable critiques

**"Why is this not just RAG?"**
> RAG retrieves text. OTI retrieves *structured analogue claims* against a corpus that was edited to be retrievable. The two-phase synthesis with structural look-ahead defence isn't a RAG pattern — it's a post-RAG architecture. The closest published architecture is FinAgent-RAG (arXiv:2605.05409, May 6 2026), which OTI's Self-Verifier loop is patterned on.

**"Isn't N=39 events too small to draw any conclusions from?"**
> Yes — and that's a feature, not a bug. The smallness is what makes the corpus auditable: every event is hand-edited, every claim has provenance, every retrieval candidate is in scope of "did the curator see this and what did they think?" An LLM trained on internet-scale data can talk about thousands of events; the constraint to 39 is what makes the output auditable. As N grows past 75-100 we add proper conformal calibration; under that, we're explicit about the empirical-N=3 framing on every brief.

**"How do you stop the model from hallucinating events?"**
> Phase A's eventId field is constrained at the Zod schema level to a `z.enum(...candidate IDs)` built dynamically per request. The model literally cannot return events outside the retrieved candidates. We have not seen hallucinated event ids in production traces. Hallucinated *quote contents* is a separate risk — we mitigate via the numeric paraphrase guard (digit-runs in prose are scrubbed) and the failedTrades sourceUrl provenance chain, but it's a known soft spot.

**"What's the business model?"**
> Hosted demo is free; corpus + code + Vercel deployment are MIT. The 20-event contribution bounty (first 20 high-quality regime cards merged → permanent contributor cite + lifetime API access) is the closest thing to monetisation. If a paid tier ever ships, it'll be for higher-rate-limit API access, not for the corpus or analogues themselves. The corpus is the moat; the code's a weekend.

**"Can I run this against my own corpus?"**
> Not yet. Custom-corpus support (upload a JSON, run the same retrieval pipeline on private events) is on the v0.7 roadmap. For now you can fork and replace `data/events.ts` with your own.

**"Is it just pattern-matching?"**
> Mostly yes — that's the whole point. OTI is a *memory* tool, not a *prediction* tool. The framing shift is the value, not the algorithm. We don't claim the analogues will be predictive; we claim they'll surface historical context the user hadn't thought of. A working analyst does this with their own mental library; we externalise that into a public, dated, citable artifact.
