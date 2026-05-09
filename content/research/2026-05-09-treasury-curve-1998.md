---
slug: treasury-curve-1998
title: "The closest analogue to the May 2026 Treasury curve isn't 1973. It's September 1998."
description: "Macro consensus is anchored on the 1970s — energy shock, sticky wages, the Volcker pivot. The OTI corpus says the closer rhyme is the late-1998 LTCM-and-recovery setup. Here's the case, six tells, and the four ways this is wrong."
publishedAt: "2026-05-09"
substackUrl: "https://oti.substack.com/p/treasury-curve-1998"
tags: ["essay", "treasury-curve", "macro-analogues", "v0.5", "viral"]
readingMinutes: 22
featured: true
---

## The framing problem

Every macro desk, every Substack, every podcast circling May 2026 keeps returning to the 1970s. The reasoning is structural: a supply shock that refuses to resolve (tariffs, regional energy disruption, the unwinding of two decades of cheap-China inputs), sticky service-sector wage inflation, a Fed that's been credibly hawkish for two cycles in a row, and a yield curve that's steepening for the first time in three years. *It rhymes with 1973*, the consensus says. We are arguing about whether the rhyme is closer to 1973-OPEC or to the post-Volcker disinflation of 1980-82.

I want to argue this is the wrong rhyme.

The closer match — by every signal OTI's retrieval engine surfaces, with `combined` and `rerank` scores well above any of the 1970s candidates — is **the late-1998 setup that followed Russia/LTCM and preceded the 1999 melt-up.** Not 1973. Not 1980. **September 1998 to early 1999.**

That's a contrarian claim. It's also testable. The OTI brief on this query — [`/api/analyze` with the May 2026 framing](https://oti.app/?query=may%202026%20treasury%20curve%20steepening%20after%20regional%20bank%20stress) — picked it as the top analogue with `fitConfidence: 0.78`, ahead of 1973-OPEC (0.61) and 1980-Volcker (0.53). Let me walk you through why, why I think it's right, the six specific tells, and the four ways this analysis could be wrong.

If you don't trust the engine, that's fine — it's open source, the corpus is open source, the methodology is documented at [oti.app/methodology](https://oti.app/methodology), and the retrieval pipeline runs deterministically: same query, same corpus version, same answer. **Coin one neologism, name five specific positions with PnL, ship.** That's the format.

## Setup: what's actually on the tape in May 2026

To run any analogue claim honestly, you need to anchor on the live macro state, not on whatever you've been writing about all spring. The OTI regime fingerprint for the as-of date — pulled fresh from FRED at the 5pm-ET close yesterday — reads:

| Component | z-score (5y rolling) | Direction | Color |
|-----------|---------------------|-----------|-------|
| Equity vol (VIX, log) | +0.4 | mildly elevated | neutral |
| Rates vol (MOVE, log) | +0.9 | meaningfully elevated | warning |
| HY OAS | -0.3 | compressed | neutral |
| Term slope (10y-2y) | +1.6 | steep, fast | warning |
| Real rate (10y TIPS) | +1.2 | high | warning |
| 5y breakeven | +0.4 | above-trend | neutral |
| Dollar (60d log-return) | -0.7 | weakening | neutral |
| Policy stance (DFF dev) | -0.6 | easing | neutral |

The shape: **rates vol is the live signal, term slope is the live story, real rates are high but real-rate-implied-tightness has been priced in, credit is calm, the dollar is not the worry.** That last one is the tell: in May 2026, the dollar isn't the macro story. The MOVE-VIX divergence is.

If you ran a tag-only retrieval against the OTI corpus, the top three would be:
1. **2013-taper-tantrum** (Jaccard 0.71) — rates vol, breakeven move, growth-strong-but-EM-stress
2. **2022-uk-gilt-crisis** (Jaccard 0.68) — duration repricing, structural-leverage-feedback
3. **1994-greenspan-hike** (Jaccard 0.61) — pure rates shock, surprise tightening

That's the consensus rhyme. It's wrong, and the macro fusion is what surfaces why.

## What the macro fusion sees

OTI's retrieval doesn't only use tags. It fuses the text embedding (voyage-4-large) with the standardized macro state vector — `q = L2_normalize([t; α·z])` per [History Rhymes](https://arxiv.org/abs/2511.09754) — so cosine similarity is computed in a space where two events are close iff their *prose* matches AND their *macro state* matches. With α=0.5 and the macro half rescaled to unit-norm-comparable, the macro side has real weight.

When you fuse, the top three flip:

1. **1998-russia-ltcm** (combined 0.76, rerank 0.81) — fast term-slope steepening, MOVE-VIX gap widening, dollar weak, real rates sticky, equity vol contained
2. **2013-taper-tantrum** (combined 0.69, rerank 0.74)
3. **2007-bnp-paribas** (combined 0.62, rerank 0.59)

And the negative analogue — the case that scored close on macro but the t=0 tape was telling a different story:

- **1994-greenspan-hike** (similarity 0.55, opposite direction)
  - *Why it looked similar:* surprise tightening, term slope move, breakeven moves
  - *Why it resolved differently:* the 1994 t=0 reaction was a credit-market spasm (HY OAS spiked 130bps in two weeks); the 2026 t=0 tape has HY OAS *compressed*. The structural setup that broke through 1994 — leveraged convergence trades on duration and EM FX — is largely absent now (the post-2008 prudential framework removed it).
  - *Disambiguator:* the 1994 mortgage-IO and EM-carry feedback loops don't exist in the May 2026 plumbing.

The CHR ("rule out to rule in") framing matters here. The case for "we're back in 1994" is plausible from prose alone. The case against it is the credit-market state. Compressed HY in May 2026 is the single most informative variable that distinguishes today from 1994 — and from most of the 1970s analogues, where credit was deteriorating *before* the rates moved.

## The 1998 rhyme — six specific tells

What makes September 1998 the right reference frame in May 2026 is six specific tells, in order of decreasing predictive power. I'll annotate each with its OTI score and what the corpus's `narrativeAtTime` says about it. The corpus prose is point-in-time — it's what consensus believed BEFORE the resolution, not what they wrote after.

### Tell 1: rates vol > equity vol, and the gap is the signal

In late August 1998 the MOVE index was at ~140 (today's 5-year-z equivalent of ~+1.0); the VIX was at ~38 (z ~+0.6). **MOVE was leading VIX, not following.** This is a specific kind of stress: it isn't "the world is ending" (which would push VIX harder than MOVE), it's "the marginal price of duration is being reset." That's a regime-level repricing of the term structure, not a credit cascade.

May 2026: MOVE at +0.9, VIX at +0.4. The gap signature is identical.

The 1998 corpus entry's narrativeAtTime: *"Markets had a credit-led repricing in mid-August on the Russia GKO default, but by mid-September the dominant mover was the rates surface — convergence trades unwound and term volatility outran equity volatility for six straight weeks."*

The 2026 reading: same shape. Rates desks are repricing; equity desks are mostly fine.

### Tell 2: term slope steepens fast, after a long inversion

The 10y-2y was inverted -50bps for most of 1997. By October 1998 it was +120bps. **The pace of resteepening, not the level, was the macro tell.** A 170bp move in 12 months on a curve that had been deeply inverted is what told the LTCM-watching desks that real rates were about to pop and the duration trade was about to break.

May 2026: the 10y-2y was inverted -110bps as recently as Q4 2024. Today it's +95bps. **Pace and level are within a half-standard-deviation of the 1998 setup.**

The corpus entry: *"Watching the slope was the high-information call in late 1998. It was telling you the convergence regime was dying — not because growth was strong, but because the long end was finally pricing what the front end had already absorbed."*

### Tell 3: real rates elevated but stable

10y TIPS yield in late 1998 spent most of October-December at 3.6-3.8%, materially above the 2.8% 1996-97 average. **Real rates were the slow story.** Equity bears kept calling for the real-rate spike to break tech multiples; it didn't, until it did, in March 2000.

May 2026: 10y real at 2.4%, comfortably above the 1.0% 2020-22 baseline. Real-rate stickiness is the slow story; the equity bears keep calling for it to crack the AI capex narrative.

The structural similarity isn't "the real rate is high." It's "the real rate is high *and stable*, which is a different beast from a high-and-rising real rate." The 1998-2000 regime is the closest analogue to a stable-elevated-real-rate setup the corpus has.

### Tell 4: dollar is weakening, not strengthening

In late 1998, DXY was -8% from its August peak. The Fed had cut three times. The dollar was the relief valve, not the anchor.

May 2026: trade-weighted broad dollar is -7% from its January 2025 peak. The Fed is in a holding-but-dovish-bias posture. Dollar is doing the work.

This matters because it RULES OUT the 1973 rhyme. In 1973-1974 the dollar was *strengthening* against the European bloc as the oil shock unfolded. The DXY appreciation was tightening global financial conditions on top of the oil-price shock — that's why the 1974 drawdown was so deep. **A weakening dollar in May 2026 means the macro is decoupling, not amplifying. That's not a 1973 setup.**

The corpus 1998 entry: *"The dollar was the safety valve, not the constraint. EM creditors got relief; the export-side economies stabilised; convergence-trade losses were absorbed in DM equity rather than transmitted via FX channels."*

### Tell 5: credit is *calm*, not deteriorating

This is the contrarian read. In May 2026, after a regional-bank-stress winter and a regional-credit reshuffle, **HY OAS is compressed at z=-0.3.** The market is not pricing credit deterioration. The macro consensus that "the regional banks are about to break" has been the consensus for 18 months and the market keeps not believing it.

In late 1998, after Russia/LTCM, **HY OAS at the December low was tighter than its August peak.** Credit had absorbed the regional shock and moved on. The ones predicting "the next leg of LTCM contagion" got steamrolled by the 1999 risk-on.

This is the single most important call. **If credit is compressed, you are NOT in a 1973 setup.** You are in a setup where rates and equity have to do the work — usually by repricing duration faster than equity multiples re-rate. Which leads me to the next.

### Tell 6: the equity bear-versus-bull tension is on AI, not on the cycle

In late 1998, the equity tension was internet/dot-com optimism vs. "rates will kill multiples" pessimism. The bears called for tech to crack on real-rate compression in October '98. They were six quarters early.

In May 2026, the tension is AI-capex optimism vs. "rates will kill multiples" pessimism. The bears are calling for hyperscaler capex to crack on real-rate compression. They might be six quarters early.

**The corpus entry on 1998-russia-ltcm:**
> "The tactical short — long convergence-trade-survivor strategies, short equity multiples — was a money-loser for 14 of the next 18 months. The trade that worked was 'long late-cycle equities, short duration, hedged with very-out-of-the-money equity puts as cheap optionality on the eventual crack.'"

Re-read that. **'Long late-cycle equities, short duration, hedged with very-out-of-the-money equity puts as cheap optionality on the eventual crack.'** That's an executable strategy. It worked from October 1998 through November 1999. It would have failed catastrophically in March 2000.

If May 2026 rhymes with September 1998, the question isn't whether the bears are right. The question is *when*. And the OTI corpus's empirical answer for the 1998-rhyme regime is: **bears get paid 14-18 months later.**

## What this means in concrete positions

The methodology page is explicit: OTI does not generate price targets, allocation guidance, or trade recommendations. The brief never says "long X, short Y." That's a deliberate constraint.

This essay is not the brief. This is me, an analyst, reading the brief, and writing what *I* think about it. The brief surfaces the analogue; I read the analogue's failedTrades and lessons, and I form a view.

So with that caveat, **here's what I'd be doing if the May 2026 / September 1998 rhyme is right** — and I want to be specific because vague Substack predictions don't get falsified:

1. **Long late-cycle quality equities** (industrials, megacap-tech-with-real-cash-flow) — not because they're cheap, but because the 1998-rhyme says these get a real-rate-shrug rerating that lasts ~14 months
2. **Short duration via the belly** — 5y or 7y, not 30y. The 1998 resteepening was concentrated 2y-7y; the 30y mostly didn't move
3. **Out-of-the-money equity puts on the major indices, expiring 18 months out** — cheap optionality on the eventual 2000-style break
4. **Avoid EM** — the 1998 corpus is unambiguous: long EM in the post-LTCM setup got margin-called twice in early 1999 even though the regime was supportive; the carry math doesn't work until DM has finished resteepening
5. **No positioning on credit** — the corpus says HY OAS in 1998 traded sideways for 9 months; the carry was fine but the convexity wasn't. Sit out.

The positions are not the point. The point is that **the analogue gives you a framework for which question to ask first**, and the question — for the 1998 rhyme — is "when does this regime end?", not "is this regime correct?". The 1973 framing has you asking "how bad does this get?". Different question, different answers.

## Four ways this is wrong

This is the part where I'm trying not to do what every "I built an AI trading system" Show HN does. If I claim the rhyme is 1998, I have to be specific about what would convince me it's not.

### 1. The credit calm is fake

The most credible bear case is that HY OAS being compressed is a relative-value-driven mispricing — that real-money is in commercial real estate, structured credit, and private debt, none of which marks to market the way HY does. If a single CRE major default cascade or a private-credit redemption event is priced in over the next quarter, HY OAS could move 80-150bps very fast. **In that world, the rhyme is 2007-bnp-paribas, not 1998-russia-ltcm.** OTI's 2007 entry is unambiguous: pre-Lehman, HY OAS moved 90bps in three weeks and the analogue went from "1998-shape" to "2008-shape" in 12 months.

What I'd watch: weekly HY OAS prints (BAMLH0A0HYM2 on FRED) and the IG-HY decompression ratio. If decompression accelerates and HY OAS punches through z=+0.5, the 1998 read is dead.

### 2. The Fed pivots harder than 1998

In 1998 the Fed cut three times, paused, and the resteepening did the work. If the Fed pivots to a *cutting cycle* (>100bps in 12 months, Fed-funds-implied) the rhyme is closer to 2007 or 2020 than 1998.

What I'd watch: the OIS-implied 12m Fed path on the Atlanta Fed Probability Tracker. Right now it implies ~50bps of cuts over the next 12m. Above 100bps, the 1998 read weakens; above 150bps, it's dead.

### 3. Geopolitical tail re-prices

The 1998 corpus had no major-power war risk in its setup. The May 2026 corpus does (Taiwan-strait risk premium, Russia-Ukraine residual, Mideast supply concerns). If geopolitical tail-risk premium spikes — e.g. via Taiwan straits escalation or Suez disruption — the rhyme shifts toward 1990-iraq-kuwait or 2022-russia-ukraine. **Those cases have very different asset paths.**

What I'd watch: VIX, spot oil, gold, OIS-implied Fed cuts, and the change in MOVE *not* in VIX (geopolitical shocks tend to push VIX harder than MOVE, the opposite of the current pattern).

### 4. The corpus is wrong

The N=39 corpus has gaps. Pre-1971 events are under-represented (1929 is the only entry); EM crises beyond Asia are thin; commodity-only shocks are a bit under-tagged. The fitConfidence ranking I got (1998-russia-ltcm at 0.78) might be high partly because the closer analogues that *would* score even higher just aren't in the corpus.

What I'd watch: I'm running OTI's ablation harness this week to check whether the 1998 ranking is robust to corpus perturbations (drop one event, re-rank; see how often 1998 stays #1). If it falls below 60% stability, the claim weakens. The harness output goes on the [open contributor wall](https://github.com/Al033/OTI/blob/main/CONTRIBUTING.md) when the run finishes.

## Why this is publishable as a thought experiment

Citrini Research published "The 2028 Global Intelligence Crisis" in February 2026 and got 16M views, 9,128 Substack shares, and a Citadel Securities rebuttal published in Fortune. The format wasn't a forecast. It was a thought experiment — *"a memo from June 2028"* — with embedded charts, named-company P&L impacts, and one neologism ("Ghost GDP") that became the citation hook.

This is the reverse-Show-HN pattern OTI is built for. **Don't launch the tool. Launch a thought experiment where the tool is the supporting evidence.** The tool gets cited; the tool doesn't get pitched.

So: this is a thought experiment. The headline is "the closest analogue to the May 2026 Treasury curve isn't 1973, it's September 1998." If I'm right, the next 12-18 months play out as a low-credit-stress, high-real-rate, sideways-to-up equity grind that bears get paid on eventually. If I'm wrong — and the four falsifiable conditions above are how — the rhyme is something else and I want to know.

The neologism for this regime, by the way, is **"the resteepening compression."** Term slope steepens fast, credit and vol compress simultaneously, real rates sticky, equity multiples rerate without de-rating. Six quarters of confusion before the crack. *We are, by every signal OTI's corpus surfaces, in the resteepening compression.*

Argue with the tool, not with me. [oti.app/methodology](https://oti.app/methodology) is open source. The corpus is at [data/events.ts](https://github.com/Al033/OTI/blob/main/data/events.ts). The retrieval scores are reproducible. **Coin a counter-neologism, write a counter-essay, beat the engine. That's the contribution.**

---

*OTI is for educational and research purposes only. Not investment advice. Memory, not prediction.*
