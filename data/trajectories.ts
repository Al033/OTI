/**
 * Analytical trajectories per corpus event — ARISE pattern (arXiv:
 * 2605.03242, May 5 2026). Stored separately from `data/events.ts`
 * because trajectories are a v0.6+ feature: contributors fill them in
 * incrementally as PRs to this file, not as edits to the (long)
 * primary corpus file.
 *
 * Schema: src/lib/types.ts AnalyticalTrajectorySchema
 *
 * Bar for inclusion:
 *   - priorBeliefs: a one-sentence consensus summary, point-in-time only
 *   - marginalDataPoints: 2-6 specific gauges that were updating priors
 *   - decisionPoints: 1-4 dated inflection moments
 *   - dominantBias: the single most common cognitive error
 *   - whatGoodAnalystsDid: operationalisable, not vibes
 *
 * Trajectories are optional in HistoricalEventSchema; events without
 * one in this file render normally with no trajectory section.
 *
 * v0.6 ships 5 anchor trajectories. Target N=39 (one per event) by
 * v0.7 via community PRs.
 */

import type { AnalyticalTrajectory } from "@/lib/types";

export const TRAJECTORIES: Record<string, AnalyticalTrajectory> = {
  "1971-nixon-shock": {
    priorBeliefs:
      "Markets had grown uneasy about US gold reserves through 1971, but most economists expected a coordinated multilateral devaluation — not a unilateral suspension of gold convertibility paired with a 90-day price freeze announced on a Sunday-night TV address.",
    marginalDataPoints: [
      "France's June 1971 gold conversion of $191m made the run on US reserves visible above the surface — the canary nobody wanted to hear",
      "Eurodollar overnight rates spiked 200bps in the week before Aug 15 as banks pre-positioned for an FX shift",
      "The Treasury's Saturday-evening meeting at Camp David Aug 13-15 leaked enough that gold spot rallied $2 by London close Friday",
      "ECB Bundesbank had stopped supporting the dollar at the lower band on May 5, 1971 — a clean tell that the pegs were fraying",
    ],
    decisionPoints: [
      "Aug 9-13, 1971: the Camp David weekend rumours; analysts had to choose between 'one-off crisis meeting' and 'regime change brewing'",
      "Aug 15-16 first trading session after the Sunday announcement: the equity ramp on the price-freeze relief was the contrarian read most missed",
    ],
    dominantBias:
      "Multilateral-coordination bias — analysts assumed a global problem must be solved through international consensus (Group of Ten, IMF route), missing that Nixon would act unilaterally.",
    whatGoodAnalystsDid:
      "Watched the cross-currency basis and the speed of central-bank gold conversions — both said the system was breaking, regardless of whether the announcement came from a coordinated body or one country acting alone. Bought gold and DM in mid-1971 and held through the announcement.",
  },

  "1998-russia-ltcm": {
    priorBeliefs:
      "Consensus through summer 1998 was 'EM contagion contained' — Asia had been ring-fenced via IMF programmes, Russia was a small economy, the Western banking system was strong. Most strategists expected at most a brief vol spike.",
    marginalDataPoints: [
      "GKO yields had been climbing 15→90% June-August despite IMF rescue talks — a clean signal the market priced default risk well above the IMF's intent",
      "USD/RUB had broken the band in late July; the central bank's reserve drawdown was visible in weekly data",
      "TED spread (3m LIBOR - 3m T-bill) widened from 32bp to 60bp in early August — banks started pricing each other's credit",
      "S&P implied vol surface developed a strong skew above the spot 5% mark — option-market positioning was anticipating tail risk equity bears didn't see",
      "Bear Stearns' surprise earnings warning Aug 5 (LTCM was a counterparty even if nobody knew it yet) was the visible 'something's broken' tell",
    ],
    decisionPoints: [
      "Aug 17, 1998 (Russia GKO default + ruble devaluation): the analyst had to read this as either 'isolated EM event' or 'systemic counterparty cascade brewing'",
      "Sep 23, 1998 (LTCM rescue meeting at NY Fed): the credit-correlation regime change was visible to anyone reading the press release; most still framed it as 'one fund, contained'",
      "Oct 15, 1998 (surprise inter-meeting Fed cut): equity bottoms occurred AT the cut, not after — the analyst had to decide on the day whether 'the cut means the worst is over' (right) or 'the cut means it's just starting' (wrong)",
    ],
    dominantBias:
      "Fundamentals-over-positioning bias — analysts argued from balance-sheet strength when the actual mechanism was forced selling by leveraged convergence-trade survivors. The IMF/Fed-will-fix-it heuristic dominated even after LTCM's $4.6bn loss showed the structural-leverage feedback loop was live.",
    whatGoodAnalystsDid:
      "Tracked the cross-asset correlation matrix daily. When equity-bond-credit-FX correlation flipped from 'orthogonal' to 'all moving down together' in mid-Aug, that was the sell signal — not the price level. Reduced gross before LTCM was named, added equity exposure on the day of the surprise cut, held through the 1999 grind to 1999 highs.",
  },

  "2007-bnp-paribas": {
    priorBeliefs:
      "By July 2007 most strategists had moved to 'subprime is contained' (Bernanke's June 2007 phrasing) — losses sat on the books of two specific Bear Stearns funds, the broader CDO market was 'fine', credit spreads had only marginally widened, equities were near all-time highs.",
    marginalDataPoints: [
      "ABX BBB index had collapsed from 95 to 50 over Q1-Q2 2007 — the cleanest single-tape signal that subprime was deteriorating fast at the bottom of the credit stack",
      "TED spread was widening through July to ~80bps from a 30bp baseline; credit was telling the funding-stress story equity wasn't",
      "Asset-backed commercial paper outstanding peaked in July; the run had started before Aug 9",
      "Three European bank funds (BNP Paribas, IKB, Sachsen LB) all paused redemptions or hit funding limits in the same 10-day window — that pattern was a clean signal of European-bank exposure being underestimated by US-centric analysts",
      "Repo haircuts on lower-tier MBS collateral had jumped from 2-3% to 8-10% in late July — the funding-mechanism stress was already there",
    ],
    decisionPoints: [
      "Aug 9, 2007 (BNP Paribas funds suspend redemptions, ECB injects €95bn overnight): the 'liquidity event vs solvency event' read had to happen that day. Most read it as a temporary funding wobble; the structural-leverage view said this was a regime change",
      "Aug 17, 2007 (Fed surprise discount-rate cut, fed funds unchanged): the half-measure response was a tell that the Fed didn't yet understand the funding plumbing was broken",
    ],
    dominantBias:
      "Containment bias — once a frame ('subprime is contained') is endorsed by the Fed and broad sell-side, the cost of disagreeing rises and the marginal data points get explained away as noise. Every framing that took losses out of the financial-system core ('it's just retail mortgages') was used to discount the funding-mechanism stress.",
    whatGoodAnalystsDid:
      "Watched ABCP outstanding + repo haircuts on MBS collateral as the 'is the plumbing broken' gauge, ignored the equity tape, ignored Bernanke's containment language. Reduced gross financial-sector exposure in July, lengthened duration on the front end (which was the trade that worked through the Aug-Dec 2007 cuts).",
  },

  "2008-lehman": {
    priorBeliefs:
      "By the weekend of Sep 13-14, 2008 most desks expected a Bear-Stearns-style rescue — Treasury would arrange a buyer, Fed would backstop. The Bear precedent had created a 'too-big-to-let-fail' reflex that consensus assumed extended to Lehman.",
    marginalDataPoints: [
      "Lehman CDS at 700+bps Friday Sep 12 vs Bear's 400bps the week before its rescue — the credit market was already pricing Lehman as more impaired",
      "Treasury Secretary Paulson's Sep 12 statement that 'no public money' would be used was the explicit pre-commitment; analysts who took it at face value got it right",
      "BarCap and BAC both walked from the Saturday Sep 13 negotiations — when both potential buyers exit, the bid stack is clearly empty",
      "The FDIC had been quietly building bank-resolution capacity through summer 2008 — the policy preparation for failure was visible to Washington-watchers",
      "The TED spread had spiked to ~150bps by Friday Sep 12; the funding-market gauge said the system was already on the edge of seizure regardless of the rescue outcome",
    ],
    decisionPoints: [
      "Saturday Sep 13, 2008 morning when BarCap pulled out: the analyst had ~36 hours to decide whether to position for a Sunday-rescue (rallying gap up Monday) or a Sunday-failure (gap-down chaos)",
      "Sunday Sep 14, 2008 evening — Treasury announces no rescue; AIG's $85bn bridge loan needed Tuesday morning, the second decision point of the weekend",
      "Friday Sep 19, 2008 SEC short-sale ban announcement — counter-trend rally that lasted 3 days; the test of whether you covered shorts at the wrong time",
    ],
    dominantBias:
      "Precedent bias — Bear Stearns' March 2008 rescue created the 'too-big-to-fail-here' reflex. Analysts treated Bear as a precedent rather than as one data point about a still-unstated policy function. Paulson's explicit Sep 12 'no public money' was discounted as negotiating tactics rather than a real constraint.",
    whatGoodAnalystsDid:
      "Took the Treasury's no-public-money line at face value, watched the buyer stack collapse on Saturday morning Sep 13, sized positions for a no-rescue Sunday before knowing the outcome. The trade that worked: long Treasuries, long USD, short equities into Sunday close, covered shorts on the Friday Sep 19 short-sale-ban rally before the Oct 6-10 capitulation.",
  },

  "2020-covid-crash": {
    priorBeliefs:
      "Through mid-February 2020, consensus framed COVID as 'a regional Asian epidemic' that would resolve by Q2 like SARS in 2003, with at most a 1-2% global growth dent. Most strategists expected the Fed to cut 25bps as insurance and the dip to be bought.",
    marginalDataPoints: [
      "Italian Lombardy region case acceleration began Feb 21-25, 2020 — the first credible signal Western containment had failed; equities ignored it for a week",
      "USD funding stress had appeared in cross-currency basis swaps by early March (USDJPY 3m basis went from -10bp to -85bp Mar 2-12) — dollar squeeze was building before the equity panic peaked",
      "Saudi-Russia OPEC+ break Mar 6 2020 (oil -25% in a session) was the second exogenous shock most analysts didn't connect to the COVID setup — the combination drove the Mar 9 circuit-breaker day",
      "The MOVE index spiked to ~165 by Mar 9, well ahead of VIX at 50 — rates vol was the leading gauge",
      "Treasury market dysfunction in mid-March (10y bid-ask blowing out, off-the-run/on-the-run premia inverting) was the funding-plumbing tell — the Fed's Mar 23 unlimited-QE pivot was responding to that, not to equity drawdown",
    ],
    decisionPoints: [
      "Feb 24, 2020 (Lombardy outbreak visibly accelerating, S&P -3.4%): the 'isolated epidemic vs global regime change' read",
      "Mar 3, 2020 (Fed surprise 50bps inter-meeting cut, equities sold the news): the 'Fed has it' vs 'Fed is behind' read",
      "Mar 12-15, 2020 (Treasury market dysfunction, Fed cuts 100bps + announces QE): the 'plumbing-fix vs growth-fix' read",
      "Mar 23, 2020 (Fed announces unlimited QE + Main Street facilities, equities bottom): the day that distinguished 'this is the bottom' from 'this is dead-cat bounce'",
    ],
    dominantBias:
      "SARS-shaped historical anchoring — analysts mapped COVID onto the 2003 SARS template (regional, Q-shaped recovery, modest market impact) without updating for the global-supply-chain integration and the more aggressive containment policies of 2020 vs 2003. The base-rate update from 'epidemics resolve' to 'lockdowns crater demand' didn't happen until late February.",
    whatGoodAnalystsDid:
      "Tracked Italian/Iranian case curves daily from Feb 20, watched the cross-currency basis swap widening as the funding-stress proxy, sized for a non-V-shaped recovery. Long duration + USD + gold from late February, covered shorts at the Mar 23 unlimited-QE announcement, rotated long quality equity into the Mar 24 rally. The trade that broke: long oil into the OPEC+ break.",
  },
};
