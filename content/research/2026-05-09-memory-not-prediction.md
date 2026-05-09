---
slug: memory-not-prediction
title: "Memory, not prediction: how OTI's retrieval actually works"
description: "A deliberate walk through OTI's pipeline — controlled-vocab tagging, RRF-fused retrieval, voyage-4 embeddings, History Rhymes-style macro fusion, voyage rerank, two-phase synthesis with structural look-ahead defence, and seven invariant checks before publication. Methodology, not prediction."
publishedAt: "2026-05-09"
substackUrl: "https://oti.substack.com/p/memory-not-prediction"
tags: ["methodology", "retrieval", "v0.5"]
readingMinutes: 9
---

Most LLM-in-finance projects pretend to predict. Every Show HN with a chart, every "AI hedge fund" GitHub repo, every Substack with a system-1 take on the next Fed decision. Audiences are getting sceptical and the projects mostly fail. The differentiator that's worth more than any code is the deliberate posture: **OTI is a memory tool, not a forecasting one.**

This is a methodology post. If you want the engine, [run the demo](/examples). If you want to know whether the answers it gives are trustworthy, read on.

## The shape of the problem

You see a market event in the wild — Trump announces 25% tariffs on essentially all US trading partners, the Fed surprises with an emergency cut, a regional bank fails on duration losses. The Bridgewater / BCA / Macro Hive question is the right one: **what does this rhyme with?** Every macro PM you respect has a mental library of historical regimes they pattern-match against. The question is whether you can build that library outside their head.

The naive LLM answer is bad. Ask any frontier model "what does this rhyme with?" and it will tell you, fluently, with confident nonsense. It will conjure a 2003 crisis, a fictional Lehman moment, a quote from Druckenmiller that he never said. The model is doing what models do — pattern-completing on its training distribution. None of it is auditable.

OTI's structural answer is to **constrain the model to a curated, dated, manifested corpus.** 39 hand-edited macro events, 1929–2025. Each entry has structured tags, a point-in-time narrative ("what consensus believed before the event resolved"), an outcome-in-hindsight, asset moves at five horizons, contemporaneous failed-trade quotes with attribution. The synthesis schema constrains `eventId` to a `z.enum(...corpus IDs)` built dynamically per request. **The model literally cannot return events outside the corpus.** Auditable.

## The pipeline

Read this once. The whole tool is six steps:

```
user query
   │
   ├──► tag (Claude Haiku 4.5) ─── controlled vocabulary {triggerType, regimeTags[], region, ...}
   │
   ├──► embed query (voyage-4-large @ 1024d via Vercel AI Gateway)
   │
   └──► fetch today's macro state vector (FRED/Yahoo, 1h cached)
                │
                ▼
   retrieve (deterministic)
     • Jaccard over regimeTags
     • cosine over [t; α·z] fused embeddings (History Rhymes pattern, α=0.5)
     • multi-query expansion (3 paraphrases via Haiku)
     • RRF fusion (k=60) across all retrievals
     • region as hard filter; top-15 candidates
                │
                ▼
   rerank (Voyage rerank-2.5 cross-encoder)
     • top-15 → top-10 against the user's free-text query
                │
                ▼
   synthesise — Phase A (Sonnet 4.6, prompt-cached corpus prefix)
     • sees only narrativeAtTime + t=0 reaction (no hindsight)
     • picks 3 best-fit analogues + optionally 1 negative-analogue
     • emits headline, summary, whyAnalogous, whereThisMightNotFit, disagreementNote
                │
                ▼
   synthesise — Phase B (same model, full hindsight payload for chosen 3)
     • emits failedTradesPattern, consensusError, caveats
                │
                ▼
   numeric paraphrase guard scrubs digit-runs from prose
                │
                ▼
   self-verifier runs 7 invariant checks (candidate consistency, direction
     coherence, fit-confidence sanity, attribution integrity, ...)
                │
                ▼
   conformal-calibrated 80% intervals on @1m asset returns
                │
                ▼
   render: streaming brief + asset-move table with FRED/Stooq provenance
```

Six-second wall-clock from query to first token, ~14-18 seconds to full brief. Streaming via newline-delimited JSON; the headline lands first, analogue cards fill in as Phase A streams, the cross-event synthesis fills in as Phase B streams.

## The five load-bearing decisions

If you only read one section of this post, read this one. Most things in OTI are conventional. Five aren't.

### 1. The corpus knowledge prime

Every synthesis call carries a static system-prompt prefix that lists the full controlled vocabulary plus the entire corpus manifest (id, date, region, triggerType, title for all 39 events). This isn't decoration — it's what makes the cached prefix clear Sonnet's 2,048-token cache floor. The 1-hour ephemeral cache then recovers ~71% of the input cost on the synthesis path during normal traffic.

Side benefit: the model sees the corpus boundary before it sees any candidates. It can't rationalise that the 1973 oil shock "fits" if 1973 isn't in the manifest.

### 2. Two-phase synthesis with structural look-ahead defence

Phase A picks the analogues. It sees only `narrativeAtTime` and the t=0 (1-day) market reaction for each candidate. It does NOT see `outcomeInHindsight`, longer-horizon asset moves, failedTrades, or the per-event consensusError. This is the structural defence against look-ahead bias — when the model reasons about whether 1992 Black Wednesday is analogous to a current sterling event, it sees the consensus that markets believed sterling could be defended, not the hindsight that Soros made $1bn.

Phase B fires only after the three analogues are locked. It sees the full hindsight payload for those three events and emits the cross-analogue patterns: failed-trades pattern, consensus error, caveats. It cannot regenerate the analogue list, the headline, or the summary. The schema enforces this; the model can't cheat by re-litigating its picks once it knows what happened next.

This is the lift. Verbal "please don't use hindsight" instructions are unenforceable. **Removing the hindsight from the prompt context is enforced.**

### 3. History Rhymes-style macro fusion

The naive cosine retrieval matches on prose similarity. "Trump tariffs" rhymes with "Nixon import surcharge" because the narrative descriptions overlap on policy-uncertainty language. It misses cases where the prose differs but the macro setup is identical.

OTI fuses the text embedding with today's macro state vector — `q = L2_normalize([t; α·z])` per [arXiv:2511.09754](https://arxiv.org/abs/2511.09754). The macro vector is 8-dimensional: VIX, MOVE, HY OAS, term slope, real rate, 5y breakeven, dollar regime, policy stance. Each dimension is z-scored against a trailing 1,260-trading-day window strictly preceding the as-of date.

When today's setup is "high vol, compressed credit, real-rate elevated," cosine-fused retrieval pulls in past regimes that scored similarly on the same eight dimensions, regardless of whether the prose mentions tariffs or Lehman. The text signal still dominates (α=0.5, with the macro contribution rescaled to be norm-comparable to the unit-norm text embedding) — but it's no longer the only signal.

### 4. Negative-analogue retrieval

Every brief surfaces a fourth case: the regime that scored high on macro-state similarity but whose t=0 (1-day) reaction was OPPOSITE to the chosen three. The "looked similar early but the tape was already telling a different story" event. The brief writes:

- *Why it looked similar* — the surface match
- *Why it resolved differently* — what t=0 was signaling
- *Disambiguator* — the specific macro variable that distinguishes today from this near-miss

This operationalises the CHR — Contrastive Hypothesis Retrieval ([arXiv:2604.04593](https://arxiv.org/abs/2604.04593)) — paradigm of "rule out to rule in." It's the single thing no competitor ships. Bloomberg Event Analysis doesn't. Kensho doesn't. AlphaSense doesn't. Macro Hive doesn't. **It's the difference between "here are three analogues" and "here are three analogues, and here's the case that almost matched but went the other way, and here's why."**

### 5. Logit-free conformal coverage

The brief shows a calibrated 80% interval on each asset's @1m return. **Calibrated, not empirical.** The recipe is leave-one-out walk-forward conformal calibration over the corpus:

1. For each event E, find E's 3 nearest neighbours by Jaccard tag overlap, restricted to events strictly before E's date (walk-forward — no future leakage).
2. Predict E's return at horizon h as the median of those 3 neighbours' return at h.
3. Compute |actual - predicted| residual.
4. Collect across all events; the (1-α)-quantile of residuals, with finite-sample correction, is the calibrated half-width q*.

At brief render time: median of chosen 3 ± q*. The methodology page documents that at N=39 the 80% claim is asymptotic, not exact — but this is honest in a way "empirical N=3 range" isn't, and it's the right shape as the corpus grows.

This is logit-free — Anthropic still doesn't expose per-token logprobs on the public API, blocking standard LAP and conformal-on-LLM-output schemes. We dodge that entirely by calibrating on the historical data, not on LLM outputs. Inspired by LofreeCP ([arXiv:2403.01216](https://arxiv.org/abs/2403.01216)) and the spirit of ACSE ([arXiv:2605.04295](https://arxiv.org/abs/2605.04295)).

## What we deliberately don't do

- **No price targets.** The brief never says "the S&P will likely fall X%."
- **No allocation guidance.** The brief never says "long oil, short EM credit."
- **No backtests.** OTI is a memory tool; backtests have a different epistemic standard and the API surface area would explode if we tried to do both.
- **No mental math.** The asset-move table is rendered deterministically from the corpus; the LLM never paraphrases percentages in prose. The numeric guard scrubs any digit-run that doesn't appear in the corpus before the brief ships.
- **No invented quotes.** Failed-trade quotes are sourced (or labelled `paraphrase_no_source` with a visible badge); the LLM only synthesises patterns across them, never invents specific quotes.

## The audit panel

Every brief includes a "show your work" disclosure that exposes:

- The query interpretation: triggerType, regimeTags, region, surpriseFactor, the LLM's tag rationale.
- All retrieved candidates with Jaccard, cosine, RRF combined, and Voyage rerank scores. The 3 selected analogues are highlighted in accent colour; the negative analogue is highlighted in warning colour. The other 6 are visible.
- Which model was used for tagging and synthesis, the embedding source (Postgres / sidecar / none), whether rerank ran, the wall-clock time, the corpus version hash.
- The verifier badge: 7-of-7 checks passed (or N flags surfaced).

Intellectual honesty is enforced at the UI surface, not aspirational.

## What I'd update if you asked me to ship v0.6

The deferred items are documented in [CHANGELOG.md](https://github.com/Al033/OTI/blob/main/CHANGELOG.md). The big three:

1. **LAP CI gate** — Anthropic ships per-token logprobs.
2. **LLM-augmented changepoint anchoring** — a TypeScript-native CPD library matures, or we accept a Python build step.
3. **Hard-negative contrastive retriever fine-tune** — corpus crosses N>200 and the FinAgent-RAG-style training data is worth generating.

## The bigger thesis

Memory is the underrated operation. Every macro analyst with five years of experience has a private library of regimes they pattern-match against, and the difference between a good one and a bad one is usually the breadth and specificity of that library. **OTI tries to externalise it** — to build a public, dated, manifested, citable library that any FinTwit reader can use the same way.

The library is the moat. Every PR that adds an event with a verified `sourceUrl` and a tagged regime makes the library more valuable. Every PR that improves a quote attribution makes the library more trustworthy. The code is 20% of the value; the corpus is 80%, and the contributing flywheel is what makes that 80% scale.

If you want to contribute, [open a PR](https://github.com/Al033/OTI/blob/main/CONTRIBUTING.md). The bar is "the regime is named, the date is right, the narrative is point-in-time, the asset moves are FRED-verified." The first 20 high-quality regime cards merged get a permanent contributor cite and lifetime API access.

Memory, not prediction. The whole point.
