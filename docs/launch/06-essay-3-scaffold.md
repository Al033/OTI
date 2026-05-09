---
slug: five-things-the-engine-sees
title: "5 things OTI's analogue model is screaming about June 2026 that consensus is missing"
description: "The pre-rendered scaffold for essay #3, dropping Friday May 23. Five specific signals where the OTI corpus retrieval is flagging a regime mismatch with consensus framing — each falsifiable, each with the specific corpus events triggering the call."
publishedAt: "2026-05-23"
substackUrl: ""
tags: ["essay", "scaffold", "v0.6"]
readingMinutes: 14
featured: false
draft: true
---

> **NOTE FROM CLAUDE — this is a SCAFFOLD, not a finished essay.**
>
> Essay #3 fires on Day 14 (Friday May 23) of the 30-day launch. By
> then OTI will have ~10 days of real query traffic in PostHog, and
> the FRED-driven daily-regime cron should be running. The point of
> this essay is to feed the engine real-data inputs and surface five
> specific calls where its retrieval differs from the May 2026
> consensus framing.
>
> The five-things skeleton below is the structure; the actual signals
> get filled in after pulling FRED prints and running the analyse
> pipeline against current state on May 21-22. Pre-brief the 3
> macro-newsletter writers (Concoda, Macro Notes, Capital Flows
> Research) on Wednesday May 21 with the headline + chart pack so
> they have 48h to prep their commentary.
>
> Below is the skeleton with placeholders for the actual data calls.
> Replace `[TODO_…]` with the real numbers + analogue picks before
> publishing.

---

## The framing

Two weeks ago I published a piece arguing the May 2026 Treasury curve
rhymes more closely with September 1998 than with 1973. It got a
fair hearing — including a substantive disagreement from [TODO_DISSENTER]
that I'll address below. The W4 piece was hypothesis-driven: I had a
thesis, OTI's retrieval supported it, I wrote it up.

This piece is the opposite. It's *engine-driven*. Over the past two
weeks I've been running OTI against the daily macro state vector at
US close, and the engine has been flagging five specific regime calls
that diverge from where consensus (Bloomberg consensus, Apricitas's
recent piece on [TODO_APRICITAS], Macro Hive's June outlook) is
framing the setup.

For each I'll give the engine's call, the specific corpus event(s)
triggering it, the disambiguator that distinguishes today from the
near-miss, and what would falsify it.

This is methodology, not prediction. If you trade off this post,
that's on you.

---

## 1. [TODO_SIGNAL_1 — the most obvious disconnect]

**Engine's read**: today's [specific gauge] z-score sits at [TODO_Z],
which historically has co-occurred with [specific corpus event] in
1998 and 2007 — both regimes where [specific thing] preceded
[specific outcome] by 3-6 months.

**Consensus read**: [restate the consensus framing fairly]

**The disambiguator**: [the specific macro variable that distinguishes
today from the engine's pick]

**What would falsify**: [the specific data print or policy event that
would tell us the engine is wrong]

**Negative analogue**: [the corpus event that LOOKED similar but went
the other way, with the date and the resolution]

---

## 2. [TODO_SIGNAL_2 — the structurally interesting one]

[Same template]

---

## 3. [TODO_SIGNAL_3 — the contrarian one]

[Same template]

---

## 4. [TODO_SIGNAL_4 — the unsexy one that probably matters most]

[Same template]

---

## 5. [TODO_SIGNAL_5 — the one I'm least sure about]

[Same template]

---

## What I'd watch this month

A specific data calendar of the next 30 days' prints that would
update each of the five calls. Be granular: dates, releases, what
each result would mean for the call. No generic "watch CPI" — say
"Friday May 30 PCE: a print above 2.7 invalidates signal #3."

---

## Where this whole thing could be wrong

Three failure modes:

1. **The engine's overfit to recent corpus events.** Of OTI's 39
   corpus entries, 12 are post-2018 — the recent skew biases
   retrieval toward the lockdown-era playbook. If today's setup
   genuinely doesn't fit any post-2018 case, the macro fusion
   could be pulling 2018-2025 events for spurious reasons.

2. **39 events is too thin to draw inference from at all.** This is
   the honest bar. The conformal calibration claims 80% coverage
   but at N=39 the asymptotic guarantee is approximate at best.

3. **The framing battle.** "Memory, not prediction" is a posture.
   If the five calls above turn out to be wrong, "well I never
   said it was prediction" is a cop-out. I'm putting them in this
   essay precisely because they ARE testable. Rate me on this in
   90 days.

---

## Closing

OTI is open source. The engine — the corpus, the retrieval, the
calibration, the conformal recipe — is all in [github.com/Al033/OTI](https://github.com/Al033/OTI).
The MCP server in Claude Desktop lets you run the same queries from
your own workflow.

If you want to disagree with any of the five calls, the highest-leverage
move is to submit a community PR with the corpus event you think OTI
is missing. CONTRIBUTING.md has the schema. The first 20 high-quality
regime cards merged get a permanent contributor cite + lifetime API
access.

Write your own essay. Beat the engine.

— Alan, oti.dev

*Memory, not prediction.*
