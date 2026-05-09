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

  "1987-black-monday": {
    priorBeliefs:
      "Equity markets through summer 1987 were celebrating disinflation, falling rates from 1984's peak, and a record-breaking bull market. Most strategists framed October 1987's rate creep as a healthy cyclical adjustment; the prevailing concern was 'how high can the market go' not 'how low can it fall.'",
    marginalDataPoints: [
      "10y UST yield had crept from 7.0% in January 1987 to 10.2% by mid-October — the duration repricing that nobody on the equity desk had reconciled",
      "USD had been weakening through 1987 after the Plaza Accord (Sep 1985) and the Louvre Accord (Feb 1987) — Treasury Secretary Baker's Oct 14 'will not defend dollar' comment was the proximate trigger most analysts later credited",
      "Portfolio insurance was on ~$60bn of equity exposure by mid-October, mechanically programmed to sell into weakness — this dynamic was visible to anyone reading the systematic-trading literature but ignored by fundamental analysts",
      "S&P futures basis had been trading at -50bps to -100bps premium-collapse for two weeks before Oct 19 — the cash-futures arb desks knew something was breaking",
      "Volume on the Friday Oct 16 sell-off was a record at the time; the price-volume divergence was a clean tell of forced selling",
    ],
    decisionPoints: [
      "Wed Oct 14, 1987 (Baker's dollar comment): the analyst had to read this as either 'one more soft dollar comment' or 'the dollar trade is unwinding into the equity-rates fragility'",
      "Fri Oct 16, 1987 close (-5% S&P, record volume): the Friday-night decision — cover into the weekend or hold through to test Monday",
      "Mon Oct 19, 1987 09:30 ET open (-10% gap before lunch, -22.6% close): the intraday choice between 'this is the bottom, buy the close' (right by Oct 21) and 'we're in a 1929 cascade' (wrong)",
    ],
    dominantBias:
      "Mechanism-blindness — fundamental analysts didn't model portfolio insurance's stop-loss feedback loop or the cash-futures arbitrage breakdown. The 'fundamental story' was unchanged through Oct 19; the cascade was structural.",
    whatGoodAnalystsDid:
      "Watched the futures basis as the funding-stress proxy, sized for a forced-selling cascade rather than a fundamental selloff. Bought the Tuesday Oct 20 lows (Greenspan-pivot day) and held through to year-end. The trade that broke: shorts who held past Tuesday's open got steamrolled by the Fed's emergency-liquidity response.",
  },

  "1992-black-wednesday": {
    priorBeliefs:
      "Sterling's ERM band defence was viewed as politically and reputationally non-negotiable through summer 1992. The Conservative government had staked its credibility on staying in the ERM since October 1990; markets were pricing a 90%+ probability of band hold even as German Bundesbank held rates at 9.75%.",
    marginalDataPoints: [
      "Cable was trading 1bp above the ERM floor for most of August-September 1992 — the central bank intervention was visible in the spot tape, not concealed",
      "UK forex reserves had drawn down £15bn in August alone — the Treasury's defensive-FX-purchase capacity was visibly running out",
      "Italian lira had broken its band Sep 13, 1992 — the cleanest leading indicator of ERM stress on a higher-credibility currency",
      "Soros' Quantum Fund's $10bn short position was an open secret in London FX markets by mid-September; the 'whales are positioned' tell was on the tape",
      "UK bank rate was raised from 10% to 12% to 15% in a single Sep 16 morning — the panic-defence sequence revealed how thin the policy was beneath the rhetoric",
    ],
    decisionPoints: [
      "Sep 13, 1992 (Italian lira floats): the analyst had to read this as 'isolated EU-periphery problem' or 'the binding-rail-on-EMS itself is failing'",
      "Sep 16, 1992 morning (BoE 10%→12% intervention rate hike): the 'will-they-or-won't-they-defend' became 'they're losing.' Trade window was 6-8 hours",
      "Sep 16, 1992 19:00 GMT (Lamont announces ERM exit): the post-exit positioning — covered shorts at the panic-low or held for the trend that followed",
    ],
    dominantBias:
      "Policy-credibility bias — analysts assumed sterling defence would be sustained because the political cost of failure was framed as catastrophic. The argument 'they cannot afford to fail' obscured the operational truth that they were running out of reserves to defend with.",
    whatGoodAnalystsDid:
      "Tracked UK FX reserves drawdown as the binding constraint, ignored political rhetoric about commitment to the band. Sized short-sterling positions through August-September; took profits on the Sep 16 evening exit announcement; rotated into long DM-vs-USD on the post-ERM relief rally. The trade that broke: long-only sterling-bond books that didn't size for the 200bp+ inflation pass-through that the float created.",
  },

  "2013-taper-tantrum": {
    priorBeliefs:
      "Through Q1 2013 the consensus was 'low rates forever, EM carry intact, USD weakish.' Bernanke's January 2013 testimony reaffirmed open-ended QE. Sell-side strategists were broadly pricing 10y UST at 1.6-2.0% through 2013 with a bias toward the lower end.",
    marginalDataPoints: [
      "Atlanta Fed's labor-market conditions index had inflected from accelerating to decelerating in early 2013 — but the headline NFP prints stayed firm, masking the change",
      "USD had bottomed in February 2013; the dollar leading the rates trade by ~3 months was the cleanest cross-asset signal",
      "Implied breakeven inflation 5y5y forward had compressed below 2.5% through April; Fed-watchers calling 'tapering doesn't make sense yet' were anchored on this",
      "EM bond fund flows had remained net-positive through May despite tightening spreads; the 'crowded trade' signal was the FoF sponsorship data, not the price",
      "Bernanke May 22 testimony Q&A specifically used 'next few meetings' for taper timing — that phrasing was the leading indicator most analysts dismissed as boilerplate",
    ],
    decisionPoints: [
      "May 22, 2013 (Bernanke testimony Q&A): the 'business as usual' read vs the 'they are going to taper' read. Window was ~30 minutes between the prepared remarks and the Q&A specifying timing",
      "Jun 19, 2013 (FOMC + Bernanke press conference confirming taper baseline): the second confirmation; positioning desks who hadn't covered shorts on EM-FX from May 22 had a second window",
      "Sep 18, 2013 (FOMC delays taper): the contrarian decision point — most desks faded EM bonds further; the actual move was the policy delay, not a continued tightening",
    ],
    dominantBias:
      "Forward-guidance literalism — analysts treated each Fed communication in isolation rather than as one data point in an evolving policy reaction function. The 'open-ended QE' frame from Sep 2012 dominated until well after the Q&A specifying timing.",
    whatGoodAnalystsDid:
      "Tracked USD as the leading indicator, sized for EM-FX dispersion (long INR / short ZAR + TRY) rather than betting on direction of the carry trade in aggregate. Positioned for steeper UST curve via 5s30s flatteners reversing — the curve-trade was the cleaner expression than outright duration. The trade that broke: long EM local-currency carry that didn't hedge the FX leg.",
  },

  "2018-volmageddon": {
    priorBeliefs:
      "Through January 2018, the dominant narrative was 'goldilocks' — coordinated global growth, contained inflation, low and falling vol. Short-vol structures (XIV ETN, SVXY ETF, plus a long tail of short-vol-as-yield retail products) had ~$3bn AUM. 'Vol-of-vol' was framed as 'too high relative to realized'.",
    marginalDataPoints: [
      "VIX had been below 12 for 76 of 80 trading days through Jan 26, 2018 — the longest such streak in the index's history. Compressed-vol regimes are mean-reverting; the question is timing, not direction",
      "1y rates had moved from 1.5% to 2.0% over December 2017 — the duration-funding-of-equity-multiples math was repricing in real time",
      "UST 10y broke 2.85% on Jan 30, 2018 (highest since 2014); the 'rates can't break out without breaking equities' conditional was being tested",
      "Friday Feb 2 NFP wage growth (+2.9% YoY, highest since 2009) was the tell that the wage-vs-inflation regime had inflected — the post-2009 'high employment without wage growth' anomaly was ending",
      "VIX futures basis had inverted (front month > 2nd month) by Feb 2 close — the structural feature short-vol products depend on (positive carry from contango) had broken before the equity move started",
    ],
    decisionPoints: [
      "Fri Feb 2, 2018 close (NFP wage print, S&P -2.1%, VIX 17.3): the 'normal correction' vs 'short-vol cascade brewing' read. Window was the weekend",
      "Mon Feb 5, 2018 14:00 ET (S&P drops 4% in 90 minutes, XIV publishing intraday NAV crashing): the 'cover the short-vol or sit through it' decision; XIV's terminating 80% drop happened in the 15:30-16:00 window",
      "Tue Feb 6, 2018 morning (XIV announces termination, SVXY rebalancing): the post-event position-cleanup — covering shorts at the panic-low vs holding through the bounce",
    ],
    dominantBias:
      "Stationarity bias — short-vol products had compounded for 2+ years through low-vol regimes, and the '12 VIX is the new normal' frame made the structural fragility (negative-convexity in the rebalancing math) invisible. The reflex was 'vol always mean-reverts' which is true on average but fatal in the 1-day move that triggers product unwind.",
    whatGoodAnalystsDid:
      "Monitored the VIX futures basis as the leading indicator (when contango broke, short-vol products were no longer a positive-carry trade). Sized for a short-vol unwind in late January 2018; bought VXX puts as cheap optionality; covered Feb 6 morning at the panic low. The trade that broke: doubling down on short-vol after Feb 2 because 'vol always mean-reverts' — the products terminated before the mean-reversion arrived.",
  },

  "2022-uk-gilt-crisis": {
    priorBeliefs:
      "Through summer 2022 UK pension LDI books were viewed as low-risk, well-collateralised positions. Truss's September 23 mini-budget was framed by sell-side as 'growth-positive but funding-questionable'; consensus expected a 30-50bp gilt sell-off. The structural-leverage feedback loop was visible only to specialised LDI desks.",
    marginalDataPoints: [
      "30y gilt yields had moved 50bps in 2 days post-mini-budget (Sep 23-26, 2022) before any pension-fund forced-selling — the move had two legs: fiscal credibility, then the liability-driven feedback",
      "GBP had broken below 1.05 vs USD on Sep 26 morning (intraday low ~1.0350) — the FX market was pricing a credibility crisis the gilt market hadn't fully reflected",
      "DMO's Sep 26 announcement that auction sizes would NOT be cut despite the funding gap was the cleanest signal that the forward supply imbalance was binding",
      "Pension industry leverage estimate: ~£1.5tn LDI book against £200bn collateral capacity; the math of 'how many bps before margin calls cascade' was readable in early reports",
      "BoE's 'will not buy gilts' position from Sep 23-27 was the policy stance; reversal on Sep 28 was the inflection — the pre-emptive decision was whether to position for the BoE blink",
    ],
    decisionPoints: [
      "Fri Sep 23, 2022 11:00 BST (Kwarteng mini-budget speech): the 'fiscal expansion is growth-positive' read vs 'this is unfunded and gilt market will gag'",
      "Mon Sep 26, 2022 morning (GBP cross-rate sub-1.05): the cross-asset confirmation — when FX, gilts, and equity all moved together, the 'is this contained' question was answered",
      "Wed Sep 28, 2022 11:00 BST (BoE intervention announcement): the 'authorities will fix this' confirmation; positioning desks who covered shorts AT the announcement made the trade",
    ],
    dominantBias:
      "Plumbing-blindness — the fundamental analysts didn't model LDI's mechanical interaction with collateral calls. The 'fiscal credibility' frame dominated headlines; the structural-leverage feedback loop was an LDI-desk specialism that took 4 days to become visible to broader markets.",
    whatGoodAnalystsDid:
      "Watched the 30y gilt yield + GBP cross simultaneously rather than either in isolation. Identified Sep 26 morning that the LDI feedback loop was breaching collateral capacity — sized for forced selling. Took profits on short gilts AT the BoE intervention rather than chasing the post-intervention rally. The trade that broke: long-only gilt funds that didn't reduce duration before the auction-size confirmation Sep 26.",
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
