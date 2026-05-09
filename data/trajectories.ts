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

  "1973-opec-embargo": {
    priorBeliefs:
      "Going into October 1973, the consensus among Western economists was that Arab oil producers would not risk a politically motivated supply cut because the resulting revenue loss would be self-defeating, and that any disruption would be brief — modeled on the 1967 Six-Day-War embargo, which had collapsed within months as producers competed for market share.",
    marginalDataPoints: [
      "Saudi oil minister Yamani had publicly threatened 'oil as a weapon' in April-May 1973 speeches; Western media treated this as rhetorical posturing, not policy preview",
      "OPEC's Sep 1973 Tehran-Tripoli pricing demands (a >70% increase to ~$5/bbl) were unprecedented in scale and signaled a producer-cartel cohesion that hadn't existed in 1967",
      "US oil imports had crossed 35% of consumption by 1973, up from <20% in 1970 — the elasticity of an embargo had structurally changed but most policy memos still cited 1967-era ratios",
      "S&P had already started rolling over from its January 1973 peak through summer; the bear market was about to become a stagflation crisis but consensus framed it as a normal cyclical pullback",
    ],
    decisionPoints: [
      "Oct 6, 1973 (Yom Kippur war begins): analysts had to decide whether to model the war as a regional military event or as the trigger for an OPEC supply response with Saudi Arabia at the wheel",
      "Oct 17, 1973 (OPEC announces 5% monthly production cuts + selective embargo on US/Netherlands): the price-shock-vs-supply-shock distinction — was this a one-off price reset or the start of a sustained constraint?",
      "Dec 23, 1973 (OPEC quadruples posted prices to $11.65/bbl): the 'this resolves quickly' frame became untenable; analysts who had positioned for transient now had to choose between catching up at higher prices or persisting in the wrong frame",
    ],
    dominantBias:
      "Recency bias on 1967 — the prior embargo had failed to dent prices, so a substantial part of the analyst community modeled producer behavior on the prior episode and ignored that the cartel composition, market share, and Western import-dependence had all shifted materially in the intervening six years.",
    whatGoodAnalystsDid:
      "Tracked tanker-shipping rates and Aramco production allocations directly rather than relying on OPEC press communiqués, recognized that producer cohesion this time was held together by a political objective rather than a price target, lengthened oil-equity exposure and shortened duration on long-dated USTs into late October. The analytical frame that worked: treat this as a regime-change in the energy-trade structure, not a temporary price event.",
  },

  "1994-greenspan-hike": {
    priorBeliefs:
      "Going into Feb 4, 1994 the consensus assumed the Fed would telegraph the start of a tightening cycle the way Greenspan had built credibility for in prior moves — a small, well-flagged 25bp move with extensive forward guidance. Long-bond positioning was crowded; the carry trade in EM was extended; the perception was 'the Fed will not surprise.'",
    marginalDataPoints: [
      "ECI (Employment Cost Index) had ticked up to its highest reading since 1991 in the Q4 1993 release — a clean wage-pressure signal Greenspan was known to weight heavily",
      "Long-bond futures positioning per CFTC data was at multi-year extreme nets; mortgage convexity hedging risk was sitting in primary-dealer balance sheets",
      "The Mexican peso had begun trading rich to its band in Q4 1993 as US investors stretched for yield — a tell that EM carry dependence on US rates was structurally elevated",
      "Greenspan's late-Jan 1994 Joint Economic Committee testimony deliberately introduced 'we may need to move pre-emptively' language; bond markets read this as conditional rather than as a starting gun",
    ],
    decisionPoints: [
      "Feb 4, 1994 (Fed hikes 25bp without prior signaling — the 'no telegraph' bit was the surprise): the analyst had to decide whether this was a cycle of telegraphed quarter-point moves or a regime change in how the Fed would communicate",
      "Mar 22 + Apr 18, 1994 (back-to-back hikes accelerating into 50bp moves): the duration-positioning unwind became forced selling; the question was whether to fade the move or run with it",
      "Aug 16, 1994 (Fed hikes 50bp, total cycle so far 175bp): the cumulative damage to fixed-income strategies became the primary market story; orthotgonal carry trades (EM, MBS) were exposed as the same trade",
    ],
    dominantBias:
      "Anchoring on the prior cycle's communication style — the assumption that Greenspan would stay maximally telegraphed because that's how he had built credibility, missing that pre-emption against inflation expectations sometimes requires NOT signaling. Compounded by carry-trade-as-uncorrelated-strategies bias: investors held US bonds, MBS, and EM debt as separate positions when in rate-shock terms they were the same trade.",
    whatGoodAnalystsDid:
      "Watched the convexity-hedging flow signals (mortgage-derivative price action gave a pre-print of the rates path), respected the ECI as a reasoned-from-Greenspan-priors gauge rather than a noisy lagging indicator, treated long-duration positioning extremes as a vol input not just a sentiment input. Cut duration in January, took off EM carry exposure mid-February, used the Apr-Aug window to lengthen duration into peak panic.",
  },

  "2000-dotcom-peak": {
    priorBeliefs:
      "Through Q1 2000 the operating consensus among growth-equity strategists was that internet-era productivity gains had structurally raised the equilibrium P/E of the market and that the Nasdaq's run-up was an early-cycle re-rating to a new normal. 'Click-through rates as the new earnings' framing was published in respected sell-side notes; the FOMO from missed exposure in 1998-1999 was driving allocator behavior.",
    marginalDataPoints: [
      "Insider selling at internet-era IPOs had hit record post-lockup velocity in Q1 2000 — a clean signal that those closest to the businesses didn't share the public-market thesis",
      "Capex-to-revenue ratios at the high-flying optical-networking and telecom-equipment names were diverging from earnings — a leading indicator of the over-build that would later define 2001-2002",
      "Y2K-driven IT-spending pull-forward had peaked Q4 1999 — a sustained IT-revenue tailwind for 1998-1999 was structurally about to roll off, but most models assumed it would persist",
      "March 2000 saw the Nasdaq trade on >100% turnover in the megacap names; the dispersion between megacap and broad equal-weight equity began widening as the rally narrowed",
      "Cisco's Q4 1999 earnings call had introduced 'lengthening lead times' phrasing — buyer behavior had inverted but the stock continued making highs through March",
    ],
    decisionPoints: [
      "Mar 10, 2000 (Nasdaq peaks at 5,048): the date the chart printed the high; analysts had to decide on subsequent days whether the pullback was healthy consolidation or regime change",
      "Apr 14, 2000 (Nasdaq -10% one-day session, biggest down day in years): the 'this is a buyable dip' vs 'this is the start of the unwind' read",
      "Q3 2000 earnings season (multiple sequential warnings from optical/networking names — Lucent, JDSU, Cisco): the moment when the structural over-build became visible in P&Ls — analysts who had held through April for a bounce now had to rebase",
      "Dec 2000 (Greenspan acknowledges 'softening' in Senate testimony): the Fed pivot signal, which arrived too late for most positioning",
    ],
    dominantBias:
      "Productivity-paradigm-shift bias — the assumption that a structural change in technology adoption permanently re-rated equity valuations, suspending the historical mean-reversion in P/E. Compounded by the FOMO of 1998-1999 underexposure, which made allocators reluctant to take risk off even as marginal data turned. The behavioral heuristic 'this time is different' was named and dismissed in research notes — and then acted upon anyway.",
    whatGoodAnalystsDid:
      "Tracked insider selling and S-3 filings as a leading indicator, watched capex-to-revenue at infrastructure suppliers as the leading indicator of demand reversal, recognized Q4 1999 as the peak of the Y2K-spending tailwind. Trimmed Nasdaq exposure into the March-April 2000 distribution, paired short legs in optical/networking names with long megacap quality, lengthened duration into late 2000 as the disinflationary regime change became apparent. The trade that broke even amongst the careful: the equal-weight long that worked in 2000-2001 lost its edge in 2002 once the deflation scare took hold.",
  },

  "2016-brexit": {
    priorBeliefs:
      "Going into June 23, 2016, the consensus among UK markets, betting markets, and the major UK newspaper polls in the final 72 hours was that Remain would win by a 4-7 point margin. The Sterling rallied through the week of the referendum on tightening Remain odds; equity-market positioning was net-long; option-implied vol on GBP/USD reflected the betting-market skew not the polling skew.",
    marginalDataPoints: [
      "Regional-turnout indicators in early-counted Northeast England constituencies (Sunderland, in particular, had been a public bellwether) were running well above 2015 GE levels — a Leave-favorable signal that hit the wires around 11:30pm BST",
      "GBP/USD risk-reversal skew had widened steadily through May 2016 — even as spot rallied, options markets were paying up for downside protection; this was visible in Bloomberg vol-surface data and largely ignored",
      "YouGov's late-night re-poll on June 23 (released after polls closed) suggested Remain at only 52%; this was a deviation from the day-of consensus and arrived too late for most positioning adjustments",
      "Postal-vote samples leaked through bookmakers' liquidity around 8pm BST showed a tighter race than betting odds reflected — bookmaker order flow had begun adjusting before screen-traded markets did",
      "BoE governor Carney had pre-positioned a £250bn liquidity facility in mid-June — a clean 'we expect this could break' signal that risk markets discounted",
    ],
    decisionPoints: [
      "Approx 12:30am BST June 24, 2016 (Sunderland declares Leave 61%, well above modeled): the moment the result-tape diverged from the consensus prior — analysts running the count had to decide whether to act on early constituencies or wait for the median",
      "Approx 4:00am BST June 24 (Leave declared mathematically inevitable): the 'currency move is overshoot' vs 'currency move is regime change' read; GBP/USD bottomed near 1.32 from a 1.50 close, then re-tested",
      "June 24 NY open (S&P -3.6%, Stoxx 50 -8.6%, GBP rebounding): the question was whether to chase the European-equity downside or fade it; the FTSE 100 (heavy international-revenue exposure) outperformed FTSE 250 (domestic) materially",
    ],
    dominantBias:
      "Betting-market-priors-as-truth bias — analyst books leaned heavily on aggregated betting-market odds, which were themselves dominated by a small number of large concentrated stakes that under-represented the geographic distribution of voter sentiment. Compounded by an availability bias from 2014 Scottish independence and the 2015 UK general election, both of which had fits to the polling-and-betting consensus.",
    whatGoodAnalystsDid:
      "Hedged GBP/USD downside via OTM puts using the risk-reversal skew as the pricing signal (cheap protection given the visible pricing dislocation), used regional-turnout heuristics rather than aggregate poll numbers, sized exposures for a binary outcome rather than a base-case-with-tails model. Held a long FTSE 100 / short FTSE 250 pair into the result. The trade that broke: long European banks, where the UK-domiciled exposure was greater than the headline FTSE classification suggested.",
  },

  "1979-volcker-shock": {
    priorBeliefs:
      "Going into Oct 6, 1979 (the 'Saturday night special'), the consensus framing of the Fed under Volcker was that policy would tighten gradually with continued targeting of the federal funds rate, even as inflation expectations had become unanchored. The 'inflation is transitory' narrative had been discredited by 1979 but the operational shift in monetary policy mechanics was widely under-priced.",
    marginalDataPoints: [
      "Volcker's Aug 1979 confirmation hearings had emphasized 'the integrity of money' as a multi-year theme — operational signal of intent that markets discounted because incremental policy hadn't shifted",
      "M1 growth had drifted above the FOMC's stated upper target through Q3 1979 — the gap between target and outcome was the disciplinary trigger, visible in the weekly H.6 report",
      "Gold had run from $300/oz in mid-1979 to $400+ by early October — a clean inflation-expectations gauge moving on a sustained basis, not a one-off geopolitical jump",
      "Long-bond yields had broken out of the 8.5-9.5% range that had held through summer 1979, into double-digits by early October — duration positioning was crowded short on the wrong side",
    ],
    decisionPoints: [
      "Oct 6, 1979 (Saturday FOMC meeting; announcement of operational shift to non-borrowed reserves targeting + 1pp discount-rate hike): the analyst had to read this as either 'tactical adjustment' or 'regime change in the unit of policy'",
      "Mar 14, 1980 (announcement of credit-controls package): the moment when the disinflationary effort visibly broadened beyond rates into administrative controls — short-term impact was a sharp recession warning",
      "Apr-May 1980 (rates unwound sharply on credit-control-driven slowdown; fed funds collapsed from 17% to 9%): the analyst had to choose between 'the Volcker pivot is here' (wrong) and 'the pivot is tactical, regime is unchanged' (right)",
      "Aug 1980 (Volcker re-tightens to defend the disinflation regime): the re-acceleration of the squeeze, validating the 'tactical, not strategic' interpretation",
    ],
    dominantBias:
      "Smooth-policy-extrapolation bias — analysts modeled rates path as a continuation of the Burns/Miller gradualist style and underweighted the possibility of a discontinuous regime change in policy mechanics. Compounded by recency bias on the 1973-74 recession: analysts who saw the early disinflation pain assumed the Fed would relent quickly, missing that Volcker's commitment was multi-year.",
    whatGoodAnalystsDid:
      "Tracked M1 vs FOMC target as the actionable trigger gauge, watched gold and long-bond yields together as the inflation-expectations cross-check, sized for a multi-year disinflation regime rather than a single-year shock. Shortened duration drastically through Q4 1979, ran short curve flatteners through the Volcker tightening, lengthened duration into the 1981 high-rate peak. The trade that broke: short equities into the 1980 mini-recession — the equity market started discounting the disinflation-success thesis early.",
  },

  "1985-plaza-accord": {
    priorBeliefs:
      "Through summer 1985, the consensus framed the strong dollar as a structural feature of US capital-account dynamics — the policy mix of tight monetary + loose fiscal under Volcker/Reagan was viewed as quasi-permanent. Most strategists saw managed FX intervention as ineffective historically and did not credit a coordinated G5 announcement with the ability to break a multi-year trend.",
    marginalDataPoints: [
      "US trade-deficit prints had widened materially through Q1-Q2 1985 — the political cost of the strong dollar was visibly mounting in Treasury and Commerce Department public statements",
      "Baker had replaced Regan as Treasury Secretary in Feb 1985 — a personnel change that Treasury-watchers correctly read as a shift toward willingness to coordinate FX intervention; markets gave it minimal weight",
      "BoJ governor Sumita's late-summer 1985 speeches had begun referencing 'imbalances' explicitly — a pre-positioning by Japan that signaled willingness to participate in coordinated intervention",
      "USD/DEM had begun rolling over in early September 1985 from its February peak, with rising volume on down-days — a leading indicator the FX market was already pre-positioning for an event",
    ],
    decisionPoints: [
      "Sep 22, 1985 (Plaza Hotel meeting communiqué releases Sunday afternoon): the analyst had to decide on Monday morning whether to chase the announcement-driven move or wait for confirmation",
      "First two weeks of October 1985 (USD continues weakening on coordinated intervention): the 'this is durable' vs 'this is one-off announcement effect' read",
      "Feb 1987 (Louvre Accord attempting to stabilize the now-weakened dollar): the moment of regime exhaustion — the analyst who had ridden the Plaza-driven dollar weakness had to decide whether to pivot back or extend",
    ],
    dominantBias:
      "FX-intervention-doesn't-work bias — analysts anchored on prior failed attempts at coordinated FX management (e.g. failed 1978 dollar defense) and missed that the political coordination at Plaza was qualitatively different (G5 alignment with explicit current-account targets, not a unilateral defense). Compounded by US-policy-mix-as-permanent bias — assuming the Volcker/Reagan combination would persist regardless of political pressure.",
    whatGoodAnalystsDid:
      "Read the Treasury personnel change as the leading policy-shift signal, watched BoJ and Bundesbank communications for participation cues, treated the Plaza announcement as the start of a multi-quarter regime, not an event spike. Shorted USD/DEM and USD/JPY through early October, lengthened duration in DEM and JPY assets, faded the early-1986 USD-stabilization rally. The trade that broke: long Japanese equities through 1986 — the move worked spectacularly but the 1989 peak setup the analyst had to manage exit on was the harder problem.",
  },

  "2012-whatever-it-takes": {
    priorBeliefs:
      "Through July 2012, the consensus on the European sovereign crisis was that the EUR would either fragment or require a full-scale fiscal union, with the ECB's mandate constraining its ability to act as lender of last resort. Spanish and Italian sovereign yields had widened to existential levels (Spanish 10y above 7%, Italian 10y near 6.5%); peripheral-bank deposit flight was visible weekly in TARGET2 imbalances.",
    marginalDataPoints: [
      "TARGET2 imbalances had grown to €1.0tn by mid-2012 — the visible measure of capital flight from periphery to core that most non-ECB-watcher commentary missed",
      "Spanish 10y had crossed 7.5% intraday on July 24, 2012 — the level historically associated with bailout triggers (Greece, Ireland, Portugal had all required bailouts at or above 7%)",
      "ECB's late-July signaling — repeated 'within our mandate' language from Coeuré and Constâncio — was a deliberate pre-positioning for a policy shift, but markets discounted it as routine rhetoric",
      "EUR/USD basis swap pricing (3m EUR/USD basis was at -50bp by late July) showed cross-currency funding stress similar to 2011 but with the policy response window closing",
    ],
    decisionPoints: [
      "Jul 26, 2012 (Draghi's London speech: 'the ECB is ready to do whatever it takes to preserve the euro'): the analyst had to decide whether this was rhetorical commitment or operational pre-announcement of a forthcoming policy tool",
      "Aug 2, 2012 (ECB press conference: Draghi confirms backstop framework taking shape): the second confirmation that the rhetoric was being operationalized",
      "Sep 6, 2012 (OMT — Outright Monetary Transactions — formally announced): the technical operationalization of the speech, conditional on country requests for ESM support",
    ],
    dominantBias:
      "Mandate-constraint bias — analysts anchored on the ECB's narrow inflation-targeting mandate and missed that institutional language ('preservation of the euro') had been deliberately repositioned to allow a much broader policy response. Compounded by 'we've heard this before' fatigue from 2010-2011 EU summits that produced communiqués without operational follow-through.",
    whatGoodAnalystsDid:
      "Read Draghi's speech word-by-word against prior ECB language for shifts in operational mandate framing, tracked TARGET2 imbalances as the leading-indicator gauge of the capital flight pressure forcing the policy response, recognized the political alignment behind the OMT announcement (Merkel's tacit acceptance via Schäuble silence). Bought Spanish and Italian govies in late July, sold periphery-bank CDS protection through August, lengthened EUR-denominated risk into the OMT announcement. The trade that broke: short EUR — the policy-credibility shift turned a fragmenting-currency thesis into a stabilizing-currency outcome over Q4 2012.",
  },

  "2015-china-deval": {
    priorBeliefs:
      "Through summer 2015, consensus on the CNY framework was that the PBOC's 'managed float' would gradually allow a more flexible exchange rate but with extensive jawboning, intervention smoothing, and predictable bands. The Aug 2015 IMF SDR-inclusion timeline was viewed as the political gate that constrained any abrupt CNY move. Capital outflows were visible but framed as 'managed adjustment' rather than 'incipient devaluation pressure'.",
    marginalDataPoints: [
      "PBOC FX reserves had drawn down ~$300bn from June 2014 peak through July 2015 — the visible measure of the cost of defending the band, ignored or framed as 'still ample' by many commentators",
      "CNH-CNY basis had widened to >150 pips by early August 2015 — the offshore-onshore gap was the cleanest signal of pressure on the band that policy could no longer fully sustain",
      "PBOC Q2 2015 monetary-policy report had introduced 'reform of the central-parity mechanism' language — operational pre-positioning for a regime change in how the daily fix was set",
      "Shanghai Composite peak-to-trough (June-Aug 2015) saw a 30% drawdown alongside policy responses (margin-rule changes, IPO suspensions); the equity-market intervention regime had visibly stretched, signaling broader policy-tool fatigue",
    ],
    decisionPoints: [
      "Aug 11, 2015 (PBOC announces 'reform' of daily fix mechanism + 1.9% CNY devaluation in single session): the analyst had to read this as either 'reform-driven one-off adjustment' (PBOC's framing) or 'shift in the policy reaction function' (subsequent reality)",
      "Aug 24, 2015 (S&P -3.9%, the 'Black Monday' US session triggered by China-deval contagion): the moment when the China-policy event was visibly transmitted into a global risk-off; question was whether to fade the panic or trade the new regime",
      "Q3-Q4 2015 (continued reserve drawdown, capital-controls tightening): the persistent pressure on the new band that revealed the Aug 11 move was the start, not the end",
    ],
    dominantBias:
      "Policy-credibility-as-fixed bias — analysts anchored on the PBOC's two-decade record of orderly band management and missed that the operational shift in the parity mechanism was a meaningful change in the policy reaction function. Compounded by SDR-inclusion-as-binding-constraint bias: assuming the IMF political timeline would prevent the PBOC from acting on FX pressures, when in fact the SDR objective was being reframed by the PBOC to require — rather than prevent — a 'market-determined' fix.",
    whatGoodAnalystsDid:
      "Tracked CNH-CNY basis as the cleanest tell of band stress, watched FX-reserve drawdown velocity rather than absolute levels, parsed PBOC monetary-policy-report language for shifts in reaction-function rhetoric. Shorted AUD, KRW, MYR as the EM-Asia FX proxy in early August, lengthened US duration into the August deval-driven flight to safety, faded the late-August equity rebound as the China-policy regime was visibly still in transition. The trade that broke: long China-A-shares post-August intervention — the policy backstop worked tactically but the structural regime had shifted.",
  },

  "2022-russia-ukraine": {
    priorBeliefs:
      "Through Feb 23, 2022, the consensus framing among most market participants — even after US intelligence had publicly warned of imminent invasion — was that Putin's troop buildup was a coercive-bargaining play rather than a precursor to full-scale war. Implied vol on commodities had risen but spot levels showed analysts pricing a partial-Donbas action, not a Kyiv-targeting invasion. Most strategists framed energy commodities as range-bound on the assumption of a quick diplomatic resolution.",
    marginalDataPoints: [
      "Brent had run from $80 in early Feb to ~$95 by Feb 23 on geopolitical premium, but the option-skew structure (rising 25-delta calls relative to puts) was already pricing tail outcomes more aggressively than the spot move suggested",
      "Cross-currency basis (EUR/USD 3m basis went from -8bp to -18bp through mid-February) was widening alongside the conflict-escalation signal — early funding-stress tell",
      "European TTF natural-gas forward curve had inverted (2022 contracts pricing well above 2023-2024 contracts) — a structural signal that the energy-supply-shock risk was being priced into the immediate term",
      "Russian sovereign CDS had blown out from <100bp to 800+bp through February — a clean tell that protection-buying was discounting a base case worse than the headline diplomatic-resolution narrative",
    ],
    decisionPoints: [
      "Feb 24, 2022 (full-scale invasion launches): the analyst had to make a same-session decision about whether to size for a quick-resolution path (Saddam '03 / Russo-Georgian '08 templates) or a multi-quarter sanctions and energy-restructuring path",
      "Feb 26-28, 2022 (Western sanctions package + SWIFT exclusion + CBR reserve freeze): the moment when the sanctions architecture became visible; the analyst had to choose between 'these sanctions will be partial and reversible' and 'this is a multi-year financial-system decoupling'",
      "Mar 8, 2022 (LME nickel halt + 250% intraday move on short squeeze tied to Russian commodity exposure): the moment when commodity-market plumbing visibly broke — exposed the cross-asset implications of forced-position-unwind dynamics",
      "Apr-May 2022 (sustained Brent above $100, EUR/USD breaking parity-test through summer): the validation that the regime change was multi-quarter, not a quick-resolution event",
    ],
    dominantBias:
      "Coercive-bargaining-precedent bias — analysts anchored on the 2014 Crimea episode (limited military action, sanctions, eventual market normalization within months) and missed that the 2022 buildup-scale, doctrine-shift, and Western-response coherence pointed to a structurally different scenario. Compounded by intelligence-discount bias: US public warnings were unprecedented in specificity but were discounted as performative diplomacy.",
    whatGoodAnalystsDid:
      "Read the option-skew structure across commodities and EUR-funding markets as a leading indicator of the tail-pricing discrepancy, treated the US public-intelligence releases as actionable, sized commodity exposure for a multi-quarter dislocation rather than an event-spike. Long energy and metals from mid-February, long USD vs EUR from late February, lengthened duration in DM safe-havens (US, German bunds) into the initial flight-to-quality. The trade that broke: long Russia-exposed European banks on the 'sanctions will be partial' thesis — the SWIFT exclusion + CBR freeze was a discontinuous regime change those models hadn't priced.",
  },

  "2023-svb-collapse": {
    priorBeliefs:
      "Through early March 2023, the consensus framing of US regional banks was 'post-Dodd-Frank de-risked, profitability under pressure from inverted curve, but solvency unimpaired.' SVB specifically was viewed as a high-quality franchise with concentrated tech-startup deposit exposure but a strong asset book. Most credit analysts ranked SVB in the top quartile of regional-bank credit quality entering 2023.",
    marginalDataPoints: [
      "SVB's Q4 2022 10-K had disclosed unrealized AFS losses of $15bn against tangible common equity of ~$11bn — the duration mismatch was visible in plain English on page 38, but rarely cited in sell-side coverage",
      "SVB's HTM-to-deposit ratio had grown from <30% to >55% over 2021-2022 as the bank invested deposit growth into long-duration USTs; HTM losses don't hit equity but do bind capital in a deposit-run scenario",
      "Tech-startup deposit outflows at SVB were already running negative throughout Q4 2022 as VC funding rounds slowed — a leading indicator that the franchise's funding base was structurally eroding",
      "Twitter mentions of 'bank run' on Mar 8 2023 (when SVB announced the $1.75bn capital raise after selling $21bn of AFS at a $1.8bn loss) saw exponential growth into Mar 9 close — the 'run velocity' was unprecedented because deposit transfers had become app-driven and group-coordinated",
      "Pacific Western, Western Alliance, First Republic equity moves on Mar 9 were highly correlated with SVB's — a clean tell that the market was pricing this as a sector-funding event, not an idiosyncratic credit event",
    ],
    decisionPoints: [
      "Mar 8, 2023 evening (SVB capital raise announcement): the analyst had to decide whether this was a routine capital-management event or a forced-seller-of-AFS signal that revealed a deeper duration-mismatch crisis",
      "Mar 9, 2023 (SVB equity -60%, peer regionals -10 to -15%, depositor outflows accelerating): the 'this is contained to SVB' vs 'this is sector funding regime change' read",
      "Mar 12, 2023 evening (Treasury/Fed/FDIC announce BTFP + uninsured-deposit guarantee): the moment the systemic-deposit-run risk was capped — but only for participants reading the announcement quickly enough to reposition before Mar 13 open",
      "Mar 19, 2023 (UBS-Credit Suisse forced merger announced): the 'is this US-regional contagion or has it gone global' read; the answer turned on whether you believed CS issues were idiosyncratic or symptomatic",
    ],
    dominantBias:
      "Post-DFA-de-risking bias — the assumption that regulatory reforms after 2008 had structurally eliminated the run-prone bank business model, missing that the reforms targeted SIFIs while leaving regional-bank depositor concentration and HTM accounting effectively unchanged. Compounded by velocity-of-information bias — most run-modeling assumed branch-driven withdrawal speeds, not coordinated app-driven transfers in tech-concentrated deposit bases.",
    whatGoodAnalystsDid:
      "Read the 10-K AFS/HTM unrealized-loss disclosures as the leading credit indicator (not the headline capital ratios), tracked deposit-outflow velocity in the FFIEC call reports rather than waiting for the next quarterly reporting cycle, recognized the deposit-base concentration in tech as a structural vulnerability rather than a quality marker. Shorted regional-bank index proxies after the Mar 8 capital-raise announcement, covered into the Mar 13 BTFP backstop, repositioned long quality-megabank into the deposit-flight-to-safety trade. The trade that broke even amongst the careful: short long-dated USTs into the Mar 9-10 panic — that move went the other way as the safe-haven bid swamped the issuance-supply concern.",
  },
};
