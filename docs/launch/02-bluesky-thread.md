# Bluesky thread — 8 posts (works for X too)

**When**: Day 5 (Wed May 14), 09:00 ET. Cross-post 60 minutes after the HN front-page traction settles.

**Where**: Bluesky primary (no URL penalty), X secondary (URL in bio, not in posts — X charges $0.20 per URL post post-Feb 2026).

**Why this format**: 8 posts is the Bluesky sweet spot — long enough to be substantive, short enough each post can stand alone if quoted. Each post ends in a hook for the next.

---

## Post 1 / 8

```
Just shipped OTI to HN front page.

A historical-macro-analogue engine for retail/junior analysts. Type
a market event, get 3 historical regimes that rhyme + 1 that ALMOST
matched but went the other way. Memory, not prediction.

Why the framing matters in 2026 ↓
```

## Post 2 / 8

```
Every "LLM in finance" project I've seen is pretending to predict.
That's a lost game and the audience knows it.

What real macro PMs actually do: pattern-match against a private
mental library of historical regimes. Druckenmiller doing this is
why he's Druckenmiller. The library is the moat.

OTI externalises it.
```

## Post 3 / 8

```
The naive LLM answer to "what does this rhyme with" is bad. Frontier
models will tell you, fluently, with confident nonsense — fake 2003
crisis, made-up Lehman moments, invented Druckenmiller quotes.

OTI's structural fix: a curated, dated, manifested corpus. 39
events, 1929-2025. The synthesis schema constrains eventId to a
Zod enum. The model literally cannot hallucinate events outside it.
```

## Post 4 / 8

```
The single move I'm proudest of is two-phase synthesis with
structural look-ahead defence:

Phase A picks analogues using ONLY narrativeAtTime + the 1-day
market reaction. Never longer-horizon outcome.

Phase B writes the cross-event synthesis with full hindsight.

The defence isn't a verbal "please don't use hindsight" — it's
literally not in the prompt context.
```

## Post 5 / 8

```
The contrarian feature is negative-analogue retrieval (CHR pattern,
arXiv:2604.04593). Every brief surfaces a 4th case that scored high
on macro setup but resolved oppositely.

"This looked like 1998 LTCM, but here's the case that LOOKED similar
early and went the other way — and here's the macro variable that
distinguishes them."

No competitor ships this.
```

## Post 6 / 8

```
The 80% intervals on each asset's @1m return are calibrated, not
empirical. Leave-one-out walk-forward conformal calibration over
the corpus.

Anthropic doesn't expose logprobs so the standard conformal-on-LLM
schemes are blocked. We dodge that by calibrating on the data, not
on LLM outputs (LofreeCP-style, arXiv:2403.01216).

Honest interval, not vibes.
```

## Post 7 / 8

```
The whole thing is open source. MIT licensed corpus, prompts, eval
gold-set, retrieval pipeline, conformal calibration code.

There's an MCP server so Claude Desktop / Cursor / OpenBB users can
call OTI tools directly from inside their workflow. Resources +
Prompts surfaces are exposed too.

Bounty: first 20 high-quality regime cards merged → permanent
contributor cite + lifetime API access.
```

## Post 8 / 8

```
The deliberately-not-doing list is the methodology page's most
load-bearing section.

No price targets. No allocations. No backtests. No fine-tuned
domain LLM. No vision input (yet). No "find me a trade" mode.

OTI surfaces history and asks you to think. That's it. That's the
whole product.

🔗 in bio.
```

---

## X version (condensed)

If posting to X, condense to 4 posts (X's 280-char limit makes 8 awkward). Use the Bluesky 1, 4, 5, 8 as your X 1, 2, 3, 4. Pin the OTI URL in your bio so the link is one click away (don't put it in any post — $0.20/post penalty).

---

## Cross-post pattern

- 09:00 ET Bluesky thread (8 posts)
- 09:30 ET X thread (4 posts) — quote-tweet your own Bluesky thread
- 10:00 ET LinkedIn (one combined long-form post — LinkedIn has no URL penalty and a different audience)
- 10:30 ET Substack Notes (the W4 essay's strongest single paragraph as a Note, deep-link to Substack post)
