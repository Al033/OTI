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

  "1990-iraq-kuwait": {
    priorBeliefs:
      "Going into Aug 2, 1990, the consensus framing of Saddam's troop buildup along the Kuwaiti border was as a coercive-bargaining play to settle disputes over OPEC quota cheating + Rumaila oilfield slant-drilling. Most regional-affairs experts and oil strategists assumed a partial border incursion at most; very few priced full-scale annexation. Equity markets treated the geopolitical premium as transient.",
    marginalDataPoints: [
      "Iraqi troop deployments along the Kuwaiti border had reached >100,000 by late July 1990 — well above what a coercive-bargaining display would require, but framed by most desk analysts as 'maximalist negotiating posture'",
      "Brent had risen from $16/bbl in early July to ~$21 by Aug 1 on the buildup; option-implied vol had risen but spot pricing reflected the consensus 'limited action' base case",
      "Saddam's late-July 1990 meeting with US ambassador April Glaspie included ambiguous US-policy language; this was read as 'US won't object to limited action' by Baghdad and as 'routine diplomatic encounter' in Washington — different priors",
      "The Iraqi Republican Guard mobilization pattern visible in commercial-satellite imagery by late July showed offensive (not defensive) configuration — a tell for analysts willing to trust open-source intelligence over diplomatic readouts",
    ],
    decisionPoints: [
      "Aug 2, 1990 (Iraqi forces enter Kuwait, full annexation announced): the analyst had to read this as either 'border-skirmish-with-quick-resolution' or 'sustained occupation requiring military response'",
      "Aug 6-7, 1990 (UN sanctions vote + Operation Desert Shield US deployment to Saudi): the moment when the Western military response became visible — the question shifted to 'how long until US forces are positioned to act?'",
      "Jan 17, 1991 (Operation Desert Storm coalition airstrikes begin): the day the conflict transitioned from sanctions-and-buildup to active combat — equities BOTTOMED on the strike news, the canonical 'tail-risk premium peaks before the conflict' setup",
      "Late Feb 1991 (ground campaign + 100-hour war): the speed of the resolution validated the equity rally; oil collapsed back to pre-invasion levels by March-April",
    ],
    dominantBias:
      "Coercive-bargaining-precedent bias — analysts anchored on prior border-skirmish episodes (Iran-Iraq border friction, intra-Arab disputes) and missed that Saddam was operating under a 'reunification' framing for Kuwait that pointed to occupation rather than negotiation. Compounded by Western intelligence's well-documented late-July 1990 internal disagreement that wasn't visible to outside analysts; many missed the high-confidence offensive read.",
    whatGoodAnalystsDid:
      "Watched commercial-satellite mobilization data and Republican Guard configuration as the leading-indicator gauge over diplomatic communiqués, treated the late-July build-up scale as evidence of an offensive intent regardless of bargaining theatrics, recognized the canonical 'buy when the bombs drop' template once US military deployment was committed. Long oil + USD into early August, took risk off equities through August-October, sized for a buyable equity bottom around the Jan 17 strike date. The trade that broke: long oil through Q1 1991 — the demand-destruction component of the conflict was underweighted in pure-supply-shock models, oil collapsed back to pre-invasion levels much faster than expected.",
  },

  "1997-thai-baht": {
    priorBeliefs:
      "Through early summer 1997 the consensus framing of the Thai baht peg was that the Bank of Thailand would defend the band as it had done through 1996, supported by what were publicly disclosed as ample reserves. Asian growth was framed as the 'tiger model' — high-savings, export-led, structurally sound — and most strategists ranked Thailand in the second-tier of vulnerability behind weaker EMs.",
    marginalDataPoints: [
      "BoT reserve drawdown through April-June 1997 was visible to anyone reading the weekly central-bank data — the 'ample reserves' headline number masked that net forwards (the off-balance-sheet hedge book) had committed most of those reserves already",
      "Bangkok Bank of Commerce had been quietly resolved in early 1997 with what was described as a 'one-off rescue'; the loan-portfolio-quality issue across Thai banks was visible in the BIS quarterly data for those tracking it",
      "Thai property prices in Bangkok had peaked Q4 1996 and were rolling over visibly through Q1-Q2 1997; the property-developer sector's USD-denominated debt service was the leading pressure point on bank balance sheets",
      "1m baht NDF (non-deliverable forward) rates traded persistently below spot through May-June — the offshore-onshore market gap was the cleanest signal that pressure on the band was building beyond what onshore quotations admitted",
    ],
    decisionPoints: [
      "Jul 2, 1997 (BoT abandons the peg, baht floats): the analyst had to read this as either 'an isolated small-EM event' or 'the first domino in regional Asian-currency-board breakdown'",
      "Jul-Aug 1997 (Philippines, Malaysia, Indonesia all face escalating pressure on their pegs): the contagion-pattern question — was this 1994 Tequila redux (regional, contained) or something structurally different?",
      "Oct 23-27, 1997 (HK $ peg defended via aggressive rate hike, HSI -23% in five sessions; 'Asian flu' enters the global equity vocabulary): the moment when the regional EM event became a developed-market vol event",
      "Aug 14, 1998 onward (Russian crisis follows the same playbook on a different currency board): the analyst had to recognize that this was a multi-step contagion where the 'isolated EM' narrative had been wrong all year",
    ],
    dominantBias:
      "Tiger-model-as-structurally-sound bias — Asian growth was framed by sell-side consensus as exceptional and largely de-coupled from EM-vulnerability indicators. Compounded by reserves-headline bias: announced reserves were treated as defensive ammunition without netting out off-balance-sheet forward commitments, which in BoT's case had pre-committed much of the war chest.",
    whatGoodAnalystsDid:
      "Watched NDF/onshore basis as the cleanest pressure gauge, netted reserves against forward commitments rather than reading the headline figure, tracked Thai property-developer USD debt service as the bank-stress trigger, recognized that the regional currency-board architecture meant contagion was a connectivity question not a fundamentals question. Shorted ASEAN currencies through summer 1997, lengthened USD exposure into the contagion path, faded the early Q4 'this is contained' rallies. The trade that broke: long Hong Kong equities post-October — the rate-hike defense of the peg held but at a real-economic cost that played out through 1998.",
  },

  "2001-911": {
    priorBeliefs:
      "Going into Sep 11, 2001, consensus framed the US economy as already in a mild recession (the Mar 2001 recession start had been recognized late) but with policy room: the Fed had been easing aggressively (50bps cuts had been the standard increment), and most strategists expected the bottom in equities to coincide with the Q4 earnings clearing. The geopolitical-tail-risk premium in equities was minimal; war-on-terror was not in any base-case scenario.",
    marginalDataPoints: [
      "Tech-sector earnings warnings had accelerated through Q3 2001 (Cisco's 'lengthening lead times' had become 'inventory adjustment' had become 'demand contraction'); the equity tape was already weakening into early September",
      "Treasury 10y yields had broken below 5% in late August 2001 as the macro-deterioration narrative gathered, but the yield level was still high enough that monetary policy had ammunition",
      "The CBOE put-call ratio had been elevated through August-early September 2001 — equity investors were already buying protection, but mostly for sector-rotation reasons, not for tail-event reasons",
    ],
    decisionPoints: [
      "Sep 11, 2001 morning (attacks unfold; markets close mid-session, NYSE remains shut for 4 trading days): the analyst had to immediately decide between 'this is a tail risk to size for fundamentally' and 'the Fed/Treasury/policy backstop will be unprecedented'",
      "Sep 17, 2001 (NYSE re-opens; Fed had cut 50bps inter-meeting, Treasury had announced extensive backstops): the 're-open day' decision — was the down-move a buyable dislocation or the start of a sustained bear leg?",
      "Oct-Nov 2001 (equity recovery to pre-attack levels by mid-October on the policy-response bet, despite continued US recession): the bottoming pattern that distinguished demand-destruction shocks from credit-cascade shocks",
      "Mar 2002 onward (the 'war on terror' regime + Enron + accounting scandals): the second-leg-down recognition that the recovery was real but the multi-year regime had shifted",
    ],
    dominantBias:
      "Recency bias on demand-destruction shocks — analysts modeled 9/11 as a discrete event with policy-response-driven recovery (template: 1990 Iraq invasion → 1991 ground-war bottom). The base case under-weighted the multi-year geopolitical-regime-shift component (Patriot Act, prolonged military commitment, energy-sector reorientation). Compounded by 'Fed has it' reflex — the historical pattern of equity-bottoming-on-decisive-cut was applied without noting the structural difference between cyclical-easing and tail-event-easing.",
    whatGoodAnalystsDid:
      "Sized for a 5-week round-trip pattern (the canonical sudden-shock-to-Western-economy template), recognized the decisive Fed/Treasury response as a policy-credibility signal, watched the demand-destruction component in oil specifically (collapsed alongside equities despite the geopolitical premium most expected to hold). Long quality-megacap into the Sep 17 re-open, covered on the November rally, repositioned long USTs and short USD through Q4 2001. The trade that broke: long airlines + insurers — sector-specific structural damage was deeper than the generalized equity-rebound thesis allowed for.",
  },

  "2010-flash-crash": {
    priorBeliefs:
      "Through May 6, 2010 the consensus framing of US equity-market microstructure post-Reg-NMS (2007) was that fragmentation across exchanges + high-frequency-market-making had produced tighter spreads + deeper liquidity. The May 2010 macro backdrop was Greek-debt-crisis-driven risk-off, but US trading systems were viewed as resilient. Microstructure risk wasn't in most macro-strategists' models.",
    marginalDataPoints: [
      "Greek 2y yields had spiked through 10% by early May 2010; the eurozone-fragmentation tail was visibly being priced into peripheral spreads",
      "Equity-market depth (top-of-book liquidity provision per ECN) had been declining through Q1 2010 as proprietary HFT firms scaled back during EU-stress days — visible in NYSE OHLC depth data",
      "VIX had risen from ~17 in early April 2010 to >35 by May 6 morning — a meaningful spike that was being absorbed but not fully discounted by liquidity providers",
      "Waddell & Reed's algorithmic E-mini S&P sale on May 6 afternoon used a participate-of-volume algo without a price-band override — visible in CFTC post-mortem data; the size relative to that day's volume was material but not exceptional in itself",
    ],
    decisionPoints: [
      "May 6, 2010 14:42-14:45 ET (the 'flash crash' interval — Dow drops ~9% in minutes on cascading liquidity withdrawal): the live decision was structurally impossible — most participants had no actionable read-and-respond capability faster than the price move",
      "May 6, 2010 14:45-14:55 ET (recovery interval — most stocks re-rate back within ~10 minutes): the post-crash decision was whether to take advantage of canceled-order processes (busted trades), reposition for systemic-risk follow-through, or treat as one-off",
      "May 6 close + May 7 open (broker-dealers, exchanges, regulators absorb the post-mortem; equity markets continue lower over the day on residual systemic concerns): the 'is this a microstructure event or a Greece-leg-down trigger' read",
      "Sep 2010 (CFTC + SEC joint report identifies the Waddell algo + HFT liquidity withdrawal cascade as the proximate cause): the moment when retail + institutional confidence in microstructure stability became reasoned-from rather than assumed",
    ],
    dominantBias:
      "Microstructure-as-stable bias — macro-strategists modeled equity markets as fundamentally-driven price-discovery venues without explicitly accounting for the conditional probability of liquidity withdrawal under stress. Compounded by the 'fragmentation-improves-resilience' bias common in regulatory analysis post-Reg-NMS, which assumed multiple venues would always provide redundant liquidity.",
    whatGoodAnalystsDid:
      "Recognized that VIX > 35 with declining HFT depth was a state-conditional fragility setup, treated the May 6 event as a distinct microstructure-failure category not a macro-event-type, scaled position sizes accordingly when subsequent intraday vol regimes met similar conditions. The post-event corpus contributions: market-stop circuit-breakers across single-name + indexed instruments, the 'limit up / limit down' regime that became standard, the consolidated audit trail. The trade that broke: betting on a sustained microstructure tail post-May 2010 — the regulatory response was decisive and credible enough that the 2010 setup did not recur in the same form.",
  },

  "2024-yen-carry-unwind": {
    priorBeliefs:
      "Through July 2024 the consensus framing of the JPY-funded carry trade was that it would persist through year-end given the BoJ's stated commitment to gradual normalization and the persistence of the US yield advantage. USD/JPY at 161 on Jul 11 was framed as concerning-but-stable; intervention risk was priced in, but at levels that wouldn't break the carry trade. Most allocators ran the JPY-funded long-EM-and-tech basket as a structural position.",
    marginalDataPoints: [
      "MoF intervention on Apr 29 + May 1 2024 had pushed USD/JPY from 160 to 152 then bounced back to 161; the intervention pattern was clearly tactical but the BoJ's tolerance level was visibly above 160 — a tell that intervention was a damping mechanism, not a defense level",
      "JPY 1m vol skew had widened through July 2024 — option markets were pricing tail-yen-strength scenarios more aggressively than spot suggested, visible in vol-surface data",
      "BoJ communication through Q2 2024 had repeatedly used 'data-dependent' language that left open the door for an accelerated normalization; markets discounted the possibility because Ueda's prior moves had been gradual",
      "CFTC speculator JPY net-short positioning had reached multi-decade extremes by mid-July 2024 — a positioning gauge that hardly any model could ignore but most allocators continued running the carry through",
      "Ahead of the Jul 31 BoJ meeting, the US economic data flow had begun rolling over (slower payrolls, weaker ISM); the conditional probability of a Fed pivot + BoJ hike combination was rising mechanically",
    ],
    decisionPoints: [
      "Jul 31, 2024 (BoJ hikes 15bps + announces JGB-purchase taper, with hawkish forward guidance): the analyst had to read this as either 'modest tightening within the gradualism frame' or 'regime change in BoJ reaction function'",
      "Aug 1-2, 2024 (US ISM Manufacturing miss + payrolls miss + Sahm rule triggers): the moment when both legs of the carry broke simultaneously — Japan-side strengthening on policy, US-side weakening on recession data — the convexity scenario",
      "Aug 5, 2024 (Nikkei -12.4%, USD/JPY breaks 142, VIX spikes to 65 intraday): the day the carry-unwind expressed itself as cross-asset vol — the question was whether this was a one-day clearing event or a persistent regime change",
      "Aug 7, 2024 onward (BoJ Uchida's 'won't hike during instability' communication; positioning resets): the moment when the carry-unwind found a floor — those who had survived Aug 5 had to decide between re-establishing the carry (worked tactically) and treating the regime as broken (worked over Q4 2024)",
    ],
    dominantBias:
      "Carry-as-stable-rate-differential bias — analysts modeled the JPY carry as a slow-bleed positive-expected-return strategy without weighting the conditional convexity that emerges when both legs of the carry break simultaneously. Compounded by intervention-as-defense bias: prior MoF interventions were read as a Japanese authorities defending USD/JPY ceilings rather than as a damping mechanism that left structural pressure in place.",
    whatGoodAnalystsDid:
      "Read JPY vol skew + speculator positioning together as the conditional-fragility gauge, recognized that the simultaneous-breakage path (BoJ hike + Fed pivot signal + recession data) was the convexity scenario, sized for a multi-day cascade rather than a single-day spike. Took JPY-funded carry off through mid-July, lengthened JPY exposure ahead of Jul 31, faded the Aug 5 panic to re-establish risk in different asset mixes. The trade that broke: short Nikkei into the panic — the Aug 5 selloff was sharp but the 50-day mean-reversion pattern that followed caught most who chased the move.",
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

  "2011-us-downgrade": {
    priorBeliefs:
      "Going into Aug 5, 2011, the consensus was that S&P would not actually downgrade the United States despite the rhetorical threats during the debt-ceiling brinksmanship. The 'AAA-as-permanent' framing was deeply embedded in fixed-income mandates, sovereign-wealth allocation models, and risk-weighting frameworks; analysts couldn't easily price a counterfactual where USTs lost their AAA status.",
    marginalDataPoints: [
      "S&P had publicly warned in mid-July 2011 that a debt-ceiling resolution short of $4tn in deficit reduction would risk a downgrade — an explicit operational threshold most market participants discounted as posturing",
      "1y UST CDS had widened from ~30bp to ~70bp through July as protection-buying accelerated; the cleanest tell that the AAA-as-permanent assumption was being unwound by sophisticated participants",
      "Eurozone sovereign-spread widening through summer 2011 (Italian-German 10y spread moved from ~220bp to ~370bp) was creating a parallel sovereign-stress event that constrained UST flight-to-quality dynamics; the global supply of 'risk-free' assets was shrinking simultaneously",
      "The Aug 2 debt-ceiling deal delivered ~$2.4tn in deficit reduction — well short of S&P's stated $4tn threshold; the announced outcome had visibly fallen below the rating-agency rubric the day of the deal",
    ],
    decisionPoints: [
      "Aug 5, 2011 (S&P downgrades US to AA+ after market close): the analyst had to read the Monday-open response — was this a 'sell USTs on credit-quality' event or a 'buy USTs because nothing else has gotten safer' event?",
      "Aug 8, 2011 (S&P -6.6%, USTs RALLY despite the downgrade): the market gave its answer — the flight-to-quality bid swamped the credit-quality concern, validating that AAA-as-rating-input was less load-bearing than the consensus expected",
      "Aug 9, 2011 (Fed: rates on hold 'at least through mid-2013' — explicit calendar guidance, the first time): the policy-response signal that compounded the duration rally",
      "Q4 2011 (Italian + Spanish yields cross 7% on Berlusconi resignation timeline; 'Volcker rules' begin implementation): the broader sovereign-stress context within which the US event resolved as a paper-tiger downgrade",
    ],
    dominantBias:
      "AAA-as-load-bearing bias — analysts modeled UST demand as conditional on the AAA rating without weighting the larger structural drivers (depth, liquidity, reserve-currency status, mandate-driven indexed buyers). Compounded by ratings-agency-action-equals-credit-event bias: most participants treated the rating change as a discrete credit event rather than as one input into a much larger demand function.",
    whatGoodAnalystsDid:
      "Read 1y UST CDS widening as the leading-indicator signal, recognized that AAA was operationally one input into a larger reserve-currency demand function (not the binding constraint), tracked the mandate-driven indexed-buyer flows during the Aug 5-8 window. Lengthened UST duration into the Aug 5 announcement, faded the equity panic on Aug 8, sized for a multi-month vol-elevated regime rather than a single-event resolution. The trade that broke: short USDs into the downgrade — the dollar bid was the strongest signal that flight-to-quality dominated credit-quality concerns.",
  },

  "2018-powell-pivot-eve": {
    priorBeliefs:
      "Going into Q4 2018, the consensus was that the Fed under Powell would continue its quarterly hike cadence + balance-sheet runoff path through 2019 'on autopilot.' Powell's Oct 3 'long way from neutral' framing had been read as further hawkish guidance. Equity markets had been rolling over since late September; the question was whether this was a normal mid-cycle correction or the start of something more structural.",
    marginalDataPoints: [
      "HY OAS had widened from ~330bp in early October to >540bp by year-end 2018 — credit was visibly pricing a risk-off regime well ahead of equities catching up",
      "S&P 500 was flirting with -20% from peak by Christmas Eve 2018 — the canonical bear-market threshold that markets were watching for as a coordinated forcing function on policy",
      "Fed Chair Powell's Nov 28 NY Economic Club speech had subtly shifted language: the 'long way from neutral' framing of October became 'just below the broad range of estimates' — a one-sentence repositioning that was visible to anyone parsing speeches against priors",
      "Mnuchin's Dec 23 'I have called the major banks to discuss liquidity' tweet had introduced unprecedented Treasury-side concern about market plumbing; the reverse signal that the administration was pre-positioning for a stress event",
      "Inflation breakevens had been falling persistently through Q4 2018 — the inflation-side justification for continued hikes was visibly weakening, but Fed minutes were still framing 'further gradual increases' as the base case",
    ],
    decisionPoints: [
      "Dec 19, 2018 (FOMC hikes 25bps + minor dot-plot dovish revision but presser maintains autopilot framing on balance sheet): the 'this Fed gets it' vs 'this Fed doesn't get it' read at the policy meeting",
      "Dec 24-26, 2018 (Christmas Eve session sees S&P -2.7%; Boxing Day session reverses to +5%): the moment the equity tape itself created the political pressure that would force the policy pivot",
      "Jan 4, 2019 (Powell sits with Yellen + Bernanke at AEA panel — phrase: 'We will be patient'): the explicit pivot moment, communicated through the most credible possible setting",
      "Jan 30, 2019 (FOMC removes 'further gradual increases' language; Powell presser confirms 'patient'): the formal policy-statement embodiment of the verbal pivot — the 'autopilot' framing was now retired",
    ],
    dominantBias:
      "Fed-as-rule-bound-actor bias — analysts modeled the Fed's reaction function as having a fixed weighting on growth + inflation gauges and underweighted the political-economy feedback loop where market stress itself becomes an input. Compounded by autopilot-framing-as-commitment bias: the explicit balance-sheet runoff narrative was treated as binding when it was always a parameter, not a constraint.",
    whatGoodAnalystsDid:
      "Watched HY OAS as the leading-indicator gauge, parsed the Nov 28 speech word-by-word for guidance shift, treated the AEA Jan 4 setting as a deliberate signaling venue. Took risk off into the Dec 19 hike, lengthened duration into the Christmas Eve panic, faded the Mnuchin tweet on the basis that Treasury-side stress was a contrarian indicator. The trade that broke: short banks into Q1 2019 — the Fed pivot worked through the financial sector first, not the structural-rate-environment thesis.",
  },

  "2025-trump-liberation-day": {
    priorBeliefs:
      "Going into early April 2025, the Trump administration's tariff threats had been priced as 'announcement-and-rollback' theatre — the prevailing template was the 2018-2019 trade-war cycle where threats were aggressive but actual implementation was incremental and reversible. Most strategists ranked the April 'Liberation Day' announcement as a negotiation tactic likely to be diluted before becoming binding.",
    marginalDataPoints: [
      "USTR background-paper drafts circulating in late March 2025 specified tariff structures with reciprocity formulas tied to bilateral trade deficits — operational specificity well beyond what a pure-theatre framing implied",
      "Cabinet-level participation in the reciprocal-tariff working group through March 2025 had broadened beyond USTR to include Commerce, Treasury, and Defense — the inter-agency coordination signaled an implementation track, not a posture",
      "The Trump White House's late-March 2025 social-media cadence had escalated specificity around country-by-country tariff rates — the 'we're really doing this' tell most analysts continued to discount",
      "USD/CNY 3m vol had been rising through March 2025 alongside the tariff specificity — option markets were pricing implementation more aggressively than spot-FX moves suggested",
      "Pre-announcement supply-chain-management surveys from mid-March 2025 had shown US importer pre-positioning + inventory build — physical-economy actors were already operating on a 'this is happening' base case",
    ],
    decisionPoints: [
      "Apr 2-3, 2025 ('Liberation Day' announcement of reciprocal tariffs averaging ~25% across most non-FTA partners): the analyst had to decide whether the announcement was the negotiating opening or the implementation start",
      "Apr 4-7, 2025 (S&P drops 12% in three sessions; vol regime breaks): the moment when the tariff event became a vol regime change rather than a transitional macro-noise event",
      "Apr 9, 2025 (90-day pause announcement on bulk of country-specific tariffs): the partial-walkback that vindicated the 'announcement-and-negotiation' framing tactically while leaving the structural tariff regime in place",
      "Through Q2 2025 (USD/CNY breaks 7.40 + Chinese retaliatory measures + supply-chain reorientation visible in shipping-rate data): the validation that even the 'paused' regime was operationally a tariff-step-up vs the 2024 baseline",
    ],
    dominantBias:
      "2018-2019-template extrapolation bias — analysts mapped the 2025 tariff cycle onto the prior Trump-tariff episode (announce, negotiate, implement-in-tranches) without weighting that the political-economy context had shifted (a second-term administration with no re-election constraint, an explicit revenue-and-reorientation goal, a pre-positioned cabinet). Compounded by operational-specificity-discount bias: USTR background-paper specificity was treated as drafting, not as commitment.",
    whatGoodAnalystsDid:
      "Tracked USTR drafting + cabinet inter-agency coordination as the leading-indicator gauge, read the social-media cadence as commitment signaling rather than as theatre, monitored physical-economy pre-positioning (inventory builds, freight rates) as the actor-side reaction to the implementation track. Took equity beta off through late March, sized USD short positions selectively (USD/CNY long, USD/MXN long, USD/EUR neutral), lengthened duration into the Apr 2 announcement. The trade that broke: long EM equities on the 'pause vindicates negotiation' thesis — the structural tariff-step-up that survived the pause continued to compress EM exporter margins through Q2.",
  },

  "1962-cuban-missile-crisis": {
    priorBeliefs:
      "Going into Oct 16, 1962 (the day President Kennedy was first briefed on the U-2 photographic evidence of Soviet IRBMs in Cuba), the consensus public framing was that Cuba had received defensive Soviet weaponry but not offensive nuclear-capable systems. Most US foreign-policy analysts and certainly all market participants had no read on the imminent quarantine + readiness escalation. The Cold War was a constant background condition; binary-existential-tail-risk was not in any market base case.",
    marginalDataPoints: [
      "Soviet shipping volumes to Cuba had increased materially through summer 1962, including unusual deck-cargo configurations (visible to USN reconnaissance) — operational-intelligence data not yet public",
      "S&P 500 had been in a multi-week trading range through early October 1962, recovering from the post-summer 1962 'Kennedy slide' into year-end positioning — the absolute level of the equity tape was carrying minimal vol premium",
      "Soviet UN-General-Assembly rhetoric through September 1962 had repeatedly denied offensive-weapon deployment, framing US Senate concerns as political theatre — a public commitment that boxed in retreat options on both sides",
      "Treasury markets had no observable defensive-positioning signal through early October — yields stable, vol low; the binary-existential-tail was effectively unhedged in financial markets",
    ],
    decisionPoints: [
      "Oct 22, 1962 evening (Kennedy's televised quarantine announcement; markets close before the speech but futures + overnight wires gap on the news): the analyst had to make an asynchronous read — the next New York open would be the first traded reaction, with the binary-existential-tail explicitly priced for the first time",
      "Oct 23, 1962 (S&P opens down ~3%, recovers most of it intraday; T-bond yields fall ~5bps): the moment when markets visibly accepted that the situation was not as catastrophic as the rhetoric suggested — the question was whether to size for de-escalation or for further escalation",
      "Oct 27, 1962 ('Black Saturday' — U-2 shot down over Cuba, Khrushchev's 'two letters' arrive): the high-water mark of escalation; the analyst had to decide whether the back-channel diplomacy signals would resolve before military command-chain escalation forced an outcome",
      "Oct 28, 1962 (Khrushchev announces missile withdrawal in exchange for a private US commitment on Turkey/Italy IRBMs): the resolution that vindicated the de-escalation pricing the equity market had carried through the week",
    ],
    dominantBias:
      "Background-Cold-War bias — analysts treated the US-USSR strategic competition as a constant macro condition without weighting the conditional probability of binary-existential-tail outcomes. Compounded by rhetoric-as-posture bias: Soviet UN denials and Kennedy's televised escalation were both framed as performative communication for domestic-political audiences, missing that the operational-military steps (quarantine + DEFCON 2 readiness + back-channel ExCom meetings) had concrete decision-deadlines that constrained the resolution window.",
    whatGoodAnalystsDid:
      "Tracked back-channel diplomacy signals (the Robert Kennedy / Anatoly Dobrynin meetings + the 'two letters' framing) as the actionable resolution-pathway gauge rather than relying on public rhetoric, sized for asymmetric outcomes (small upside from de-escalation, catastrophic loss from escalation) without taking aggressive risk-on positions, recognized that the US Treasury market was carrying NO premium for the binary-existential-tail and was therefore not a useful signal. Held risk-off through the Oct 22-28 window, faded the early-October pre-crisis equity range, lengthened duration on the Oct 28 resolution. The trade that broke even amongst the careful: short equities INTO Oct 28 — the resolution rally was sharp enough that overlap with the cover trade was operationally hard to time.",
  },

  "1929-black-tuesday": {
    priorBeliefs:
      "Through summer 1929 the consensus framing among most Wall Street firms and economic commentators was that equity valuations reflected a 'permanently high plateau' driven by mass-production economy gains, expanding margin lending, and steady industrial output. By September the market had pulled back from highs but the framing remained 'healthy correction in a structural bull market.' Few participants had a model where the Federal Reserve's tightening into a slowing economy could compound a margin-call cascade.",
    marginalDataPoints: [
      "Margin debt at NYSE member firms had grown to ~$8.5bn by late summer 1929 — historically unprecedented as a share of market capitalization, visible in monthly broker-dealer reports",
      "Industrial production had begun rolling over as early as June 1929 (visible in monthly Federal Reserve data); the divergence between the equity tape and underlying production was the leading indicator most analysts dismissed",
      "Fed had raised the discount rate from 5% to 6% in August 1929 — a tightening into an already-slowing economy, framed as 'leaning against speculation' but with operationally restrictive consequences for margin financing",
      "British central-bank tightening (Bank Rate to 6.5% on Sep 26, 1929) had compounded sterling-dollar dynamics and pulled gold flows toward London — the international dimension of the 1929 setup that most US-focused analysts ignored",
    ],
    decisionPoints: [
      "Sep 5, 1929 (the 'Babson Break' — Roger Babson's published warning of 'crash coming, and it may be terrific'; Dow drops 3% on the news): the analyst had to decide whether to take a single bearish forecast as a signal or as noise — the consensus dismissed it as one alarmist's opinion",
      "Oct 24, 1929 ('Black Thursday' — Dow opens deeply down, recovers on bank-syndicate buying mid-day): the moment the underlying liquidity-and-leverage fragility became visible; the question was whether the support operation was a circuit-breaker or a delaying action",
      "Oct 28-29, 1929 ('Black Monday' + 'Black Tuesday' — Dow down 12.8% + 11.7% in two sessions; volume sets multi-decade record): the cascading-margin-call confirmation; the question was whether to treat this as event-bottom or as the start of a multi-year regime",
      "Nov 1929 - early 1930 (Dow recovers ~50% of the October-November drop): the dead-cat-bounce setup that misled most participants into 'buying the dip' before the multi-year bear market resumed in 1930",
    ],
    dominantBias:
      "Permanently-high-plateau bias — the explicit name given to the framing where structural productivity gains were assumed to have re-rated equilibrium valuations. Compounded by margin-as-routine bias: margin lending was treated as a feature of efficient markets without weighting the convexity that reverses violently when prices fall through margin-call thresholds. Compounded again by 'Fed-policy-not-binding' bias — discount-rate increases were framed as tactical anti-speculation, missing their effect as a slowing-economy compound shock.",
    whatGoodAnalystsDid:
      "Tracked margin debt as a structural-fragility gauge (not just a positioning gauge), watched industrial-production data as the underlying-economy signal that the equity tape had decoupled from, recognized the September Fed + Bank-of-England tightening pair as a coordinated international-policy compounding factor. Reduced equity exposure through summer 1929, lengthened bond duration into Q4 1929, faded the late-1929/early-1930 recovery rally. The trade that broke even amongst the careful: cash through 1930-1932 — the magnitude of the deflation made even nominal-cash holdings lose purchasing-power-relative-to-real-assets in unusual ways.",
  },

  "1970-penn-central": {
    priorBeliefs:
      "Going into June 1970 the consensus framing of US commercial-paper markets was that they were a stable funding venue for high-grade corporates — particularly large-cap industrials with established credit standing. Penn Central, despite well-documented operating troubles through 1969-1970, was viewed as 'too important to fail' given its rail-transportation role + government strategic interest. Most credit analysts ranked Penn Central commercial paper as investment grade through the spring.",
    marginalDataPoints: [
      "Penn Central's quarterly earnings warnings through Q1 1970 had been escalating in language; the Apr 1970 management-change announcement was a clean 'company-in-crisis' tell most CP buyers were slow to respond to",
      "Penn Central commercial paper issuance had grown to ~$200m outstanding by Q2 1970 — sufficient size that a default would create a measurable shock to CP market depth, but framed as 'manageable'",
      "Other railroad credits had begun trading wider through Q1-Q2 1970 — the sector-correlation tell that wasn't being applied to non-rail-corporate CP demand",
      "Fed and Treasury internal discussions through May-June 1970 about contingency planning for a Penn Central failure leaked enough that financial-press attention escalated the week before the bankruptcy filing",
    ],
    decisionPoints: [
      "Jun 21, 1970 (Penn Central files for bankruptcy reorganization, defaulting on commercial paper for the first time in a major US issuer): the analyst had to read this as either 'idiosyncratic large-corporate failure' or 'commercial-paper market structural confidence event'",
      "Late June - July 1970 (CP market issuance volume drops sharply; corporate-treasury withdrawals visible across high-grade names): the contagion-pattern question — was this a Penn-Central-specific event or a generalized loss of CP investor confidence?",
      "Jun 22 onward (Fed's direct discount-window access for commercial banks to absorb CP-market redemptions; emergency liquidity provision visible the day after the bankruptcy): the policy-response intervention that capped the spillover",
      "Aug 1970 (Fed's quarterly Senior Loan Officer Survey shows accelerated tightening of credit standards across investment-grade corporates): the validation that the Penn Central event had structurally repriced credit-quality assumptions",
    ],
    dominantBias:
      "Implicit-government-guarantee bias — Penn Central's rail-transportation and strategic-importance role was assumed to imply policy backstop without operational verification. Compounded by 'CP-as-cash-equivalent' bias: the commercial paper market was treated as a near-cash venue without weighting its actual credit-risk distribution, which was masked by the historical absence of high-grade defaults.",
    whatGoodAnalystsDid:
      "Tracked Penn Central's quarterly earnings language as the leading-indicator deterioration gauge, recognized the strategic-importance argument as untested rather than reliable, watched CP-market issuance patterns post-default as the contagion-pattern gauge. Took CP exposure off through Q1-Q2 1970, lengthened high-quality bond positions through the June-July dislocation, recognized the Fed's discount-window response as the credible backstop mechanism. The trade that broke: long railroads broadly on the 'Penn Central is idiosyncratic' thesis — the sector-correlation reading was structurally important and the sector underperformed through Q3-Q4 1970.",
  },

  "1980-hunt-silver": {
    priorBeliefs:
      "Going into early 1980 the consensus framing of the silver market was that the Hunt brothers (Nelson Bunker + William Herbert) were operating large but legitimate long-silver positions in a tight-supply environment. Silver had risen from ~$6/oz in early 1979 to over $48/oz by Jan 17, 1980 — a 700% move attributed by most commodity desks to a combination of fundamental tightness and speculative momentum. Few participants explicitly modeled the Hunt position as the binding price-formation factor.",
    marginalDataPoints: [
      "Hunt-affiliated entity COMEX silver positions had grown beyond conventional 'large speculator' thresholds through 1979 — visible in CFTC weekly Commitments-of-Traders reports if read with adjustments for related-party aggregation",
      "Silver-coin-melt premiums had collapsed by early 1980 — physical-market arbitrage was actively responding to the price; the supply elasticity was higher than the spot-market move suggested",
      "COMEX margin requirements were raised through January 1980 (multiple steps from $1,000 to $30,000+ per contract) — visible operational signal that the exchange was attempting to constrain the Hunt position size before a forced-unwind path was taken",
      "Hunt-affiliated borrowing from First National Bank of Chicago + Bache Halsey Stuart Shields was reaching unprecedented sizes; counterparty-credit concentration risk was building visibly to anyone tracking the lender disclosures",
    ],
    decisionPoints: [
      "Jan 7, 1980 (CBOT raises silver futures margin requirements to $30,000; COMEX subsequently follows): the moment when the exchange operating mechanism was being explicitly used to constrain the Hunt position — the analyst had to read this as 'forced-unwind path being prepared'",
      "Jan 17, 1980 (silver peaks at $50.35/oz intraday): the highest-water-mark date that, in retrospect, marked the inflection — the question was whether to take profits or continue with the momentum thesis",
      "Mar 27, 1980 ('Silver Thursday' — Hunt brothers receive a margin call they cannot meet on Bache; silver collapses to $10.80 in a session): the cascading-forced-liquidation event that resolved the regime",
      "Late March - April 1980 (Bache and other lender-prime-broker support arrangements; eventual Hunt bailout structure brokered through the Federal Reserve): the resolution path that contained the lender-creditor-default contagion but at significant counterparty cost",
    ],
    dominantBias:
      "Speculator-as-noise-trader bias — large concentrated positions were modeled as adding momentum without weighting their potential to BE the marginal price-formation participant. Compounded by exchange-margin-as-friction bias: margin increases were treated as routine market-management when they were operationally a force against the dominant participant. Compounded again by 'silver-as-monetary-metal' bias which conflated monetary-asset narrative justifications with operational supply-demand realities.",
    whatGoodAnalystsDid:
      "Read CFTC large-trader data with related-party aggregation, watched coin-melt premiums as the physical-supply-elasticity gauge, treated CBOT/COMEX margin increases as the leading-indicator force-against-position signal. Took silver long exposure off through January-February 1980, sized for the cascading-margin-call resolution rather than a smooth peak, faded the brief post-Mar 27 stabilization rally. The trade that broke: short Bache equity and bonds — the Federal Reserve broker-up rescue mechanism contained the counterparty fallout faster than the credit-implosion thesis allowed for.",
  },

  "1994-tequila-crisis": {
    priorBeliefs:
      "Through November 1994 the consensus framing of Mexico was as a successful EM reform story: NAFTA was operative, capital inflows were strong, the peso was managed within an explicit band that had held through 1994 despite political turbulence (Colosio assassination, Chiapas uprising). Most strategists viewed Mexican external accounts as 'managed' even as the current-account deficit had widened to ~7% of GDP, financed by short-dated tesobonos.",
    marginalDataPoints: [
      "Mexican FX reserves had drawn down materially through 1994 — from ~$30bn in February to ~$10bn by mid-December — visible in BoP-Mexico monthly publications but framed as 'managed adjustment'",
      "Tesobono issuance (USD-indexed short-term Mexican government paper) had grown to ~$30bn outstanding by late 1994; the implicit roll-risk was structurally elevated against a $10bn reserve base",
      "Banamex CDS-equivalent pricing (proxied through deliverable-bond spreads) had widened through Q3-Q4 1994 — wholesale credit markets were repricing Mexican bank credit before the FX event materialized",
      "The Dec 1994 Mexican federal budget release had failed to address the external-imbalance question; political pressure on the new Zedillo administration was driving FX reserve depletion to defend the band",
    ],
    decisionPoints: [
      "Dec 20, 1994 (Mexican government announces a 15% devaluation of the upper band; PESO/USD breaks immediately on the announcement): the analyst had to read this as either 'managed depreciation within a credible band' or 'a band defense that's already failing'",
      "Dec 22, 1994 (Mexican government abandons the band entirely, peso floats and collapses ~50% in days): the regime-change resolution that vindicated the 'band-defense-failing' read",
      "Jan 1995 (Mexico requests $50bn international rescue package; US Treasury Exchange Stabilization Fund brokered facility announced Feb): the policy-response sufficiency read — was the package big enough to stabilize, or were follow-on EM contagion pathways already in motion?",
      "Q1 1995 (Argentine + Brazilian sovereign spreads widening as 'tequila contagion' propagates; eventually contained by IMF programs and US Treasury support): the contagion-pathway resolution that constrained the regional spillover",
    ],
    dominantBias:
      "Reform-story-as-permanent bias — Mexican NAFTA-era credibility was treated as having reset structural-vulnerability assessments without weighting that reform was conditional on continued capital-inflow continuity. Compounded by tesobono-as-protected-instrument bias: USD-indexation was treated as eliminating peso-devaluation risk for foreign holders, missing that it created a sharp policy-tradeoff for Mexico itself between rolling tesobonos and defending reserves.",
    whatGoodAnalystsDid:
      "Tracked monthly reserve drawdown as the leading-indicator gauge, netted reserves against tesobono outstanding to derive the actionable 'days of cover' measure, recognized the Banamex-credit widening as the wholesale-funding-stress tell. Shorted MXN through Q4 1994, took EM equity exposure off across the region in late December, lengthened US duration into the Mexican rescue package as flight-to-quality flows. The trade that broke: short Mexican equities — the rescue package stabilized faster than expected and the equity bottom in early 1995 caught short-positioning offside.",
  },

  "1998-indonesia-suharto": {
    priorBeliefs:
      "Going into late 1997 the consensus framing of Indonesia was as a pegged-currency EM in the Asian-financial-crisis cohort but with stronger fundamentals than Thailand or Malaysia — larger reserves, more diversified export base, longer track record. Suharto's 30-year political tenure was viewed as a stability anchor. The IMF program signed in November 1997 was framed as a credible stabilization mechanism. Few participants modeled the political-regime-change tail risk explicitly.",
    marginalDataPoints: [
      "IDR had broken from ~2,400 against USD in early November 1997 to ~16,000 by January 1998 — magnitude well beyond what comparable EM crises had produced; the FX move was already pricing a regime-change tail before politics fully expressed it",
      "Banking-sector NPLs were estimated at >40% of system assets by early 1998 — a level that historically required either nationalization or structural reform; the IMF program was attempting both but execution was politically constrained",
      "Suharto's repeated public disagreements with IMF reform conditions through Q1 1998 (specifically subsidies, monopolies, and family-business divestitures) signaled that the political execution was breaking down even as the policy framework existed on paper",
      "Indonesian student protests through April 1998 had escalated to multiple-city demonstrations; the political-stability anchor was visibly eroding while most EM-strategists framed it as 'background noise'",
    ],
    decisionPoints: [
      "May 12-15, 1998 (Trisakti University shootings → Jakarta riots → looting/arson; political situation deteriorates rapidly): the moment the political-regime-change tail moved from theoretical to imminent",
      "May 21, 1998 (Suharto resigns, Habibie becomes acting President): the regime-change resolution that, despite the apparent worst-case outcome, allowed for transition-without-collapse",
      "Q3 1998 (further political turbulence including the Russia/LTCM cross-asset event compounding regional pressure): the moment when the 1998 Indonesia event became part of a broader cross-regional crisis-cluster",
      "1999 (eventual IMF program continuation with Habibie + Wahid administrations; political stability gradually re-established): the resolution arc that vindicated 'transition-not-collapse' framing for those who held through the May-September stress",
    ],
    dominantBias:
      "Suharto-as-stability-anchor bias — long political tenure was treated as evidence of resilience without weighting the brittleness of personalist regimes under economic stress. Compounded by IMF-program-as-execution bias: the existence of an agreement was treated as equivalent to its execution, missing that political constraints could prevent the program's specific reforms even when the framework was nominally accepted.",
    whatGoodAnalystsDid:
      "Read the Suharto-IMF disagreements through Q1 1998 as the leading-indicator execution-failure gauge, tracked banking-NPL estimates as the structural-vulnerability measure, treated student protests + military-political dynamics as primary inputs (not background noise). Took IDR exposure off in late 1997, sized for political-regime-change tail outcomes through Q1-Q2 1998, lengthened cash + US duration into the May 1998 events. The trade that broke: short Indonesian sovereign credit through 1999 — the eventual IMF-program continuation under successor administrations stabilized faster than the political-collapse thesis allowed for.",
  },

  "2002-argentina-default": {
    priorBeliefs:
      "Through 2001 the consensus framing of Argentina was that the convertibility regime (1:1 peso-dollar peg via currency board) was a structural reform with very high political and economic exit costs. Despite repeated stress events through Q2-Q4 2001 (deposit flight, sovereign-yield blowout to 30%+, IMF program suspensions), most external-debt analysts assumed the political will to maintain the peg + secure follow-on IMF support would prevail. Argentine equities and sovereign debt traded at distressed levels but the default base case was 'restructuring not repudiation'.",
    marginalDataPoints: [
      "Argentine bank-deposit outflow had accelerated through October-November 2001 — the corralito (deposit freeze) imposed Dec 1, 2001 was the visible response to a run that was already in late-stage progression",
      "Sovereign-CDS spreads had reached >5,000bp by late November 2001 — a level historically associated with imminent default rather than restructuring, but the consensus continued to expect orderly debt-exchange resolution",
      "Provincial-government IOU issuance ('lecops', 'patacones') had begun circulating as quasi-currency in many provinces through 2001 — the operational sign that the de-facto monetary regime had already broken even before the formal default",
      "Multilateral-creditor (IMF + World Bank) signaling through November 2001 had hardened against further support absent fiscal reforms; the political feasibility of those reforms was visibly breaking down by late November",
    ],
    decisionPoints: [
      "Dec 1, 2001 (corralito announced — bank-deposit withdrawals capped at $1,000/month per depositor): the moment the convertibility-regime exit became operational; the analyst had to read this as either 'temporary stabilization' or 'precursor to currency-and-debt regime collapse'",
      "Dec 19-21, 2001 (mass protests, casseroles cacerolazos; President de la Rúa resigns): the political-regime-change confirmation that the convertibility-regime exit had become inevitable",
      "Dec 23, 2001 (interim President Rodríguez Saá announces sovereign-debt default during a congressional address — the largest sovereign default in history at that time): the formal default that the markets had effectively priced over the prior weeks",
      "Jan 2002 (peso devaluation 1:1 → 1.4:1 → free float; convertibility regime formally ended; banking-system pesification launched): the regime-change resolution that came in pieces over weeks, with each piece deferring full mark-to-market reckoning",
    ],
    dominantBias:
      "Convertibility-as-structurally-binding bias — the political and economic exit costs were treated as effectively prohibitive without weighting that political-feasibility constraints can shift abruptly under sustained economic stress. Compounded by IMF-as-backstop bias: continued multilateral support was assumed even as the conditionality requirements were becoming operationally infeasible to meet.",
    whatGoodAnalystsDid:
      "Read sovereign-CDS spread levels as a threshold measure (above 5,000bp historically signaled default, not restructuring), tracked deposit-outflow data as the run-velocity gauge, recognized provincial-IOU issuance as the de-facto monetary-regime-already-broken signal. Sized for currency-board exit through Q4 2001, lengthened cash + USTs into the December events, faded early-2002 'we're stabilizing' rallies. The trade that broke: short Argentine equities through Q1-Q2 2002 — the post-devaluation export-driven competitive-cost-base recovery delivered an equity rally that caught short-positioning offside.",
  },

  "2016-trump-election": {
    priorBeliefs:
      "Going into Nov 8, 2016 the consensus among polling aggregators (538: Clinton 71%, NYT Upshot: Clinton 85%, betting markets: Clinton ~75%) was that Hillary Clinton would win the presidential election. Most market positioning reflected this base case: short-USD, long-MXN, long-emerging-market equities, short-defense-and-energy. The 'Clinton-base-case-with-modest-tail' framing dominated investment-committee minutes through the week before the election.",
    marginalDataPoints: [
      "Polling tightening through October 2016 (after the FBI Comey letter, Oct 28) had visibly compressed the Clinton lead in key swing states — but aggregators continued to project high Clinton win probabilities because national-margin-based models were less sensitive to swing-state shifts",
      "MXN/USD vol skew had widened materially through October-November 2016 — option markets were paying up for MXN-weakness scenarios more aggressively than spot suggested",
      "Trump campaign's late-October 2016 polling-internal data leaked through media reporting suggested closer Wisconsin/Michigan/Pennsylvania readings than public polls — operational signal that ground-game data diverged from public-poll consensus",
      "S&P 500 had been in a tightening volatility regime through early November 2016 — implied vol was elevated but realized vol had been muted, leaving option-market positioning structurally short-vol going into the binary event",
    ],
    decisionPoints: [
      "Nov 8, 2016 evening / Nov 9 early hours (Florida + Ohio + North Carolina results break for Trump; betting-market odds shift from Clinton-favored to Trump-favored): the moment the election-night tape diverged from the consensus prior; futures markets traded sharply down (S&P futures -5%+ overnight) before partially recovering through the night",
      "Nov 9, 2016 NY open (S&P opens up ~1%, recovers all overnight losses; the 'Trump trade' narrative emerges — long defense, long financials, long small-caps, short bonds, short EMs): the analyst had to decide whether to chase the recovery move or fade it as overshoot",
      "Q4 2016 (Trump trade extends through year-end on tax-cut + deregulation thesis; USD strength + UST yield rise): the validation that the policy-mix repricing was multi-quarter, not a single-day event",
      "Q1 2017 (Trump trade partially reverses as tax-cut timeline extends + executive-order policies create regulatory uncertainty): the moment when the strong-policy-execution thesis met implementation reality",
    ],
    dominantBias:
      "Polling-aggregator-as-truth bias — even as individual polls tightened, aggregator confidence intervals stayed narrow because the aggregation methodology weighted national-popular-vote estimates that were less sensitive to swing-state swings. Compounded by 'modest-tail' bias: the binary outcome was modeled as a small-probability event without sizing for the discontinuous-policy-mix repricing that the alternative outcome implied.",
    whatGoodAnalystsDid:
      "Tracked MXN vol skew as a leading-indicator gauge of asymmetric outcome pricing, parsed swing-state-by-swing-state polling rather than the aggregate, recognized that even a 25% probability event with a 10%+ asset-price reaction warranted protective hedges. Sized for binary outcomes with explicit hedges (long MXN puts, long defense, long small-caps), faded the overnight Nov 8/9 panic to chase the policy-mix repricing through Q4 2016. The trade that broke: long EM equities through Q4 2016 — the dollar-strength + Trump-trade reversal of the carry-and-EM positioning was sharper than the consensus 'modest-pullback' allowed for.",
  },

  "2022-lme-nickel": {
    priorBeliefs:
      "Going into early March 2022 the consensus framing of LME nickel was that a price move tied to the Russia/Ukraine conflict was happening but within manageable bounds. Tsingshan's well-known short-position structure (Class 1 / Class 2 nickel mismatch on the LME contract) was viewed as concerning but contained. The LME's market-stabilization mechanisms were assumed to have margin + circuit-breaker tools sufficient to avoid extreme dislocations.",
    marginalDataPoints: [
      "LME nickel had risen from ~$25,000/t in early February 2022 to ~$50,000/t by Mar 7 — a doubling over five weeks driven by Russia-supply-disruption pricing + Tsingshan-short-squeeze speculation",
      "Tsingshan Holding's known LME short position was estimated at >150,000 tonnes through specialty-press reporting; the size relative to actual Class 1 deliverable supply was the structural mismatch that few outside-of-the-trade analysts modeled explicitly",
      "LME's daily price-move limits had not been triggered through early March; the exchange operating mechanism was visibly facing stress but had not yet acted decisively",
      "Cross-asset margin-call channels through Tsingshan's prime-broker relationships (JPMorgan + others) had begun accelerating through early March 7-8 — the lender-counterparty-stress proxy was building",
    ],
    decisionPoints: [
      "Mar 7, 2022 (LME nickel closes at ~$50,000/t; Tsingshan margin-call concerns escalate; trading hours resume Mar 8): the analyst had to decide whether to run the long thesis through what was visibly an exchange-stability-stress event",
      "Mar 8, 2022 (LME nickel hits ~$100,000/t intraday +250% in hours on cascading short-cover; LME suspends trading mid-session and announces cancellation of Mar 8 trades back to a cutoff time): the moment when the exchange operating mechanism intervened unprecedentedly — the analyst had to read this as 'temporary protective measure' vs 'fundamental break in LME credibility'",
      "Mar 9-15, 2022 (LME suspended trading multi-day; eventual reopening with new circuit breakers + position-limit framework): the policy-response intervention that contained the immediate crisis but at significant counterparty / institutional cost",
      "Q2 2022 onward (LME-vs-CME nickel-volume migration; LME's institutional credibility as a price-formation venue persistently impaired): the reputation-damage resolution that the trade-cancellation decision had created",
    ],
    dominantBias:
      "Exchange-mechanism-as-neutral bias — analysts modeled LME's operational tools (margins + limits + circuit-breakers) as neutral mechanisms that would constrain but not change market outcomes. The trade-cancellation decision was operationally a redistribution of P&L between participants and was unprecedented in modern LME history. Compounded by 'large-corporate-trades-are-stable' bias: Tsingshan's position was modeled as legitimate hedging without weighting that hedge sufficiency depends on Class 1 / Class 2 deliverable matching that was structurally inadequate.",
    whatGoodAnalystsDid:
      "Read the Tsingshan position size relative to LME Class 1 deliverable supply as the structural-mismatch gauge, tracked prime-broker counterparty-stress signals (basis pricing + bank-financing-cost data), recognized that LME's institutional credibility was a separate variable from nickel-price pricing. Took long-nickel exposure off ahead of Mar 7, sized for exchange-mechanism intervention rather than smooth price clearing, recognized the trade-cancellation decision as a reputation-impairment event for LME specifically. The trade that broke: long LME-listed metals broadly through Q2 2022 — the migration to CME-listed contracts impaired LME-specific-instrument basis pricing.",
  },

  "2023-credit-suisse-ubs": {
    priorBeliefs:
      "Through early March 2023 the consensus framing of Credit Suisse was as a struggling but solvent G-SIB undergoing multi-year restructuring under a relatively new CEO (Ulrich Körner). The October 2022 capital raise + restructuring announcement had been viewed as adequate. Most credit analysts ranked CS in the lower quartile of European-bank credit quality but solidly investment-grade. The SVB collapse the week prior (Mar 9-10) had introduced cross-Atlantic sector stress but had not been viewed as directly transmissible to a European G-SIB.",
    marginalDataPoints: [
      "CS deposit outflows in Q4 2022 had been a record ~CHF 110bn — visible in the Q4 2022 results release in early February 2023, but framed as restructuring-related rather than as franchise-impairment",
      "CS senior unsecured CDS had widened from ~250bp to >450bp through Q1 2023 — pricing well above the rest of European-bank-CDS distribution; the cleanest tell that wholesale credit was repricing faster than equity",
      "Saudi National Bank (CS's largest shareholder) Chairman's Mar 15, 2023 Bloomberg TV comment ('absolutely not' more capital) sparked a 30% intraday equity drop — the moment when the chair's comment broadcast a 'we cannot take more' signal that markets read as a confidence collapse",
      "CS-internal Lex Greensill / Archegos events had cumulatively impaired the franchise's institutional-counterparty relationships through 2021-2022; the wealth-management business was relatively healthier but the IB was structurally damaged",
    ],
    decisionPoints: [
      "Mar 15, 2023 (Saudi National Bank Chairman comment + CS equity -30% intraday): the moment when the franchise-confidence event became visible; the analyst had to read this as either 'one-day political-risk repricing' or 'an accelerated path to forced resolution'",
      "Mar 15-16, 2023 evening (SNB / FINMA emergency liquidity facility for CS announced; CS draws ~CHF 50bn the next morning): the policy-response intervention that delayed rather than solved the franchise problem",
      "Mar 19, 2023 evening (UBS-Credit Suisse forced-merger announcement at CHF 0.76/share — 60% below the Friday close; SNB / FINMA emergency-merger framework deployed): the regime-change resolution that, despite the forced nature, contained the systemic-spillover risk to the EU banking system",
      "Mar 20, 2023 (CS AT1 bondholders fully written off, ~$17bn — equity holders received UBS shares above zero; this was specifically reversal of the conventional capital-stack hierarchy): the policy-side decision that materially impaired the global AT1 market liquidity and pricing",
    ],
    dominantBias:
      "G-SIB-resolution-takes-quarters bias — analysts modeled European G-SIB resolution timelines based on the 2008-2012 European-bank-bailout playbook (TARP-style multi-month process). Compounded by 'capital-stack-hierarchy-binding' bias: the AT1-before-equity write-down expectation was treated as legally-binding when in fact Swiss resolution-authority discretion deviated. Compounded again by SVB-not-transmissible bias: the US-regional-banking event was framed as having no European G-SIB pathway when in fact franchise-confidence events propagate cross-jurisdictionally faster than bailouts.",
    whatGoodAnalystsDid:
      "Read CS senior CDS levels relative to European-bank distribution as the leading-indicator gauge, tracked deposit-outflow velocity through Q1 2023, recognized that SVB's franchise-confidence shock had repriced cross-Atlantic banking-sector tail risk. Took CS exposure off ahead of Mar 15, sized for accelerated-resolution rather than multi-quarter restructuring, recognized AT1 write-down risk as conditional on resolution-authority discretion rather than as equity-hierarchy-protected. The trade that broke: long European-bank AT1 broadly — the CS AT1 write-down operationally impaired the asset class's pricing across the broader European-bank universe through Q2 2023.",
  },

  "2018-turkey-lira": {
    priorBeliefs:
      "Going into August 2018 the consensus framing of Turkey was as a high-yielding EM with manageable external imbalances — current-account deficit visible but funded, FX reserves declining but adequate, banking sector under stress but solvent. The political dimension (Erdogan's eldest-son-in-law as Finance Minister + Erdogan's public 'rates cause inflation' framing) was viewed as concerning but contained. The external trigger most strategists watched was Fed-driven dollar strength, not US-Turkey diplomatic friction.",
    marginalDataPoints: [
      "TRY had been weakening through Q1-Q2 2018 (5.0 to 4.85 against USD by July) on rate-policy disagreements between the technocratic CBT and political leadership — the structural pressure was visible but framed as 'manageable EM episode'",
      "Turkish bank external USD funding (TL/USD swap-driven indirect dollar exposure) had grown through 2017-2018; the visible BIS data on Turkish-bank cross-border claims was a clean tell",
      "Pastor Andrew Brunson's continued Turkish detention through summer 2018 had become a publicly stated bilateral-relations sticking point with the Trump administration; most EM strategists treated this as diplomatic noise",
      "Erdogan's Aug 10 'we won't surrender to the dollar' speech + appointment of his son-in-law as Finance Minister coincided with US-Turkey trade-tariff escalation announcements — three signals stacking simultaneously",
    ],
    decisionPoints: [
      "Aug 10, 2018 (Trump tweets 'I have just authorized a doubling of Tariffs on Steel and Aluminum'; TRY down 16% in single session, breaking 6.50 against USD): the analyst had to read this as either 'one-day political-noise spike' or 'the start of a contagion-eligible currency-board breakdown'",
      "Aug 13-14, 2018 (CBT credit measures + emergency liquidity facilities; TRY stabilizes near 6.90): the policy-response sufficiency read — was the central bank intervention bridging or band-aiding?",
      "Sep 13, 2018 (CBT emergency hike from 17.75% to 24.0%, Erdogan publicly attacks the move): the political-economy collision on display; the question shifted to whether technocratic policy could survive against political resistance",
      "Q4 2018 onward (TRY stabilizes in 5.30-5.50 range as Brunson is released, US-Turkey friction de-escalates, rate hike holds): the resolution path that vindicated 'idiosyncratic political-economy event' framing over 'EM contagion broadens' framing",
    ],
    dominantBias:
      "Dollar-strength-as-only-trigger bias — EM strategists modeled Turkey vulnerability primarily through the Fed-tightening + dollar-strength channel and underweighted the bilateral-political-friction trigger pathway. Compounded by 'CBT-can-handle-this' bias: the technical capacity of the central bank was overweighted relative to the political constraint that limited its actions.",
    whatGoodAnalystsDid:
      "Tracked Turkish-bank cross-border USD claims as the leading-indicator vulnerability gauge, read the Erdogan + son-in-law + Brunson signal stack as a coordinated political-economy regime change, sized exposure for a TRY break beyond historical EM-volatility ranges. Shorted TRY into the Aug 10 escalation, took EM-equity exposure off, faded the Aug 14 stabilization. The trade that broke: long Turkish equities on the 'CBT will deliver' thesis — the rate hike worked but the equity recovery was much slower than the FX stabilization.",
  },
};
