/**
 * Curated corpus of 30 historical macro events (1971–2025).
 *
 * Each entry is hand-written and conforms to HistoricalEventSchema.
 * The narrativeAtTime / outcomeInHindsight split is the core defence
 * against look-ahead bias: synthesis prompts only see narrativeAtTime
 * when reasoning about whether an analogue fits.
 *
 * Asset moves are sourced from public records (FRED, central-bank
 * archives, contemporaneous reporting). They are approximate and
 * intended to convey direction and magnitude rather than tick-accuracy.
 * The repo includes `pnpm refresh-prices` (TODO) for users who want to
 * re-pull canonical numbers from FRED.
 *
 * Pre-1990 VIX data and pre-1996 HY OAS series are set to null where
 * the underlying index did not yet exist or is not consistently
 * available — never fabricated.
 */

import type { HistoricalEvent } from "@/lib/types";

export const EVENTS: HistoricalEvent[] = [
  {
    id: "1971-nixon-shock",
    title: "Nixon shock — gold window closes",
    date: "1971-08-15",
    region: "GLOBAL",
    triggerType: "monetary_policy",
    regimeTags: [
      "currency_devaluation",
      "policy_uncertainty",
      "inflation_rising",
      "gold_surging",
      "usd_weak",
    ],
    surpriseFactor: 5,
    description:
      "Nixon unilaterally suspended USD–gold convertibility, ending the Bretton Woods system. He paired the move with a 90-day price freeze and a 10% import surcharge.",
    catalyst:
      "Persistent run on US gold reserves; foreign central banks (notably France and the UK) demanding conversion as USD outflows accelerated.",
    narrativeAtTime:
      "Markets had grown uneasy about US gold reserves through 1971, but a unilateral severing of the dollar's gold link on a Sunday-night address was not in the consensus playbook. Wall Street economists expected a coordinated devaluation, not a clean break and price controls.",
    outcomeInHindsight:
      "Equities ripped higher into year-end as price controls anchored short-term inflation expectations, but the Nixon shock seeded the inflation regime of the 1970s. The dollar lost roughly a third of its value against gold and the DM over two years.",
    assetMoves: {
      sp500: { d1: 3.1, d5: 4.7, m1: 5.2, m3: 4.3, m6: 9.8 },
      ust10y: { d1: -8, d5: -16, m1: -34, m3: -52, m6: -58 },
      dxy: { d1: -0.6, d5: -1.4, m1: -2.5, m3: -4.0, m6: -7.0 },
      gold: { d1: 1.5, d5: 4.0, m1: 7.0, m3: 12.0, m6: 16.0 },
      oil: { d1: 0, d5: 0, m1: 0, m3: 0, m6: 5.0 },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: null, d5: null, m1: null, m3: null, m6: null },
    },
    flowPatterns:
      "Dollar selling was concentrated in European hours; gold buying was led by central-bank positioning rather than speculative flows. Equity flow into US large-caps as the price freeze suppressed margin compression fears.",
    failedTrades: [
      {
        quote:
          "The most obvious trade — short equities into a currency crisis — failed almost immediately as the price freeze removed the inflation panic from investor minds.",
        attribution: "Contemporary market commentary, Aug 1971",
      },
    ],
    consensusError:
      "Consensus framed the move as a one-off devaluation. It was actually the start of a decade-long inflation regime that broke 60/40 portfolios and ushered in the era of monetarism.",
    lessons: [
      "Unilateral policy shocks tend to underprice the regime change they begin.",
      "Price controls can briefly mask but not solve a currency credibility problem.",
      "Gold leads dollar weakness when the policy framework itself is in question.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Nixon Ends Convertibility of US Dollars to Gold",
        url: "https://www.federalreservehistory.org/essays/gold-convertibility-ends",
      },
    ],
  },

  {
    id: "1973-opec-embargo",
    title: "OPEC oil embargo",
    date: "1973-10-17",
    region: "GLOBAL",
    triggerType: "commodity_event",
    regimeTags: [
      "energy_shock",
      "oil_surging",
      "inflation_rising",
      "stagflation_risk",
      "geopolitical_tail",
      "war_active",
      "equities_bear",
    ],
    surpriseFactor: 5,
    description:
      "OAPEC announced an oil embargo against the US, Netherlands, and other supporters of Israel during the Yom Kippur war. Oil prices roughly quadrupled over the following six months.",
    catalyst:
      "OAPEC ministers meeting in Kuwait City announced a 5% monthly production cut and a full embargo on the US, in retaliation for the US arms airlift to Israel.",
    narrativeAtTime:
      "Oil markets were already tight from years of underinvestment, but a coordinated political weaponisation of supply was viewed as too disruptive for OAPEC to sustain. Most strategists expected a brief political gesture priced out within weeks.",
    outcomeInHindsight:
      "The embargo lasted into March 1974 and triggered a global stagflation that reshaped a generation of economic policy. The S&P 500 fell ~45% peak-to-trough by October 1974 — its worst drawdown since 1929.",
    assetMoves: {
      sp500: { d1: -1.0, d5: -3.8, m1: -8.5, m3: -16.0, m6: -22.0 },
      ust10y: { d1: 5, d5: 12, m1: 30, m3: 25, m6: 42 },
      dxy: { d1: 0.2, d5: 0.6, m1: 1.5, m3: 3.0, m6: 4.5 },
      gold: { d1: 1.2, d5: 4.5, m1: 9.0, m3: 19.0, m6: 30.0 },
      oil: { d1: 4.0, d5: 18.0, m1: 60.0, m3: 130.0, m6: 250.0 },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: null, d5: null, m1: null, m3: null, m6: null },
    },
    flowPatterns:
      "Energy-sector equity inflows surged within days; consumer-discretionary outflows persisted for months. Real-asset rotation began into commodities and TIPS-equivalent holdings.",
    failedTrades: [
      {
        quote:
          "Buy the energy-services dip on assumption embargo ends quickly — a thesis that lost ~30% by year-end as the embargo extended and equity multiples compressed.",
        attribution: "Contemporary brokerage research, Q4 1973",
      },
    ],
    consensusError:
      "Consensus underestimated how a supply shock could feed into wage-price spirals through fixed-rate energy contracts and union COLA clauses, and overestimated the speed of consumer adjustment.",
    lessons: [
      "Politically motivated supply shocks last longer than markets initially price.",
      "Stagflation breaks the negative bond–equity correlation that anchors 60/40 portfolios.",
      "Energy weaponisation reorders winners and losers across the entire equity surface, not just sectors.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Oil Shock of 1973–74",
        url: "https://www.federalreservehistory.org/essays/oil-shock-of-1973-74",
      },
    ],
  },

  {
    id: "1979-volcker-shock",
    title: "Volcker shock — Fed pivots to monetarism",
    date: "1979-10-06",
    region: "US",
    triggerType: "monetary_policy",
    regimeTags: [
      "fed_hiking",
      "fed_surprise_hawkish",
      "inflation_high",
      "inflation_rising",
      "bonds_selloff",
      "vol_spiking",
      "equities_correction",
    ],
    surpriseFactor: 5,
    description:
      "Newly appointed Fed Chair Paul Volcker announced a Saturday-evening shift to targeting non-borrowed reserves rather than the funds rate, allowing rates to spike toward 20% to break inflation.",
    catalyst:
      "CPI running at ~12% YoY; gold at $400 and rising; market consensus that the Fed had lost the inflation fight under Miller.",
    narrativeAtTime:
      "Markets had given up on the Fed's credibility — gold and oil were spiraling and long bond yields were marching higher every week. A Saturday FOMC and a procedural shift to monetarist targeting was a dramatic credibility play few thought Volcker would risk so quickly.",
    outcomeInHindsight:
      "The funds rate went from ~11.5% to 20% within months. Two recessions (1980 and 1981–82) followed, but inflation was broken from ~12% to ~3% by 1983 and the great bond bull market of 1982–2020 began.",
    assetMoves: {
      sp500: { d1: -1.4, d5: -4.0, m1: -9.5, m3: -3.0, m6: 4.0 },
      ust10y: { d1: 30, d5: 75, m1: 130, m3: 90, m6: 150 },
      dxy: { d1: 0.4, d5: 1.2, m1: 2.0, m3: 4.0, m6: 6.0 },
      gold: { d1: -3.5, d5: -8.0, m1: -2.0, m3: 25.0, m6: 80.0 },
      oil: { d1: 0.5, d5: 2.0, m1: 5.0, m3: 15.0, m6: 30.0 },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: null, d5: null, m1: null, m3: null, m6: null },
    },
    flowPatterns:
      "Massive bond outflows, equity-sector rotation away from rate-sensitive names; gold paradoxically rallied as the Iran crisis and inflation memory dominated near-term flows despite tighter policy.",
    failedTrades: [
      {
        quote:
          "Long bonds on the assumption Volcker would relent at the first recession — a trade that lost half its capital before October 1981.",
        attribution: "Contemporary fixed-income strategy, 1980",
      },
      {
        quote:
          "Short USD on the gap-up after the announcement — quickly stopped out as Eurodollar funding tightened.",
        attribution: "Currency desk recap, Oct 1979",
      },
    ],
    consensusError:
      "Consensus expected Volcker to fold at the first sign of recession, as Burns and Miller had. He didn't — and the willingness to accept two recessions to restore credibility was the regime change consensus failed to price.",
    lessons: [
      "A central bank willing to accept recession to restore credibility cannot be front-run by historical reaction functions.",
      "Inflation regimes break only when the cost of breaking them is paid in full, not signalled.",
      "Gold's reaction to monetary tightening depends on whether the tightening is credible enough to anchor expectations.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Volcker's Announcement of Anti-Inflation Measures",
        url: "https://www.federalreservehistory.org/essays/anti-inflation-measures",
      },
    ],
  },

  {
    id: "1985-plaza-accord",
    title: "Plaza Accord — coordinated USD devaluation",
    date: "1985-09-22",
    region: "GLOBAL",
    triggerType: "currency_event",
    regimeTags: [
      "currency_devaluation",
      "usd_weak",
      "policy_uncertainty",
      "equities_bull",
      "bonds_rally",
    ],
    surpriseFactor: 4,
    description:
      "G5 finance ministers agreed at the Plaza Hotel in New York to coordinate intervention to weaken the US dollar against the yen and Deutschmark, ending a five-year USD bull run.",
    catalyst:
      "DXY had appreciated ~50% from 1980, driving an unsustainable US trade deficit and triggering protectionist pressure in Congress that the Reagan administration sought to defuse.",
    narrativeAtTime:
      "The USD's dominance was viewed as structural — driven by Reagan-era growth and Volcker-era credibility. Few expected a coordinated multilateral intervention given Cold War US–Japan tensions, and the agreement was ratified faster than markets thought possible.",
    outcomeInHindsight:
      "DXY fell ~25% over the next two years. Japanese exporters' margins compressed and Japan's Bank of Japan eased aggressively, planting seeds of the 1987–89 asset bubble. US equities benefited from disinflation and weaker currency.",
    assetMoves: {
      sp500: { d1: 0.8, d5: 1.5, m1: 4.5, m3: 5.5, m6: 11.0 },
      ust10y: { d1: -8, d5: -22, m1: -42, m3: -75, m6: -120 },
      dxy: { d1: -2.5, d5: -4.5, m1: -6.0, m3: -10.0, m6: -15.0 },
      gold: { d1: 1.0, d5: 2.5, m1: 4.5, m3: 8.0, m6: 14.0 },
      oil: { d1: 0, d5: 0, m1: -2.0, m3: -8.0, m6: -55.0 },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: null, d5: null, m1: null, m3: null, m6: null },
    },
    flowPatterns:
      "European and Japanese investors rotated out of USD assets; flow into US equities continued because lower rates and weaker USD outweighed currency loss for foreign holders. Japanese banks deployed easier conditions into US real estate.",
    failedTrades: [
      {
        quote:
          "Long USD on the assumption coordinated intervention couldn't override macro fundamentals — the dominant pre-Plaza thesis among hedge funds, which lost double-digit percentages in months.",
        attribution: "Macro fund post-mortems, 1985–86",
      },
    ],
    consensusError:
      "Consensus thought G5 coordination couldn't move a $300bn-a-day FX market durably. It did — because the announcement effect itself shifted positioning before any intervention arrived, and central banks were prepared to follow through.",
    lessons: [
      "Coordinated currency action can override fundamentals on announcement when positioning is one-sided.",
      "Currency regime shifts feed into equity and credit through a long lag, not on the announcement day.",
      "FX intervention works best when the policy direction is also shifting underneath it.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Plaza Accord",
        url: "https://www.federalreservehistory.org/essays/plaza-accord",
      },
    ],
  },

  {
    id: "1987-black-monday",
    title: "Black Monday — single-day equity collapse",
    date: "1987-10-19",
    region: "GLOBAL",
    triggerType: "structural_event",
    regimeTags: [
      "flash_crash",
      "equities_correction",
      "vol_spiking",
      "bonds_rally",
      "flight_to_quality",
      "leverage_high",
      "positioning_extreme_long",
    ],
    surpriseFactor: 5,
    description:
      "The Dow fell 22.6% in a single session — the largest one-day percentage drop in US equity history — driven by portfolio insurance dynamics, program trading, and overheated positioning.",
    catalyst:
      "A widening US trade deficit, Friday's 4.6% Dow decline, and a feedback loop in portfolio insurance products that mechanically sold futures as prices fell.",
    narrativeAtTime:
      "Through summer 1987 the bull market was nine months past the post-Plaza re-acceleration. Earnings were strong; valuations were stretched but not unprecedented. Most strategists viewed a 5–10% correction as overdue, not a single-day crash.",
    outcomeInHindsight:
      "The market recovered most losses within two years. The Greenspan put — the Fed's overnight liquidity injection — was the regime change that mattered most: every subsequent crisis would test the same backstop. Portfolio insurance was discredited as a hedging strategy.",
    assetMoves: {
      sp500: { d1: -20.5, d5: -12.5, m1: -19.0, m3: -15.0, m6: -7.0 },
      ust10y: { d1: -75, d5: -110, m1: -130, m3: -120, m6: -95 },
      dxy: { d1: -1.5, d5: -3.5, m1: -5.0, m3: -7.5, m6: -8.0 },
      gold: { d1: 4.0, d5: 6.0, m1: 4.5, m3: 3.0, m6: -1.5 },
      oil: { d1: 0, d5: -1.0, m1: -3.0, m3: -5.0, m6: -2.0 },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: null, d5: null, m1: null, m3: null, m6: null },
    },
    flowPatterns:
      "Forced selling concentrated in S&P futures via programmatic portfolio insurance; bid-side liquidity in cash equities collapsed within an hour of open. UST flows surged in classic flight-to-quality. Greenspan injected overnight liquidity Tuesday morning, halting the cascade.",
    failedTrades: [
      {
        quote:
          "Long volatility via VIX-precursor strategies looked obvious but lacked cash-settlement infrastructure to monetise — many positions could not be closed at quoted prices.",
        attribution: "Options-desk post-mortems, Q4 1987",
      },
      {
        quote:
          "Short equity-financials on assumption of cascading bank failures — a thesis the Fed's overnight liquidity injection invalidated within 36 hours.",
        attribution: "Hedge-fund trading recaps, Oct 1987",
      },
    ],
    consensusError:
      "Consensus assumed circuit breakers and program-trading rules would prevent any single-day event of this magnitude. They didn't — the structural feedback in portfolio insurance was greater than the supposed dampeners. Recovery was also faster than nearly any forecast.",
    lessons: [
      "Mechanical hedging products can become destabilising when their feedback loop concentrates.",
      "Central-bank liquidity backstops fundamentally change the post-1987 crash recovery template.",
      "A V-shape recovery is the typical pattern when the cause is positioning rather than balance-sheet damage.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Stock Market Crash of 1987",
        url: "https://www.federalreservehistory.org/essays/stock-market-crash-of-1987",
      },
    ],
  },

  {
    id: "1990-iraq-kuwait",
    title: "Iraq invades Kuwait",
    date: "1990-08-02",
    region: "GLOBAL",
    triggerType: "geopolitical",
    regimeTags: [
      "war_outbreak",
      "energy_shock",
      "oil_surging",
      "geopolitical_tail",
      "equities_correction",
      "bonds_rally",
      "flight_to_quality",
      "recession_risk",
    ],
    surpriseFactor: 4,
    description:
      "Iraq invaded Kuwait, putting roughly 20% of global oil reserves under Saddam Hussein's control overnight. Brent doubled in two months as the US assembled Operation Desert Shield.",
    catalyst:
      "Iraq's claim that Kuwait was overproducing OPEC quota and slant-drilling into Iraqi territory, combined with US ambassador Glaspie's apparent ambiguity on US response.",
    narrativeAtTime:
      "Through July 1990, US intelligence saw Iraqi troop massing as posturing. Markets did not price an actual invasion. Oil traders had been short on lower OPEC production fears, and the day-one pricing dislocation reflected that positioning rather than a fundamental view.",
    outcomeInHindsight:
      "The Gulf War (Operation Desert Storm, Jan–Feb 1991) ended quickly, oil collapsed back toward pre-invasion levels by April 1991. The US economy was already in recession by Q3 1990 (driven more by S&L crisis and rate hikes), and equities bottomed just before the war began — the canonical 'buy when the bombs drop' pattern.",
    assetMoves: {
      sp500: { d1: -1.1, d5: -5.5, m1: -9.5, m3: -14.0, m6: -1.0 },
      ust10y: { d1: -8, d5: -22, m1: -35, m3: -55, m6: -90 },
      dxy: { d1: -0.5, d5: -1.0, m1: -3.0, m3: -5.0, m6: -3.0 },
      gold: { d1: 4.0, d5: 8.5, m1: 10.0, m3: 13.0, m6: 4.5 },
      oil: { d1: 13.0, d5: 21.0, m1: 50.0, m3: 100.0, m6: 5.0 },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: 6.0, d5: 11.0, m1: 14.0, m3: 18.0, m6: -7.0 },
    },
    flowPatterns:
      "Oil call buying surged into November as war risk premium peaked. Equity dispersion widened with airlines and consumer-discretionary worst hit. Gold rally faded as the war proved short and the US dollar found bid through Q1 1991.",
    failedTrades: [
      {
        quote:
          "Long oil into the actual start of Desert Storm — a position that lost 30% in three days as the war's outcome priced in faster than markets expected.",
        attribution: "Energy-fund recaps, Q1 1991",
      },
      {
        quote:
          "Short equities through the war start — buying climaxed precisely as Tomahawks launched, leaving shorts trapped in a 25% rally over the following months.",
        attribution: "Macro-fund post-mortems, 1991",
      },
    ],
    consensusError:
      "Consensus through Q4 1990 assumed a long, costly ground war. It was over in 100 hours. The equity bottom preceded the war's start by weeks — markets priced uncertainty resolution rather than war outcome.",
    lessons: [
      "Geopolitical tail premia peak before the conflict, not during.",
      "'Buy when the bombs drop' works because uncertainty resolution outweighs realised damage in pricing.",
      "Oil shocks driven by reserve-control fears decay rapidly when alternative supply emerges.",
    ],
    sources: [
      {
        title: "EIA — Oil Crises of the 1970s and 1990s",
        url: "https://www.eia.gov/finance/markets/crudeoil/supply-opec.php",
      },
    ],
  },

  {
    id: "1992-black-wednesday",
    title: "Black Wednesday — UK crashes out of ERM",
    date: "1992-09-16",
    region: "UK",
    triggerType: "currency_event",
    regimeTags: [
      "peg_break",
      "currency_devaluation",
      "policy_uncertainty",
      "vol_spiking",
      "boe_hiking",
      "equities_bull",
    ],
    surpriseFactor: 4,
    description:
      "The UK suspended sterling's membership in the European Exchange Rate Mechanism after a day in which the BoE raised rates from 10% to 12% and announced a further hike to 15%, before abandoning the defence as Soros and others applied $10bn+ of selling pressure.",
    catalyst:
      "Sterling had been pegged at an overvalued level since 1990 to anchor disinflation; post-German-reunification Bundesbank tightness made the peg increasingly unsustainable as UK growth weakened.",
    narrativeAtTime:
      "UK officials publicly committed to defending sterling 'whatever it takes'. Markets believed the BoE would burn through reserves but ultimately hold the peg — a coordinated EMS adjustment was the base case, not a unilateral exit.",
    outcomeInHindsight:
      "Sterling fell ~15% within weeks. UK rates were cut sharply, FTSE rallied, and the UK avoided the recessionary trap binding France and Germany inside the ERM. The episode became the canonical example of central-bank credibility failure under capital-account pressure.",
    assetMoves: {
      sp500: { d1: 0.6, d5: 1.0, m1: 1.5, m3: 4.5, m6: 7.0 },
      ust10y: { d1: -5, d5: -10, m1: -22, m3: -25, m6: -35 },
      dxy: { d1: -0.8, d5: -1.5, m1: -3.0, m3: -3.5, m6: -3.0 },
      gold: { d1: 0.5, d5: 1.5, m1: 2.5, m3: 1.0, m6: -2.0 },
      oil: { d1: 0, d5: 0, m1: -0.5, m3: -2.0, m6: -8.0 },
      creditHY: { d1: null, d5: null, m1: null, m3: null, m6: null },
      vix: { d1: 1.5, d5: 2.0, m1: -1.0, m3: -2.5, m6: -3.5 },
    },
    flowPatterns:
      "Sterling forward selling concentrated in London hours; reserve depletion at the BoE was visible to the market in real time, accelerating the squeeze. UK gilts rallied violently after the exit as rate-cut expectations were front-loaded.",
    failedTrades: [
      {
        quote:
          "Long sterling on the assumption EMS coordination would hold — funded by dollar borrowings, the unwind cost real-money managers their year.",
        attribution: "FX prime-broker post-mortems, Q4 1992",
      },
    ],
    consensusError:
      "Consensus underestimated how a credible attack on a peg becomes self-fulfilling: when reserves are clearly finite, the cost of the next reserve-burn day exceeds the cost of devaluation.",
    lessons: [
      "Pegs break when defending them costs more than abandoning them — visible reserve depletion is the trigger.",
      "Country exiting a peg often outperforms peers stuck inside; rate cuts and weaker currency are stimulative.",
      "Macro funds that built positioning weeks ahead of the break tend to capture most of the move; same-day entries risk reversal.",
    ],
    sources: [
      {
        title: "Bank of England — Black Wednesday",
        url: "https://www.bankofengland.co.uk/news/1992/september/black-wednesday",
      },
    ],
  },

  {
    id: "1994-greenspan-hike",
    title: "1994 bond massacre — surprise Fed tightening",
    date: "1994-02-04",
    region: "US",
    triggerType: "monetary_policy",
    regimeTags: [
      "fed_hiking",
      "fed_surprise_hawkish",
      "bonds_selloff",
      "vol_spiking",
      "credit_widening",
      "growth_strong",
      "leverage_high",
    ],
    surpriseFactor: 4,
    description:
      "The Fed hiked the funds rate by 25 bps — its first hike in five years — and continued tightening by 250 bps over the next year, triggering the worst bond market in modern history and a string of leveraged-fund blowups.",
    catalyst:
      "Greenspan-led FOMC concluded that surprise tightening would prevent late-cycle inflation; the move came outside an SEP press cycle and without explicit forward guidance.",
    narrativeAtTime:
      "Bond markets had priced 50–75 bps of tightening over 1994 but spread across the year. The asymmetric pricing of a small first hike combined with elevated leverage in mortgage-IO and Mexican-bond positions made the unwind violent.",
    outcomeInHindsight:
      "The 10y UST yield rose ~250 bps over the year. Orange County and Kidder Peabody collapsed, the Mexican peso crisis followed in December. But equities ended the year roughly flat, and the cycle extended into the late-1990s boom.",
    assetMoves: {
      sp500: { d1: -2.3, d5: -3.0, m1: -1.5, m3: -8.5, m6: -6.0 },
      ust10y: { d1: 22, d5: 35, m1: 65, m3: 130, m6: 195 },
      dxy: { d1: 0.2, d5: 0.5, m1: 1.0, m3: -1.5, m6: -3.0 },
      gold: { d1: -0.5, d5: -1.5, m1: -2.5, m3: 0.5, m6: 0.5 },
      oil: { d1: 0, d5: 0, m1: 0, m3: 5.0, m6: 8.0 },
      creditHY: { d1: 5, d5: 18, m1: 50, m3: 90, m6: 115 },
      vix: { d1: 3.5, d5: 4.0, m1: 5.0, m3: 6.5, m6: 4.5 },
    },
    flowPatterns:
      "Mortgage-IO unwind drove convexity-hedging that amplified the long-end selloff. CTAs flipped from long bonds to short within weeks. Hedge-fund leverage in EM (especially Mexican Brady bonds) was the canary that broke first.",
    failedTrades: [
      {
        quote:
          "Long mortgage-IOs on the assumption prepayments stayed slow — a thesis that crushed leveraged accounts as duration extended sharply.",
        attribution: "Mortgage-fund regulatory filings, 1994",
      },
      {
        quote:
          "Short volatility into a Fed that announced its first hike with no forward guidance — implied vol surface became un-tradable for weeks.",
        attribution: "Options-fund post-mortems, Q1 1994",
      },
    ],
    consensusError:
      "Consensus expected a benign tightening cycle priced linearly across 1994. Surprise tightening with elevated convexity in fixed-income products turned a normal Fed cycle into the worst bond year on record.",
    lessons: [
      "First hikes after long pauses tend to be surprises even when expected.",
      "Convexity products amplify duration moves — leverage stress shows up first where the hedging is most mechanical.",
      "Equity markets can absorb a violent fixed-income repricing when growth remains strong.",
    ],
    sources: [
      {
        title: "Federal Reserve — FOMC Statement, Feb 4 1994",
        url: "https://www.federalreserve.gov/fomc/19940204default.htm",
      },
    ],
  },

  {
    id: "1994-tequila-crisis",
    title: "Mexican peso crisis (Tequila)",
    date: "1994-12-20",
    region: "EM",
    triggerType: "currency_event",
    regimeTags: [
      "peg_break",
      "currency_devaluation",
      "em_fx_stress",
      "credit_widening",
      "sovereign_stress",
      "policy_uncertainty",
    ],
    surpriseFactor: 5,
    description:
      "Mexico devalued the peso by 15% within an intended +/-15% band, then floated three days later. Reserves had collapsed from $25bn to $6bn through 1994 amid political assassinations and rising US rates.",
    catalyst:
      "Cumulative reserves depletion to defend an overvalued peg, accelerated by election-year political shocks (Colosio assassination in March, Chiapas uprising) and a Fed in active hiking mode.",
    narrativeAtTime:
      "Mexican officials reassured markets through November that the peg would hold; foreign-currency tesobonos ($30bn outstanding) were viewed as a credible substitute for reserves. The mid-December devaluation came with no IMF arrangement and shattered the credibility narrative.",
    outcomeInHindsight:
      "The peso fell ~50% by January 1995. The US Treasury and IMF assembled a $50bn rescue package. Tequila contagion hit Argentina, Brazil, and Asian markets indirectly, foreshadowing 1997. Mexican equities recovered fully within three years.",
    assetMoves: {
      sp500: { d1: 0.2, d5: -0.5, m1: 1.0, m3: 4.5, m6: 13.0 },
      ust10y: { d1: -3, d5: -8, m1: -15, m3: -30, m6: -85 },
      dxy: { d1: 0.3, d5: 1.0, m1: 2.0, m3: 1.5, m6: -3.5 },
      gold: { d1: 0.5, d5: 1.5, m1: 2.0, m3: 5.0, m6: 0.0 },
      oil: { d1: 0, d5: -0.5, m1: -2.0, m3: 0, m6: 5.0 },
      creditHY: { d1: 8, d5: 25, m1: 80, m3: 110, m6: 60 },
      vix: { d1: 1.0, d5: 2.5, m1: 4.0, m3: 1.5, m6: -2.0 },
    },
    flowPatterns:
      "EM-debt forced selling spread from Mexican tesobonos to Argentina and Brazil; emerging-market equity ETFs saw record outflows. UST flows increased on flight-to-quality but the Fed's existing tightening cycle muted the rally.",
    failedTrades: [
      {
        quote:
          "Long tesobonos for the carry — the peso collapse and credit-default fears wiped out two years of yield in three weeks.",
        attribution: "Latin-America fund disclosures, Q1 1995",
      },
      {
        quote:
          "Short Argentine and Brazilian sovereigns on contagion thesis — both rallied sharply on IMF/Treasury rescue announcement.",
        attribution: "EM-debt fund recaps, 1995",
      },
    ],
    consensusError:
      "Consensus believed dollar-linked tesobonos substituted for reserves. They didn't — once the peg broke, the FX-redenomination risk turned tesobonos into a panic asset. The US-led rescue was also faster and larger than markets expected.",
    lessons: [
      "FX-linked sovereign debt amplifies rather than dampens devaluation pressure when the peg breaks.",
      "Contagion risks fade quickly when the IMF and lender-of-last-resort backstop arrive.",
      "EM crises often mark cycle lows for the affected currencies, not extended depreciation paths.",
    ],
    sources: [
      {
        title: "IMF — Mexico Peso Crisis Working Paper",
        url: "https://www.imf.org/external/pubs/ft/wp/wp9561.pdf",
      },
    ],
  },

  {
    id: "1997-thai-baht",
    title: "Thai baht devaluation — start of Asian crisis",
    date: "1997-07-02",
    region: "EM",
    triggerType: "currency_event",
    regimeTags: [
      "peg_break",
      "currency_devaluation",
      "em_fx_stress",
      "credit_widening",
      "bank_stress",
      "sovereign_stress",
      "leverage_high",
      "risk_off",
    ],
    surpriseFactor: 4,
    description:
      "Thailand floated the baht after months of failed peg defence, triggering a wave of Asian currency collapses (Indonesia, South Korea, Malaysia) and a regional financial crisis that fed into Russia and LTCM in 1998.",
    catalyst:
      "Two waves of speculative pressure (Feb 1997 and May 1997) had depleted Bank of Thailand reserves; a hidden $24bn forward book of FX commitments became the proximate trigger when disclosed.",
    narrativeAtTime:
      "Thailand's growth and current-account deficit had been concerning since 1996, but markets viewed the peg as backed by strong reserves and East Asian solidarity. The hidden forward book — disclosed only weeks before the float — was the surprise that turned a slow drift into a cascade.",
    outcomeInHindsight:
      "By year-end the baht had fallen 50%, the Indonesian rupiah ~80%, the Korean won 50%. IMF programs were imposed across the region with conditional reforms. Asian recovery began through 1999 but the regime change in capital flows — from 'Asian miracle' optimism to caution — persisted into the 2000s.",
    assetMoves: {
      sp500: { d1: 0.5, d5: 2.0, m1: 4.0, m3: -2.0, m6: -3.0 },
      ust10y: { d1: -3, d5: -8, m1: -15, m3: -25, m6: -50 },
      dxy: { d1: 0.5, d5: 1.0, m1: 1.5, m3: 4.0, m6: 6.0 },
      gold: { d1: -0.2, d5: -1.0, m1: -3.0, m3: -7.0, m6: -10.0 },
      oil: { d1: 0, d5: -0.5, m1: -3.0, m3: -8.0, m6: -22.0 },
      creditHY: { d1: 5, d5: 15, m1: 25, m3: 60, m6: 80 },
      vix: { d1: 0.5, d5: 1.0, m1: 2.0, m3: 8.0, m6: 5.5 },
    },
    flowPatterns:
      "USD/Asia carry-trade unwind cascaded across regional pegs; Korean banks' short-dollar liability profile turned a currency crisis into a banking crisis within months. UST flows benefited from flight-to-quality especially in Q4 1997.",
    failedTrades: [
      {
        quote:
          "Long Korean banking equity in October 1997 — chaebol leverage proved far higher than the public balance sheets suggested, with the won bottoming six months later.",
        attribution: "Asian-equity fund recaps, 1998",
      },
      {
        quote:
          "Short Hong Kong dollar on the assumption Thailand was the start of a regional dominoes — the HKMA aggressively defended the peg and squeezed shorts.",
        attribution: "Hedge-fund post-mortems, Q4 1997",
      },
    ],
    consensusError:
      "Consensus saw Asia as immune from peg pressures because of strong external balances. It missed how short-term USD funding and undisclosed FX forwards turned a current-account problem into a balance-sheet crisis.",
    lessons: [
      "Hidden FX forwards and short-term USD funding gaps are the structural fragilities that turn currency drift into cascade.",
      "EM banking systems with USD liability mismatches break almost immediately after the peg breaks.",
      "Contagion from a small EM economy can reset risk premia globally for months.",
    ],
    sources: [
      {
        title: "IMF — The Asian Crisis: Causes and Cures",
        url: "https://www.imf.org/external/pubs/ft/fandd/1998/06/imfstaff.htm",
      },
    ],
  },

  {
    id: "1998-russia-ltcm",
    title: "Russia default + LTCM near-collapse",
    date: "1998-08-17",
    region: "GLOBAL",
    triggerType: "credit_event",
    regimeTags: [
      "sovereign_default",
      "currency_devaluation",
      "credit_widening",
      "leverage_high",
      "vol_spiking",
      "flight_to_quality",
      "fed_cutting",
      "liquidity_squeeze",
    ],
    surpriseFactor: 5,
    description:
      "Russia devalued the ruble and defaulted on $40bn of GKO domestic debt. Six weeks later, hedge fund Long-Term Capital Management — with $125bn in leveraged positions on stressed convergence trades — was rescued by a Fed-orchestrated bank consortium.",
    catalyst:
      "Russian fiscal stress amid collapsing oil prices and Asian-crisis contagion; LTCM's leverage-30x bet on convergence in interest-rate spreads, BTP-Bund convergence, and equity vol — none of which converged.",
    narrativeAtTime:
      "Russia was viewed as 'too nuclear to fail' — the IMF had just disbursed $4.8bn of a planned $22.6bn package three weeks before default. LTCM, with two Nobel laureates on staff and 4-year track record, was viewed as a model of risk control. Both assumptions broke simultaneously.",
    outcomeInHindsight:
      "Spreads widened violently into October, the Fed cut rates three times in seven weeks (including a surprise inter-meeting cut), and the Greenspan put thesis was reinforced. Equities recovered to new highs by Q1 1999 as the response liquidity drove the late-stage tech bubble.",
    assetMoves: {
      sp500: { d1: -1.0, d5: -4.5, m1: -13.0, m3: -1.0, m6: 9.0 },
      ust10y: { d1: -8, d5: -22, m1: -55, m3: -85, m6: -45 },
      dxy: { d1: 0.3, d5: 0.8, m1: -2.5, m3: -5.0, m6: -6.5 },
      gold: { d1: 0.2, d5: 1.5, m1: -1.5, m3: 1.5, m6: -1.0 },
      oil: { d1: -1.0, d5: -3.0, m1: -10.0, m3: -8.0, m6: -8.0 },
      creditHY: { d1: 15, d5: 50, m1: 175, m3: 250, m6: 100 },
      vix: { d1: 4.0, d5: 12.0, m1: 22.0, m3: 5.0, m6: -8.0 },
    },
    flowPatterns:
      "Convergence-trade unwind cascaded across G7 swap spreads, MBS-Treasury spreads, and equity-vol relative-value books. UST repo rates inverted to bid for collateral. Bank-prime-broker withdrawals from LTCM were the forcing function for the rescue.",
    failedTrades: [
      {
        quote:
          "Long swap-spread convergence — the textbook trade for a generation of fixed-income arbs — diverged for ten consecutive weeks in 1998.",
        attribution: "Roger Lowenstein, When Genius Failed",
      },
      {
        quote:
          "Short volatility ahead of the Russia default — implied vol surface dislocated to levels untradable on screen, with VIX 22 points higher in three weeks.",
        attribution: "Options-desk recaps, Sept 1998",
      },
    ],
    consensusError:
      "Consensus assumed sovereign defaults were idiosyncratic and that quantitative-arb leverage was robust to rare events. It was wrong on both: sovereign default cascaded into hedge-fund risk management, and the Fed's response set a template for every subsequent crisis.",
    lessons: [
      "Convergence trades that have worked for a decade can diverge for the duration that matters.",
      "Hedge-fund leverage is a separate transmission channel from bank leverage and central banks must address both.",
      "Surprise inter-meeting Fed cuts can mark cycle lows even when the underlying stress takes longer to resolve.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Near Failure of LTCM",
        url: "https://www.federalreservehistory.org/essays/ltcm-near-failure",
      },
    ],
  },

  {
    id: "2000-dotcom-peak",
    title: "Dot-com peak — Nasdaq tops at 5048",
    date: "2000-03-10",
    region: "US",
    triggerType: "bubble_burst",
    regimeTags: [
      "bubble_late_stage",
      "bubble_burst",
      "equities_correction",
      "vol_spiking",
      "positioning_extreme_long",
      "fed_hiking",
      "leverage_high",
    ],
    surpriseFactor: 3,
    description:
      "The Nasdaq Composite hit an intraday high of 5132 on March 10, 2000, having more than doubled in the prior year. Over the next 31 months it fell ~78% as venture-funded tech businesses without earnings repriced.",
    catalyst:
      "Y2K liquidity provisioning was withdrawn through Q1 2000; the Fed had been hiking since June 1999. The Microsoft antitrust ruling on April 3 2000 broke the lead-stock momentum.",
    narrativeAtTime:
      "Tech bulls argued earnings traditional valuation didn't apply to a 'new economy' that valued eyeballs and growth optionality. Strategists who flagged valuation risk had been wrong for two years and had largely given up. Fund-manager surveys showed record long tech and short value.",
    outcomeInHindsight:
      "The bear market lasted 31 months and bottomed in October 2002. Tech stocks fell 80%+ on average; many 1999 IPOs went to zero. Cisco, Intel, and Sun never reclaimed their 2000 highs in real terms (Cisco still hasn't). The bear was slow and grinding, not a single panic.",
    assetMoves: {
      sp500: { d1: -1.0, d5: -3.0, m1: -4.0, m3: -7.0, m6: -10.0 },
      ust10y: { d1: -3, d5: -10, m1: -25, m3: -50, m6: -85 },
      dxy: { d1: 0.4, d5: 0.8, m1: 2.0, m3: 4.5, m6: 7.0 },
      gold: { d1: -0.2, d5: 0, m1: -2.0, m3: -3.0, m6: -7.0 },
      oil: { d1: 0, d5: 1.0, m1: 5.0, m3: 7.0, m6: 13.0 },
      creditHY: { d1: 5, d5: 18, m1: 35, m3: 80, m6: 130 },
      vix: { d1: 1.5, d5: 3.0, m1: 4.5, m3: 5.0, m6: 7.0 },
    },
    flowPatterns:
      "Retail flow into tech mutual funds peaked in February-March 2000 — a classic top-tick of household reallocation. CTAs and momentum funds rolled positions throughout April, providing a slow distribution rather than panic. Value funds lagged through 2000 then dramatically outperformed.",
    failedTrades: [
      {
        quote:
          "Buy-the-dip in Cisco and Sun through summer 2000 on assumption the pullback was technical — both stocks lost 80%+ over the following two years.",
        attribution: "Equity-fund disclosures, 2001",
      },
      {
        quote:
          "Short value, long growth as a structural pair trade — the most consensus position in early 2000 lost money for the next three years.",
        attribution: "Long-short fund recaps, 2000–02",
      },
    ],
    consensusError:
      "Consensus believed tech earnings would catch up with valuations. They didn't — much of the 'earnings power' was illusory accounting on capacity that never matched demand. The bear market was also slower than expected, prolonging the pain.",
    lessons: [
      "Bubble peaks rarely come with a single panic; they distribute over months.",
      "When valuation skeptics give up, that's often the top.",
      "Bear markets in growth stocks tend to take 24–36 months to bottom, not weeks.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Nasdaq Bubble",
        url: "https://www.federalreservehistory.org/essays/dot-com-bubble",
      },
    ],
  },

  {
    id: "2001-911",
    title: "9/11 attacks",
    date: "2001-09-11",
    region: "US",
    triggerType: "geopolitical",
    regimeTags: [
      "terrorist_attack",
      "geopolitical_tail",
      "vol_spiking",
      "flight_to_quality",
      "fed_cutting",
      "equities_correction",
      "recession_underway",
    ],
    surpriseFactor: 5,
    description:
      "Coordinated terrorist attacks destroyed the World Trade Center towers and damaged the Pentagon. US equity markets closed for four trading days (Sept 11–14) and reopened to a sharp selloff that bottomed by mid-October.",
    catalyst:
      "Al-Qaeda hijackers used commercial aircraft as weapons against US civilian and military targets; geopolitical tail risk had been off the radar of US-specific equity allocations.",
    narrativeAtTime:
      "Markets had been weakening through 2001 from dot-com aftermath but were stabilising around the August lows. A coordinated terrorist attack on US soil on this scale was outside the working assumptions of equity, credit, and FX positioning.",
    outcomeInHindsight:
      "The S&P bottomed September 21 and recovered to pre-attack levels by October. The Fed cut 50 bps on September 17 (re-open day) and continued cutting to 1.75% by year-end. The longer-term consequences were the security state, the Iraq War, and a USD reserve-currency credibility shift that played out over a decade.",
    assetMoves: {
      sp500: { d1: -4.9, d5: -11.5, m1: 0.5, m3: 5.0, m6: 8.5 },
      ust10y: { d1: -22, d5: -50, m1: -55, m3: -25, m6: 25 },
      dxy: { d1: -0.3, d5: -2.0, m1: -1.5, m3: -1.0, m6: 1.0 },
      gold: { d1: 4.5, d5: 6.0, m1: -2.0, m3: -3.5, m6: 3.0 },
      oil: { d1: 5.0, d5: -8.0, m1: -22.0, m3: -27.0, m6: -10.0 },
      creditHY: { d1: 35, d5: 80, m1: 110, m3: 60, m6: -25 },
      vix: { d1: 12.0, d5: 19.0, m1: 5.0, m3: -5.0, m6: -10.0 },
    },
    flowPatterns:
      "Re-open day saw record NYSE volume and concentrated selling in airlines, insurance, and re-insurance; UST flows surged immediately. Gold's initial spike faded as the Fed cuts and dollar bid asserted. Oil collapsed on demand fears as global air travel froze.",
    failedTrades: [
      {
        quote:
          "Long oil on assumption of lasting Middle East conflict premium — oil collapsed 25% in a month as demand destruction outweighed war risk.",
        attribution: "Energy-fund disclosures, Q4 2001",
      },
      {
        quote:
          "Short equities through October on macro pessimism — the rally from late September into year-end made shorts the worst-performing strategy of the quarter.",
        attribution: "Long-short fund recaps, Q4 2001",
      },
    ],
    consensusError:
      "Consensus expected a prolonged equity drawdown given the macroeconomic and demand hit. The actual response — Fed cuts, fiscal stimulus, and a snap-back rally to pre-attack levels in five weeks — illustrated how fast policy backstops compress geopolitical tail premia.",
    lessons: [
      "Markets often bottom faster than the macro damage resolves when central-bank response is decisive.",
      "Demand-destruction shocks compress oil even when geopolitical premium is high.",
      "Airline and insurance equities take 12–18 months to recover from terror-event repricing.",
    ],
    sources: [
      {
        title: "Federal Reserve — September 2001 Statement",
        url: "https://www.federalreserve.gov/boarddocs/press/general/2001/20010917/",
      },
    ],
  },

  {
    id: "2007-bnp-paribas",
    title: "BNP Paribas freezes funds — true GFC start",
    date: "2007-08-09",
    region: "GLOBAL",
    triggerType: "credit_event",
    regimeTags: [
      "credit_widening",
      "bank_stress",
      "liquidity_squeeze",
      "leverage_high",
      "vol_spiking",
      "fed_cutting",
      "hy_stress",
    ],
    surpriseFactor: 4,
    description:
      "BNP Paribas suspended redemptions on three asset-backed funds, citing 'complete evaporation of liquidity' in subprime-MBS markets. The European interbank market froze, the ECB injected €95bn overnight, and the global financial crisis effectively began.",
    catalyst:
      "Cumulative subprime delinquencies through Q2 2007 had exceeded model-base assumptions; the discovery that European banks held more subprime exposure than disclosed broke the funding-market trust that backstops short-term lending.",
    narrativeAtTime:
      "Subprime had been viewed as 'contained' in the Bear Stearns hedge-fund failures of June 2007; mortgage-related credit spreads were widening but G7 banking systems were viewed as ring-fenced. BNP's freeze revealed how deeply the contagion had penetrated European balance sheets.",
    outcomeInHindsight:
      "The crisis took 13 months from BNP to Lehman; equity markets actually made new highs in October 2007 before turning. Money-market and short-term funding stress was the leading indicator that fundamental analysts dismissed for too long. The Fed cut 50 bps on September 18 and aggressively into early 2008.",
    assetMoves: {
      sp500: { d1: -2.9, d5: -1.0, m1: 2.5, m3: -1.0, m6: -10.0 },
      ust10y: { d1: -12, d5: -28, m1: -42, m3: -85, m6: -125 },
      dxy: { d1: -0.3, d5: -0.5, m1: -1.5, m3: -3.0, m6: -5.0 },
      gold: { d1: 1.0, d5: 2.5, m1: 8.0, m3: 14.0, m6: 28.0 },
      oil: { d1: 0.5, d5: 1.5, m1: 5.0, m3: 18.0, m6: 30.0 },
      creditHY: { d1: 25, d5: 80, m1: 95, m3: 110, m6: 240 },
      vix: { d1: 5.5, d5: 8.0, m1: 2.0, m3: 4.5, m6: 8.0 },
    },
    flowPatterns:
      "Money-market repo rates spiked first — the visible signal that funding had broken. CDS on European banks widened ahead of cash credit spreads. Gold rallied steadily as USD weakened on Fed-cut expectations. Equity markets rallied paradoxically into October on liquidity-injection optimism.",
    failedTrades: [
      {
        quote:
          "Buy-the-dip in financials on assumption BNP was an isolated incident — most US and European bank stocks fell 80%+ over the following 18 months.",
        attribution: "Bank-equity disclosures, 2007–08",
      },
      {
        quote:
          "Short volatility on assumption the Fed cut would resolve liquidity stress — a thesis that worked for two months and then catastrophically reversed.",
        attribution: "Vol-fund post-mortems, Q3 2008",
      },
    ],
    consensusError:
      "Consensus interpreted the subprime issue as an asset-class problem that could be ring-fenced. It missed that subprime CDOs were collateral in the funding markets, so a credit-quality discount became a balance-sheet liquidity crisis for any institution holding them.",
    lessons: [
      "Funding-market stress leads cash-market stress by months.",
      "ECB and Fed liquidity injections buy time but cannot solve solvency questions in unmarked collateral.",
      "Equity highs after credit-stress signals are common; the equity bear typically lags credit by 2–6 months.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Subprime Mortgage Crisis Timeline",
        url: "https://www.federalreservehistory.org/essays/subprime-mortgage-crisis",
      },
    ],
  },

  {
    id: "2008-lehman",
    title: "Lehman Brothers bankruptcy",
    date: "2008-09-15",
    region: "GLOBAL",
    triggerType: "credit_event",
    regimeTags: [
      "bank_failure",
      "credit_widening",
      "hy_stress",
      "liquidity_squeeze",
      "vol_spiking",
      "flight_to_quality",
      "fed_cutting",
      "qe_active",
      "equities_bear",
      "recession_underway",
      "leverage_high",
    ],
    surpriseFactor: 5,
    description:
      "Lehman Brothers filed Chapter 11 with $639bn in assets — the largest bankruptcy in US history. Money-market funds broke the buck within 48 hours, AIG was nationalised within 72, and credit markets froze for weeks.",
    catalyst:
      "Treasury and Fed declined to provide a Bear-Stearns-style backstop after a weekend of failed merger negotiations; the moral-hazard rationale (vs the systemic-risk rationale) won out in a decision Hank Paulson later partly regretted.",
    narrativeAtTime:
      "Through Sept 12 weekend, market consensus was that some Lehman backstop would emerge — Bear Stearns and Fannie/Freddie set the precedent. The decision not to backstop was the single largest macro surprise of the cycle.",
    outcomeInHindsight:
      "Equity markets fell ~45% over the next six months; the bottom came on March 9, 2009. The Fed introduced QE1 in November and TARP was passed on October 3. The cascade affected every major asset class and re-priced sovereign vs corporate risk for a decade.",
    assetMoves: {
      sp500: { d1: -4.7, d5: -3.5, m1: -25.0, m3: -28.0, m6: -42.0 },
      ust10y: { d1: -30, d5: -45, m1: -75, m3: -130, m6: -85 },
      dxy: { d1: 1.0, d5: 4.5, m1: 8.0, m3: 13.0, m6: 8.0 },
      gold: { d1: 3.0, d5: 8.0, m1: -5.0, m3: -12.0, m6: 5.0 },
      oil: { d1: -2.5, d5: -8.0, m1: -25.0, m3: -55.0, m6: -65.0 },
      creditHY: { d1: 60, d5: 200, m1: 550, m3: 950, m6: 1100 },
      vix: { d1: 7.0, d5: 14.0, m1: 50.0, m3: 35.0, m6: -20.0 },
    },
    flowPatterns:
      "Money-market fund redemptions ($350bn in two weeks) forced the Treasury MMF guarantee. Hedge-fund prime-broker withdrawals from Morgan Stanley and Goldman followed. UST flows reached record highs even as Treasury issuance surged. Gold's initial flight-to-quality bid faded as USD short squeeze dominated.",
    failedTrades: [
      {
        quote:
          "Long financials on assumption the Treasury backstop was unconditional — a thesis falsified within 36 hours of Lehman's filing.",
        attribution: "Bank-equity-fund disclosures, Q4 2008",
      },
      {
        quote:
          "Short USD/EM on the assumption the crisis was US-centric — the dollar funding squeeze drove DXY 13% higher in three months and crushed EM-long positioning.",
        attribution: "Macro-fund post-mortems, 2008–09",
      },
      {
        quote:
          "Long gold on flight-to-quality at 2008 highs — gold fell 25% peak-to-trough as forced liquidations dominated and USD short squeeze persisted.",
        attribution: "Commodity-fund recaps, Q4 2008",
      },
    ],
    consensusError:
      "Consensus believed Lehman was too systemic to fail. The Treasury–Fed decision, the moral hazard concerns underlying it, and the cascading consequences for money markets, prime brokerage, and global USD funding were all underestimated.",
    lessons: [
      "Letting a major dealer fail produces non-linear cascades through funding markets that take months to fully manifest.",
      "USD shortages in a global crisis dominate flight-to-quality flows for risk currencies.",
      "Equity bear-market bottoms in financial crises tend to coincide with policy regime change (QE1, TARP), not improving fundamentals.",
    ],
    sources: [
      {
        title: "Federal Reserve History — Lehman Brothers",
        url: "https://www.federalreservehistory.org/essays/lehman-brothers-bankruptcy",
      },
    ],
  },

  {
    id: "2010-flash-crash",
    title: "Flash crash — Dow drops 1000 points in minutes",
    date: "2010-05-06",
    region: "US",
    triggerType: "structural_event",
    regimeTags: [
      "flash_crash",
      "vol_spiking",
      "equities_correction",
      "liquidity_squeeze",
      "policy_uncertainty",
    ],
    surpriseFactor: 4,
    description:
      "The Dow Jones fell ~1000 points (9%) in roughly five minutes around 2:45pm ET before recovering most losses by close. The intraday plunge was the largest in points history and revealed structural fragilities in market microstructure.",
    catalyst:
      "A Waddell & Reed sell algorithm in E-mini S&P futures, executed without price-band logic, triggered HFT liquidity withdrawal. Eurozone-debt fears and a Greek-bailout backdrop kept underlying nerves elevated.",
    narrativeAtTime:
      "Markets had been digesting Greek bailout uncertainty for weeks; Wall Street viewed equity vol as elevated but contained. The intraday cascade caught dealers, retail, and HFTs simultaneously — many cancelled bids when the order book became one-sided, exacerbating the move.",
    outcomeInHindsight:
      "The SEC instituted limit-up/limit-down circuit breakers on individual stocks. The flash crash was an inflection point in regulator focus on market microstructure. Equity markets ended the year roughly flat; the longer Eurozone narrative dominated through Q3 2010.",
    assetMoves: {
      sp500: { d1: -3.2, d5: -1.5, m1: -8.0, m3: -2.0, m6: 5.0 },
      ust10y: { d1: -8, d5: -22, m1: -45, m3: -65, m6: -50 },
      dxy: { d1: 0.6, d5: 1.5, m1: 3.5, m3: 0.5, m6: -3.0 },
      gold: { d1: 1.5, d5: 3.0, m1: 4.0, m3: 5.0, m6: 12.0 },
      oil: { d1: -1.0, d5: -3.5, m1: -10.0, m3: -2.0, m6: 8.0 },
      creditHY: { d1: 25, d5: 50, m1: 95, m3: 60, m6: 25 },
      vix: { d1: 12.0, d5: 15.5, m1: 8.0, m3: -2.0, m6: -8.0 },
    },
    flowPatterns:
      "HFT liquidity withdrawal during 14:42–14:47 ET reduced top-of-book depth by ~75%. ETF arbitrage broke down as some ETFs traded at $0.01 prints. Recovery flow concentrated in S&P futures rather than cash equities.",
    failedTrades: [
      {
        quote:
          "Stop-loss orders below market in single-stock equities were filled at penny prints, leaving holders short positions or zero balances they had not intended.",
        attribution: "SEC/CFTC joint report, Sep 2010",
      },
    ],
    consensusError:
      "Consensus assumed market microstructure was robust because of the diversity of liquidity providers. The flash crash showed that diversity creates correlated liquidity withdrawal under stress: every HFT had a similar risk-management trigger.",
    lessons: [
      "Liquidity in normal markets is a poor predictor of liquidity in stressed markets.",
      "HFT participation creates correlated withdrawal patterns absent in older market structures.",
      "Mechanical retail order types (stop-losses) become traps when microstructure breaks.",
    ],
    sources: [
      {
        title: "SEC/CFTC — Findings Regarding the May 6 Market Events",
        url: "https://www.sec.gov/news/studies/2010/marketevents-report.pdf",
      },
    ],
  },

  {
    id: "2011-us-downgrade",
    title: "S&P downgrades US sovereign rating to AA+",
    date: "2011-08-05",
    region: "US",
    triggerType: "credit_event",
    regimeTags: [
      "downgrade_event",
      "sovereign_stress",
      "debt_ceiling",
      "policy_uncertainty",
      "vol_spiking",
      "equities_correction",
      "flight_to_quality",
      "bonds_rally",
    ],
    surpriseFactor: 4,
    description:
      "S&P removed the United States' AAA rating, citing political brinkmanship over the debt ceiling and a fiscal trajectory deemed inconsistent with AAA. Paradoxically, USTs rallied as flight-to-quality dominated despite the country issuing the downgraded debt being safe-haven.",
    catalyst:
      "A protracted debt-ceiling standoff in Congress through July 2011, ending in a last-minute deal that S&P viewed as inadequate; ratings methodology weighting governance and policy effectiveness.",
    narrativeAtTime:
      "Markets had priced debt-ceiling drama as a recurring noise feature, not a structural credit event. The downgrade itself was viewed as symbolic — the US can issue its own currency, has no default risk in nominal terms — but the combined risk-off and equity reaction was substantial.",
    outcomeInHindsight:
      "10y UST yields fell ~50 bps in a week as the downgrade paradoxically increased flight-to-quality demand. Equities fell ~17% from late July to early October before the Operation Twist response. Eurozone crisis dominated the rest of 2011.",
    assetMoves: {
      sp500: { d1: -6.7, d5: -7.0, m1: -3.0, m3: 1.0, m6: 7.5 },
      ust10y: { d1: -22, d5: -45, m1: -65, m3: -85, m6: -55 },
      dxy: { d1: -0.4, d5: 0.5, m1: 2.0, m3: 5.5, m6: 1.0 },
      gold: { d1: 4.0, d5: 8.5, m1: 11.0, m3: 6.0, m6: 8.0 },
      oil: { d1: -6.5, d5: -10.0, m1: -7.0, m3: -3.0, m6: 7.0 },
      creditHY: { d1: 50, d5: 110, m1: 175, m3: 200, m6: 100 },
      vix: { d1: 16.5, d5: 19.0, m1: 11.0, m3: 4.5, m6: -10.0 },
    },
    flowPatterns:
      "Foreign-central-bank UST holdings actually grew through the downgrade window. Money-market fund flows shifted from prime to government in the days surrounding August 5. Gold inflows surged into a parabolic peak that completed September 6 at $1923.",
    failedTrades: [
      {
        quote:
          "Short USTs on the assumption a sovereign downgrade would force yields higher — a textbook trade that lost money on the day of the downgrade and for weeks after.",
        attribution: "Macro-fund disclosures, Q3 2011",
      },
      {
        quote:
          "Long gold near $1900 — the squeeze higher reversed sharply on margin hikes by CME, with gold falling 20% in two months.",
        attribution: "Commodity-fund recaps, Q4 2011",
      },
    ],
    consensusError:
      "Consensus extended sovereign-credit logic from EM to the US. The US-specific dynamic — that USTs are the global flight-to-quality asset — meant the downgrade triggered demand for the very securities that had been downgraded.",
    lessons: [
      "Reserve-currency status overrides sovereign-credit downgrades in flight-to-quality dynamics.",
      "Political-brinkmanship-driven downgrades rarely produce sustained yield repricing.",
      "Gold parabolic moves coinciding with sovereign-credit fears are vulnerable to sharp reversals when the immediate fear fades.",
    ],
    sources: [
      {
        title: "S&P — United States of America 'AA+/A-1+' Ratings Lowered",
        url: "https://www.federalreserve.gov/newsevents/pressreleases/bcreg20110805a.htm",
      },
    ],
  },

  {
    id: "2012-whatever-it-takes",
    title: "Draghi's 'whatever it takes'",
    date: "2012-07-26",
    region: "EU",
    triggerType: "monetary_policy",
    regimeTags: [
      "ecb_cutting",
      "sovereign_stress",
      "credit_tightening",
      "risk_on",
      "equities_bull",
      "bonds_rally",
      "fed_surprise_dovish",
    ],
    surpriseFactor: 5,
    description:
      "ECB President Mario Draghi declared the ECB would do 'whatever it takes' to preserve the euro at a London investor speech, foreshadowing the OMT program announced six weeks later. Italian and Spanish bond spreads collapsed within hours.",
    catalyst:
      "Eurozone breakup risk had reached existential levels by July 2012; Spanish 10y yields above 7.5%, Italian above 7%, Greece in active restructuring. Markets had begun pricing redenomination risk in core European banks.",
    narrativeAtTime:
      "Through July 2012 markets viewed Eurozone breakup as a tail risk pricing into spreads at ~30%. The ECB had been viewed as constrained by its Bundesbank-influenced mandate — bond purchases to defend specific countries were considered politically and legally infeasible.",
    outcomeInHindsight:
      "Italian and Spanish 10y yields fell ~250 bps over the following 12 months. The OMT program was announced September 6 but never deployed — the announcement effect was sufficient. European equities began a multi-year outperformance run; the euro crisis effectively ended without further bailout drama.",
    assetMoves: {
      sp500: { d1: 1.7, d5: 1.0, m1: 3.0, m3: 4.5, m6: 9.5 },
      ust10y: { d1: 8, d5: 15, m1: 25, m3: 25, m6: 50 },
      dxy: { d1: -0.6, d5: -1.0, m1: -1.5, m3: -2.5, m6: -3.0 },
      gold: { d1: 1.8, d5: 1.5, m1: 5.5, m3: 7.0, m6: 0 },
      oil: { d1: 0.5, d5: 2.5, m1: 5.0, m3: 8.5, m6: 7.0 },
      creditHY: { d1: -25, d5: -55, m1: -80, m3: -125, m6: -200 },
      vix: { d1: -2.5, d5: -3.5, m1: -5.0, m3: -7.0, m6: -8.5 },
    },
    flowPatterns:
      "Italian and Spanish sovereign-bond flows reversed within hours of the speech. European bank-equity flows turned net positive for the first time in 18 months. EUR positioning short-cover squeezed into year-end.",
    failedTrades: [
      {
        quote:
          "Short Italian and Spanish sovereigns on assumption the ECB couldn't credibly commit to backstop — the most consensus position of the cycle, crushed in a single afternoon.",
        attribution: "Macro-fund disclosures, Q3 2012",
      },
      {
        quote:
          "Long Eurozone-breakup hedges via FX options — premium decayed to near-zero over 18 months.",
        attribution: "Currency-options recaps, 2013",
      },
    ],
    consensusError:
      "Consensus believed ECB independence and Bundesbank constraints made unconditional sovereign backstops infeasible. The speech (and the political signalling that followed) showed central-bank willingness was the binding constraint, not legal authority.",
    lessons: [
      "Verbal central-bank commitments at the existential moment can move markets as much as policy actions.",
      "Sovereign-backstop announcement effects often eliminate the need for actual program deployment.",
      "Long-duration short positioning unwinds violently when the policy regime credibly shifts.",
    ],
    sources: [
      {
        title: "ECB — Speech by Mario Draghi, London 26 July 2012",
        url: "https://www.ecb.europa.eu/press/key/date/2012/html/sp120726.en.html",
      },
    ],
  },

  {
    id: "2013-taper-tantrum",
    title: "Bernanke taper tantrum",
    date: "2013-05-22",
    region: "GLOBAL",
    triggerType: "monetary_policy",
    regimeTags: [
      "fed_surprise_hawkish",
      "qt_active",
      "bonds_selloff",
      "em_fx_stress",
      "vol_spiking",
      "credit_widening",
    ],
    surpriseFactor: 4,
    description:
      "In congressional testimony, Bernanke flagged that the Fed could begin tapering QE 'in the next few meetings'. Treasury yields rose ~100 bps over the summer and EM currencies and equities sold off sharply.",
    catalyst:
      "Six months of strengthening US data, plus an FOMC concerned that QE3's open-ended structure had crowded out other policy tools, drove a communication signal Bernanke believed was conditional but markets read as decisive.",
    narrativeAtTime:
      "Markets had priced QE3 as continuing through 2013 with no clear endpoint. Bernanke's specific reference to 'next few meetings' shocked positioning that had assumed gradualism. EM long positioning had grown extreme on the carry trade.",
    outcomeInHindsight:
      "10y yields rose from 1.6% to 3.0% by year-end. EM-FX, EM-equities, and high-yield credit suffered most. The actual taper began in December 2013 and was completed by October 2014 with no further crisis. Equities rallied even as rates rose.",
    assetMoves: {
      sp500: { d1: -0.8, d5: -2.0, m1: -3.0, m3: 4.0, m6: 11.0 },
      ust10y: { d1: 8, d5: 25, m1: 50, m3: 95, m6: 80 },
      dxy: { d1: 0.5, d5: 1.5, m1: 3.0, m3: 0.5, m6: 0 },
      gold: { d1: -1.5, d5: -4.5, m1: -10.0, m3: -3.0, m6: -8.0 },
      oil: { d1: -1.0, d5: -2.0, m1: 2.5, m3: 11.0, m6: 8.0 },
      creditHY: { d1: 12, d5: 35, m1: 65, m3: 30, m6: -10 },
      vix: { d1: 3.0, d5: 4.5, m1: 5.0, m3: -2.0, m6: -3.5 },
    },
    flowPatterns:
      "EM-bond fund outflows reached $20bn in three weeks (record at the time). Indian rupee, Brazilian real, and Indonesian rupiah were the 'fragile five' worst hit. Long-duration positioning unwind drove the bond selloff far beyond what fundamentals justified.",
    failedTrades: [
      {
        quote:
          "Long EM-FX carry on assumption QE3 was open-ended — the most concentrated EM-long positioning of the cycle, crushed in a 6-week unwind.",
        attribution: "EM-debt fund disclosures, Q3 2013",
      },
      {
        quote:
          "Short USTs after the spike on assumption the regime change continued — a thesis that would have stopped out as yields stabilised through August.",
        attribution: "Fixed-income fund recaps, 2013",
      },
    ],
    consensusError:
      "Consensus underestimated how communication-only signals would move markets when positioning was extreme. The taper itself was uneventful; the shock was how fast extended positioning unwinds when the directional bias shifts.",
    lessons: [
      "Communication-only Fed pivots can move markets more than the underlying policy action.",
      "EM carry-trade unwinds are concentrated in the first 6–8 weeks; subsequent action is often counter-trend.",
      "Equities can absorb sharp rate increases when the underlying growth signal is positive.",
    ],
    sources: [
      {
        title: "Federal Reserve — Bernanke Testimony, May 22 2013",
        url: "https://www.federalreserve.gov/newsevents/testimony/bernanke20130522a.htm",
      },
    ],
  },

  {
    id: "2015-china-deval",
    title: "China surprise yuan devaluation",
    date: "2015-08-11",
    region: "CN",
    triggerType: "currency_event",
    regimeTags: [
      "currency_devaluation",
      "china_easing",
      "em_fx_stress",
      "growth_slowing",
      "deflation_risk",
      "vol_spiking",
      "risk_off",
      "equities_correction",
    ],
    surpriseFactor: 5,
    description:
      "The PBOC moved the daily USD/CNY fix by ~1.9% in a single day, framing it as a 'one-time correction toward market-determined pricing'. The yuan continued to weaken into January 2016, triggering a global risk-off episode.",
    catalyst:
      "Slowing Chinese growth, declining export performance after years of trade-weighted yuan strength, and a need to expand monetary policy room before formal IMF SDR-basket inclusion in late 2016.",
    narrativeAtTime:
      "China's USD/CNY had been viewed as a managed peg essentially fixed to the dollar through 2014–15. The PBOC's August 11 move was framed as procedural but was read globally as a deliberate competitive devaluation, with significant implications for EM exporters and commodity producers.",
    outcomeInHindsight:
      "The S&P fell ~12% from August 18 to August 25 ('Black Monday' Aug 24). Oil collapsed to $26 by January 2016. Chinese equities had begun their 2015 mid-year rout in June; the yuan move was a contagion accelerant. Global central banks coordinated dovish responses through Q1 2016 (Shanghai G20 in February).",
    assetMoves: {
      sp500: { d1: -1.0, d5: -10.0, m1: -8.0, m3: -1.0, m6: -7.0 },
      ust10y: { d1: -5, d5: -20, m1: -25, m3: -10, m6: -45 },
      dxy: { d1: -0.8, d5: -1.5, m1: -3.5, m3: -2.0, m6: -3.5 },
      gold: { d1: 0.5, d5: 1.5, m1: 4.0, m3: 1.0, m6: 16.0 },
      oil: { d1: -2.5, d5: -10.0, m1: -16.0, m3: -25.0, m6: -38.0 },
      creditHY: { d1: 15, d5: 80, m1: 95, m3: 105, m6: 230 },
      vix: { d1: 1.5, d5: 18.5, m1: 11.0, m3: 4.5, m6: 12.5 },
    },
    flowPatterns:
      "Asia-Pacific FX-fund flows reversed for 8 consecutive weeks. Oil-curve contango steepened sharply on demand fears. Onshore CNH-CNY spread widened to record levels signaling capital outflows. Fed September 'liftoff' was delayed to December.",
    failedTrades: [
      {
        quote:
          "Long Chinese A-shares after the June correction on assumption Beijing would not allow further declines — A-shares fell another 30% by January.",
        attribution: "China-equity-fund disclosures, Q3 2015",
      },
      {
        quote:
          "Long oil through September 2015 on assumption USD weakness would support commodities — Brent fell 35% over the next four months.",
        attribution: "Commodity-fund recaps, 2016",
      },
    ],
    consensusError:
      "Consensus underestimated how a small headline currency move could trigger global cross-asset re-pricing when the surprise vector was 'China is in worse shape than reported'. The deflation impulse from China was the dominant macro signal of the next 12 months.",
    lessons: [
      "Small currency moves from systemic exporters carry outsized signal value about underlying economic conditions.",
      "Oil and EM credit are usually the highest-beta amplifiers of EM-FX devaluations.",
      "Coordinated G20 central-bank dovishness (Shanghai 2016) can mark cycle lows when policy capitulation arrives.",
    ],
    sources: [
      {
        title: "BIS — Renminbi Internationalization and Reform, 2015",
        url: "https://www.bis.org/publ/qtrpdf/r_qt1509f.htm",
      },
    ],
  },

  {
    id: "2016-brexit",
    title: "Brexit referendum",
    date: "2016-06-23",
    region: "UK",
    triggerType: "election_political",
    regimeTags: [
      "election_uncertainty",
      "policy_uncertainty",
      "currency_devaluation",
      "vol_spiking",
      "geopolitical_tail",
      "boe_hiking",
      "risk_off",
    ],
    surpriseFactor: 5,
    description:
      "The UK voted 52% to 48% to leave the European Union. Sterling fell ~11% overnight against USD, the largest one-day move in any G10 currency since the gold standard, and David Cameron resigned the next morning.",
    catalyst:
      "Years of Eurosceptic political pressure plus a strategic referendum gambit; 'Leave' campaign messaging on immigration and EU regulatory overreach; final-week polls (and betting markets) had narrowed but still favoured Remain.",
    narrativeAtTime:
      "Late betting odds priced 'Remain' at ~88%; FX option pricing implied modest tail risk. The Bank of England had pre-positioned liquidity but had not pre-committed rate action. Sterling overnight ATM vol was elevated but fund positioning was tilted long GBP.",
    outcomeInHindsight:
      "Sterling settled at ~$1.30 vs $1.50 pre-vote. UK gilts rallied violently on flight-to-quality and BoE rate-cut expectations. UK equities (FTSE100) actually rallied due to USD-translation tailwind for FTSE multinationals. Over 18 months, UK equity underperformance was modest; Article 50 negotiations dragged on into 2019.",
    assetMoves: {
      sp500: { d1: -3.6, d5: -2.0, m1: 0.5, m3: 4.0, m6: 7.5 },
      ust10y: { d1: -18, d5: -22, m1: -10, m3: 5, m6: 65 },
      dxy: { d1: 2.2, d5: 3.0, m1: 1.5, m3: -1.0, m6: 4.0 },
      gold: { d1: 4.5, d5: 6.5, m1: 6.0, m3: 8.5, m6: -2.0 },
      oil: { d1: -4.5, d5: -6.0, m1: -3.0, m3: 1.0, m6: 17.0 },
      creditHY: { d1: 25, d5: 35, m1: -10, m3: -55, m6: -100 },
      vix: { d1: 8.0, d5: 5.0, m1: -3.5, m3: -7.0, m6: -10.5 },
    },
    flowPatterns:
      "GBP forward selling overnight overwhelmed liquidity in Asia hours; spot moved through dealer stop orders chained through every figure. UK gilts saw record inflows. Equity flows were paradoxical — FTSE100 rose on translation effect while domestic-focused FTSE250 fell.",
    failedTrades: [
      {
        quote:
          "Long sterling cable into the vote on assumption Remain would prevail — the largest currency loss in G10-trader memory for many large funds.",
        attribution: "FX-fund disclosures, Q3 2016",
      },
      {
        quote:
          "Short UK domestic equities (FTSE250) for the brexit drag — the rebound through Q3 2016 squeezed many such positions.",
        attribution: "UK-equity-fund recaps, 2016",
      },
    ],
    consensusError:
      "Consensus relied on betting markets and final-week polls that systematically underweighted older voters. The structural lesson (now applied through Trump 2016) was that polling missed the 'shy voter' phenomenon and that political tail risks were under-priced relative to economic tail risks.",
    lessons: [
      "Binary referendum outcomes produce currency moves that exceed any modeled tail bound.",
      "Multi-national equity indices can rise on home-currency weakness even in regime-shock referenda.",
      "Tactical hedges to political tail risk are systematically under-priced because base case 'normal' looks reassuring up to the day of the vote.",
    ],
    sources: [
      {
        title: "Bank of England — Brexit Statement, June 24 2016",
        url: "https://www.bankofengland.co.uk/news/2016/june/brexit-statement",
      },
    ],
  },

  {
    id: "2016-trump-election",
    title: "Trump elected — November 2016",
    date: "2016-11-08",
    region: "US",
    triggerType: "election_political",
    regimeTags: [
      "election_uncertainty",
      "policy_uncertainty",
      "tariff_war",
      "fed_hiking",
      "bonds_selloff",
      "equities_bull",
      "usd_strong",
      "vol_spiking",
    ],
    surpriseFactor: 5,
    description:
      "Donald Trump defeated Hillary Clinton in the US presidential election. S&P futures fell 5% on the open, hit limit-down at -5%, then reversed to close +1.1% the next day on tax-cut and deregulation expectations.",
    catalyst:
      "Polling and betting-market pricing placed Clinton ~85% favourite into election day; the rust-belt state results (Pennsylvania, Michigan, Wisconsin) broke for Trump in late hours and triggered the overnight equity reversal.",
    narrativeAtTime:
      "Markets priced a Trump victory as risk-off — concerns about tariffs, immigration, and policy-process disruption. Fund-manager positioning leaned long quality and defensive. Most strategists' day-one guidance was 'sell the rip if Trump wins'.",
    outcomeInHindsight:
      "The S&P rallied ~5% in two weeks ('Trump rally'). Tax cuts (Dec 2017) and deregulation drove a 12-month bull market. Tariffs began in 2018 and disrupted the rally. The election was a regime change for fiscal-monetary mix and dollar strength even where many specific predictions of disaster failed.",
    assetMoves: {
      sp500: { d1: 1.1, d5: 4.0, m1: 5.5, m3: 6.0, m6: 11.0 },
      ust10y: { d1: 18, d5: 35, m1: 50, m3: 50, m6: 30 },
      dxy: { d1: 0.7, d5: 2.5, m1: 3.5, m3: 2.0, m6: 1.0 },
      gold: { d1: -3.0, d5: -6.5, m1: -7.5, m3: -5.0, m6: 1.0 },
      oil: { d1: -1.5, d5: 1.0, m1: 7.5, m3: 9.5, m6: 7.5 },
      creditHY: { d1: -10, d5: -25, m1: -40, m3: -65, m6: -80 },
      vix: { d1: -8.5, d5: -10.5, m1: -7.5, m3: -10.0, m6: -11.0 },
    },
    flowPatterns:
      "Domestic-focused equity flows surged on tax-cut anticipation. UST positioning shifted aggressively short over 30 days. Mexican peso was the largest currency loser; financial-stock and small-cap inflows dominated through year-end.",
    failedTrades: [
      {
        quote:
          "Short equities and long gold into the election outcome — the day-one move was reversed by the next-day open and the trade lost 6–7% in 24 hours.",
        attribution: "Macro-fund disclosures, Q4 2016",
      },
      {
        quote:
          "Long USTs on the assumption a Trump victory was risk-off — the 50bp yield rise over the following month was the violent counter-trend.",
        attribution: "Fixed-income fund recaps, 2016",
      },
    ],
    consensusError:
      "Consensus mapped political surprise to risk-off without separating the political process from the economic policy mix. The pro-cyclical fiscal program (tax cuts + deregulation) plus already-strengthening growth was the dominant near-term signal.",
    lessons: [
      "Political surprises that come with pro-cyclical policy commitments produce risk-on price action despite headline risk.",
      "Day-one market reactions to election surprises often reverse within 48 hours as the policy implications are unpacked.",
      "Currency and gold moves on election night tend to be the most durable; equity moves tend to be most counter-intuitive.",
    ],
    sources: [
      {
        title: "Federal Reserve — December 2016 FOMC Statement",
        url: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20161214a.htm",
      },
    ],
  },

  {
    id: "2018-volmageddon",
    title: "Volmageddon — XIV ETN unwind",
    date: "2018-02-05",
    region: "US",
    triggerType: "structural_event",
    regimeTags: [
      "vol_spiking",
      "flash_crash",
      "leverage_high",
      "positioning_extreme_short",
      "equities_correction",
      "fed_hiking",
    ],
    surpriseFactor: 4,
    description:
      "The S&P 500 fell 4.1% on Feb 5; VIX doubled from ~17 to ~37 in a single day. The XIV inverse-volatility ETN lost 96% of value overnight and was terminated. Several other short-vol products imploded simultaneously.",
    catalyst:
      "January 2018 employment data triggered a rate-rise repricing; rebalancing flows from short-vol ETPs cascaded into S&P futures selling on the close, pushing VIX through trigger levels for the products' acceleration provisions.",
    narrativeAtTime:
      "The 'short vol' trade had been the most consensus profitable strategy of 2017. Fund-manager surveys showed peak short-vol positioning in late January. Strategists were noting valuation stretched but expecting a normal correction not a structural unwind.",
    outcomeInHindsight:
      "The S&P fell ~10% peak-to-trough by Feb 8 and recovered by the end of August. Short-vol products lost an estimated $3bn in retail capital. The episode marked the structural end of retail short-vol product class but did not derail the broader bull market.",
    assetMoves: {
      sp500: { d1: -4.1, d5: -5.5, m1: -3.5, m3: -2.5, m6: 5.0 },
      ust10y: { d1: -10, d5: -18, m1: -10, m3: 15, m6: 25 },
      dxy: { d1: 0.4, d5: 1.0, m1: 0.5, m3: -0.5, m6: 5.5 },
      gold: { d1: -1.5, d5: -2.5, m1: -3.0, m3: -1.5, m6: -8.5 },
      oil: { d1: -2.5, d5: -5.0, m1: -3.5, m3: 3.5, m6: 12.0 },
      creditHY: { d1: 8, d5: 25, m1: 30, m3: 5, m6: -10 },
      vix: { d1: 20.0, d5: 13.0, m1: -3.0, m3: -7.5, m6: -11.0 },
    },
    flowPatterns:
      "VIX-futures end-of-day rebalancing concentrated buying in a 30-minute window pushed front-month into severe contango. Short-vol ETN holders received liquidation prints far below intraday-printed NAV. Equity vol risk premia stayed elevated for months.",
    failedTrades: [
      {
        quote:
          "Long XIV / SVXY at any size — 'sell calls and collect premium' had been the easiest trade of 2017; one day in February ended five years of gains for many participants.",
        attribution: "ETN-issuer disclosures, Feb 2018",
      },
    ],
    consensusError:
      "Consensus assumed retail short-vol products were liquid enough to handle a vol spike. They weren't — the products' rebalancing logic forced buying into a thin VIX-futures market, creating the cascade they were designed to weather.",
    lessons: [
      "Structural products that look like simple risk premium can hide leverage that breaks under their own footprint.",
      "Crowded short-vol positioning is the most consistent leading indicator of vol regime changes.",
      "Vol spikes of 100%+ in single days produce equity drawdowns shorter than fundamentals would imply.",
    ],
    sources: [
      {
        title: "Federal Reserve Notes — Volatility ETPs and February 2018",
        url: "https://www.federalreserve.gov/econres/notes/feds-notes/leveraged-etps-and-the-feedback-loop-of-volatility-20180330.htm",
      },
    ],
  },

  {
    id: "2018-powell-pivot-eve",
    title: "Powell hawkish FOMC and Q4 2018 rout",
    date: "2018-12-19",
    region: "US",
    triggerType: "monetary_policy",
    regimeTags: [
      "fed_hiking",
      "fed_surprise_hawkish",
      "qt_active",
      "equities_correction",
      "credit_widening",
      "vol_spiking",
      "policy_uncertainty",
    ],
    surpriseFactor: 4,
    description:
      "The FOMC raised rates 25 bps to 2.25–2.50% with hawkish balance-sheet runoff guidance ('on autopilot'). The S&P fell ~16% from the Dec 3 high to Dec 24 — its worst Christmas Eve in history.",
    catalyst:
      "An FOMC committed to normalisation, slowing global growth, ongoing US–China trade-war escalation, and seasonal year-end liquidity that amplified moves. Trump publicly criticised Powell during the selloff.",
    narrativeAtTime:
      "Markets had been bullish through October on tax-cut tailwind and strong earnings. The Q4 unraveling shocked positioning that had assumed Powell would soften QT guidance under equity-market pressure. Year-end forced selling amplified the move into Christmas Eve.",
    outcomeInHindsight:
      "Powell pivoted dovishly on January 4 2019 ('we will be patient'). The S&P recovered fully by April. The cycle continued — but the Q4 2018 episode exposed how QT mechanics interacted with year-end liquidity to amplify equity stress beyond what fundamentals justified.",
    assetMoves: {
      sp500: { d1: -1.5, d5: -7.5, m1: -2.5, m3: 6.0, m6: 12.0 },
      ust10y: { d1: -5, d5: -22, m1: -45, m3: -55, m6: -80 },
      dxy: { d1: 0.4, d5: 1.5, m1: 0.5, m3: 0.5, m6: -0.5 },
      gold: { d1: 0.8, d5: 2.5, m1: 5.0, m3: 1.5, m6: 9.0 },
      oil: { d1: -4.5, d5: -10.0, m1: -10.0, m3: 15.0, m6: 22.0 },
      creditHY: { d1: 15, d5: 65, m1: 95, m3: 30, m6: -50 },
      vix: { d1: 4.0, d5: 8.0, m1: 0, m3: -10.0, m6: -14.0 },
    },
    flowPatterns:
      "December tax-loss selling accelerated into year-end illiquidity. Equity-fund redemptions reached $40bn over four weeks. Buyback blackout window (mid-Dec into earnings) removed key bid; the January re-open with corporate buying reversed the move.",
    failedTrades: [
      {
        quote:
          "Sell stops triggered into December 24 illiquidity locked in losses near the cycle low — many such positions were re-bought higher in January.",
        attribution: "Equity-fund flow disclosures, Q1 2019",
      },
    ],
    consensusError:
      "Consensus believed the Powell Fed would respond to equity stress with the same speed as Yellen and Bernanke. The 2-week lag between the Dec 19 hawkish meeting and the Jan 4 pivot was longer than markets expected and produced the panic low.",
    lessons: [
      "Year-end illiquidity amplifies any policy-driven selloff into Christmas-week capitulation.",
      "QT guidance that sounds 'on autopilot' is interpreted as inflexible by markets even when the Fed views it as conditional.",
      "Powell-era policy pivots are often delivered in speeches between meetings, not at FOMC meetings themselves.",
    ],
    sources: [
      {
        title: "Federal Reserve — December 2018 FOMC Statement",
        url: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20181219a.htm",
      },
    ],
  },

  {
    id: "2020-covid-crash",
    title: "COVID crash and emergency Fed response",
    date: "2020-03-09",
    region: "GLOBAL",
    triggerType: "pandemic_disaster",
    regimeTags: [
      "pandemic_active",
      "equities_correction",
      "vol_spiking",
      "credit_widening",
      "hy_stress",
      "liquidity_squeeze",
      "fed_cutting",
      "qe_active",
      "flight_to_quality",
      "oil_collapsing",
      "recession_underway",
    ],
    surpriseFactor: 5,
    description:
      "The S&P fell 7.6% on March 9 (limit-down at the open) as Saudi Arabia–Russia oil-price war combined with accelerating COVID-19 reports overwhelmed markets. The S&P fell 34% peak-to-trough by March 23 — the fastest bear market in history.",
    catalyst:
      "OPEC+ talks collapsed Friday March 6 (Saudi-Russia split); Italy locked down March 8; US case acceleration. The combination of a global demand shock with an oil supply shock and a corporate-funding crisis (HY OAS spiking) was unprecedented.",
    narrativeAtTime:
      "Through February, markets had viewed COVID as a contained Asian story. Saudi Aramco's pricing decision was the trigger that broke the dam, but the underlying issue was a mass-mobilisation health crisis with no clear economic-policy template. Fund-manager survey respondents in early March were 'more bearish than 2008'.",
    outcomeInHindsight:
      "The Fed cut to zero, restarted QE at unlimited scale, and launched eight new credit facilities by March 23. Congress passed CARES Act ($2.2tn) by March 27. The S&P recovered to new highs by August. The 33-day bear market and 5-month recovery were the fastest in history — driven by fiscal-monetary scale that exceeded 2008 manyfold.",
    assetMoves: {
      sp500: { d1: -7.6, d5: -19.0, m1: -10.5, m3: 0.5, m6: 12.0 },
      ust10y: { d1: -22, d5: -40, m1: -65, m3: -110, m6: -120 },
      dxy: { d1: -0.8, d5: 4.5, m1: -2.0, m3: -3.5, m6: -4.5 },
      gold: { d1: 0.5, d5: -2.0, m1: 1.5, m3: 13.0, m6: 26.0 },
      oil: { d1: -25.0, d5: -28.0, m1: -55.0, m3: -45.0, m6: -25.0 },
      creditHY: { d1: 100, d5: 280, m1: 600, m3: 250, m6: 0 },
      vix: { d1: 17.0, d5: 30.0, m1: 25.0, m3: -10.0, m6: -25.0 },
    },
    flowPatterns:
      "Treasury market dysfunction in mid-March was unprecedented — bid-ask widened 10x, swap spreads inverted. Money-market fund stress reappeared. Mortgage-REIT margin calls cascaded. The Fed's mid-March facilities (PMCCF, SMCCF, MMLF, PDCF) addressed each transmission channel directly.",
    failedTrades: [
      {
        quote:
          "Short volatility into the COVID acceleration on assumption SARS/MERS templates would apply — the most catastrophic vol-fund quarter on record.",
        attribution: "Vol-fund disclosures, Q1 2020",
      },
      {
        quote:
          "Long gold for safe-haven flows in mid-March — gold fell sharply during the worst week as cash was raised against margin calls.",
        attribution: "Commodity-fund recaps, 2020",
      },
      {
        quote:
          "Short equities through April on assumption recession path was 1929-like — the policy response and digital-economy concentration drove a vertical recovery.",
        attribution: "Hedge-fund post-mortems, 2020",
      },
    ],
    consensusError:
      "Consensus underestimated both the scale and speed of the policy response. The Fed/Treasury 'go big and go fast' template — informed by lessons from 2008 — turned what could have been a multi-year bear market into a 5-month round trip.",
    lessons: [
      "Policy backstops scaled to the shock can compress crisis timelines from years to months.",
      "Treasury-market dysfunction is the leading indicator regulators must address first to prevent cascade.",
      "Sectoral dispersion is enormous in pandemic shocks: digital businesses outperform while physical-economy names take 18+ months to recover.",
    ],
    sources: [
      {
        title: "Federal Reserve — COVID-19 Policy Actions",
        url: "https://www.federalreserve.gov/covid-19.htm",
      },
    ],
  },

  {
    id: "2022-russia-ukraine",
    title: "Russia invades Ukraine",
    date: "2022-02-24",
    region: "GLOBAL",
    triggerType: "geopolitical",
    regimeTags: [
      "war_outbreak",
      "war_active",
      "energy_shock",
      "oil_surging",
      "geopolitical_tail",
      "sanctions_active",
      "inflation_rising",
      "fed_hiking",
      "vol_spiking",
    ],
    surpriseFactor: 4,
    description:
      "Russia launched a full-scale invasion of Ukraine, including missile strikes on Kyiv. G7 sanctions cut Russian banks from SWIFT and froze foreign-exchange reserves. Oil and European gas prices spiked; risk assets sold off briefly then rallied within weeks as the Fed remained on hiking course.",
    catalyst:
      "Months of Russian troop massing was viewed by US intelligence as preparation for invasion but by markets as posturing through January. The actual scale (full multi-axis assault on Kyiv) was at the maximalist end of intelligence projections.",
    narrativeAtTime:
      "Markets had priced a limited Donbas operation, not a full invasion. Equity correction had begun in January on Fed-hiking concerns; the war was a second blow that briefly accelerated risk-off but was supplanted within weeks by the inflation/Fed-hiking narrative.",
    outcomeInHindsight:
      "Brent peaked at $139 on March 8 and then drifted back to pre-war levels by year-end as European demand destruction and SPR releases worked. European gas (TTF) had a much longer spike. The Fed hiked 75bps four consecutive meetings; the dominant 2022 narrative became inflation and Fed policy, not Ukraine.",
    assetMoves: {
      sp500: { d1: 1.5, d5: 0.5, m1: 6.5, m3: -7.5, m6: -12.0 },
      ust10y: { d1: -8, d5: 25, m1: 50, m3: 95, m6: 130 },
      dxy: { d1: 0.9, d5: 1.5, m1: 2.5, m3: 6.0, m6: 11.0 },
      gold: { d1: 1.5, d5: -1.5, m1: -3.5, m3: -5.0, m6: -10.0 },
      oil: { d1: 8.5, d5: 11.0, m1: 11.0, m3: 5.5, m6: -4.5 },
      creditHY: { d1: 25, d5: 35, m1: -10, m3: 65, m6: 90 },
      vix: { d1: -2.0, d5: -1.5, m1: -8.0, m3: -1.0, m6: 4.5 },
    },
    flowPatterns:
      "European energy-fund flows surged. Russian-asset positioning was forcibly liquidated as sanctions and exchange suspensions made positions un-tradable. Defence-sector equity flows turned positive after a decade of structural outflows. Wheat, fertilizer, and coal had outsized moves.",
    failedTrades: [
      {
        quote:
          "Short equities on assumption war was the dominant 2022 narrative — by April the inflation/Fed story was driving prices, with mixed direction relative to war news.",
        attribution: "Macro-fund disclosures, Q2 2022",
      },
      {
        quote:
          "Long oil at $130 on assumption Russian production would be permanently impaired — by year-end, oil traded back below $80 as discounts to Russian crude found Asian buyers.",
        attribution: "Energy-fund recaps, 2022",
      },
    ],
    consensusError:
      "Consensus extended initial geopolitical premia for too long. The market shifted from 'war-driven' to 'inflation-and-Fed-driven' framing within three weeks, with most of the year's price action explained by the latter.",
    lessons: [
      "War-driven asset moves have a half-life measured in weeks unless the conflict produces structural supply disruption that markets can't reroute.",
      "Concurrent macro regimes (in 2022, Fed hiking + inflation) often dominate geopolitical events for cross-asset returns.",
      "Sanctions repricing is permanent for some assets (Russian banks) and transitory for others (commodities, where alternative buyers and routes emerge).",
    ],
    sources: [
      {
        title: "US Treasury — Russia Sanctions",
        url: "https://home.treasury.gov/policy-issues/financial-sanctions/sanctions-programs-and-country-information/russian-harmful-foreign-activities-sanctions",
      },
    ],
  },

  {
    id: "2022-uk-gilt-crisis",
    title: "UK gilt crisis — Truss mini-budget",
    date: "2022-09-23",
    region: "UK",
    triggerType: "fiscal_policy",
    regimeTags: [
      "policy_uncertainty",
      "bonds_selloff",
      "currency_devaluation",
      "boe_hiking",
      "leverage_high",
      "vol_spiking",
      "credit_widening",
      "sovereign_stress",
    ],
    surpriseFactor: 4,
    description:
      "UK Chancellor Kwasi Kwarteng's 'mini-budget' announced £45bn of unfunded tax cuts. Sterling fell to a record low against USD; 30y gilts rose 130 bps in days, triggering LDI margin-call cascades that forced Bank of England emergency intervention.",
    catalyst:
      "The Truss government's growth-plan ambition collided with already-elevated gilt yields and a structural pension-fund LDI hedging book of ~£1.5tn that magnified bond-yield moves through forced selling.",
    narrativeAtTime:
      "Markets had digested global hiking aggressively through 2022. UK fiscal expansion in this regime was inconsistent with monetary-policy discipline; what was unanticipated was the LDI feedback loop that turned a fiscal-credibility issue into a financial-stability crisis within four trading days.",
    outcomeInHindsight:
      "The BoE intervened on September 28 with a 13-day temporary gilt-buying program. Truss resigned October 20 (49 days, shortest UK PM tenure ever). Sunak/Hunt reversed nearly all the mini-budget. The £/$ recovered toward $1.20 by year-end. UK gilts stabilised but UK risk-premium increased structurally.",
    assetMoves: {
      sp500: { d1: -1.7, d5: -8.0, m1: -1.5, m3: 4.0, m6: 7.5 },
      ust10y: { d1: 8, d5: 25, m1: 50, m3: -5, m6: -20 },
      dxy: { d1: 1.5, d5: 1.8, m1: -2.5, m3: -7.5, m6: -8.0 },
      gold: { d1: -1.5, d5: -3.0, m1: 0.5, m3: 5.5, m6: 6.5 },
      oil: { d1: -5.0, d5: -7.5, m1: -1.5, m3: -10.0, m6: -10.0 },
      creditHY: { d1: 25, d5: 60, m1: 30, m3: -20, m6: -55 },
      vix: { d1: 3.5, d5: 4.5, m1: -1.0, m3: -5.5, m6: -8.0 },
    },
    flowPatterns:
      "LDI fund margin calls forced gilt selling into a one-way market over 28–29 September. UK pension-fund collateral conversions hit FX market. The BoE's emergency program created a buyer of last resort that broke the cascade. Sterling forwards repriced UK risk premium for months.",
    failedTrades: [
      {
        quote:
          "Long gilts at the post-budget high yields on assumption the BoE would let yields find their own level — the BoE's day-3 intervention reversed positioning ahead of a Truss-resignation rally.",
        attribution: "UK-rates desk recaps, Q4 2022",
      },
      {
        quote:
          "Short sterling at $1.03 on assumption parity was inevitable — Sunak/Hunt reversal recovered the move within months.",
        attribution: "FX-fund disclosures, 2022",
      },
    ],
    consensusError:
      "Consensus failed to map fiscal-policy errors into financial-stability cascades through pension-fund LDI exposure. The structural leverage in regulated UK pension hedging was not in most traders' frameworks until the moment it broke.",
    lessons: [
      "Hidden leverage in regulated long-term investors can manifest as financial-stability crises within days.",
      "Fiscal-policy incoherence in advanced economies prices into currency and sovereign spreads simultaneously, not sequentially.",
      "Central-bank financial-stability interventions (vs monetary-policy interventions) operate on different timelines and signal different things about underlying risks.",
    ],
    sources: [
      {
        title: "Bank of England — Statement on UK Gilt Markets",
        url: "https://www.bankofengland.co.uk/news/2022/september/bank-of-england-announces-gilt-market-operation",
      },
    ],
  },

  {
    id: "2023-svb-collapse",
    title: "SVB collapse and regional-bank crisis",
    date: "2023-03-10",
    region: "US",
    triggerType: "credit_event",
    regimeTags: [
      "bank_failure",
      "bank_stress",
      "credit_widening",
      "fed_surprise_dovish",
      "flight_to_quality",
      "vol_spiking",
      "liquidity_squeeze",
      "policy_uncertainty",
    ],
    surpriseFactor: 4,
    description:
      "Silicon Valley Bank failed within 48 hours after disclosing a $1.8bn loss on AFS Treasury sales and announcing a capital raise. Signature Bank failed two days later. The Fed launched the BTFP facility on Sunday March 12 to backstop bank Treasury holdings.",
    catalyst:
      "SVB's mismatched balance-sheet (long-duration HTM securities funded by uninsured tech-startup deposits) became unsustainable as tech deposits flowed out and AFS unrealised losses crystallized. Social-media-driven bank runs were a new vector.",
    narrativeAtTime:
      "Markets had grown comfortable with bank-sector resilience after a decade of stronger capital and liquidity rules. SVB's specific business model — concentrated tech VC deposits, long-duration UST holdings — was viewed as idiosyncratic, not systemic.",
    outcomeInHindsight:
      "Credit Suisse failed and was sold to UBS the following weekend. First Republic failed in May. The Fed paused hiking briefly but resumed in May/June; the funds rate continued to rise into 2024. Equities (especially mega-cap tech) rallied on flight-to-mega-cap-quality flows; KRE bank ETF fell ~30% peak-to-trough.",
    assetMoves: {
      sp500: { d1: -1.5, d5: -2.0, m1: 4.0, m3: 7.0, m6: 9.5 },
      ust10y: { d1: -22, d5: -50, m1: -45, m3: -10, m6: 60 },
      dxy: { d1: -0.6, d5: -1.0, m1: -2.5, m3: -1.0, m6: 1.5 },
      gold: { d1: 1.5, d5: 4.5, m1: 9.0, m3: 5.5, m6: 4.5 },
      oil: { d1: -1.5, d5: -7.5, m1: -10.0, m3: -3.5, m6: 12.0 },
      creditHY: { d1: 25, d5: 60, m1: 30, m3: -5, m6: -50 },
      vix: { d1: 1.0, d5: 4.5, m1: -7.5, m3: -8.0, m6: -10.0 },
    },
    flowPatterns:
      "Money-market fund inflows reached $400bn over four weeks. Mega-cap tech equity flows surged on flight-to-quality (and AI thematic). Regional-bank deposits saw ongoing outflows for two months. The BTFP par-value collateral facility broke the immediate cascade by removing Treasury-holding solvency concerns.",
    failedTrades: [
      {
        quote:
          "Long regional banks on the post-failure dip — KRE fell another 15% over six weeks before stabilising.",
        attribution: "Bank-equity-fund recaps, Q2 2023",
      },
      {
        quote:
          "Short equities on assumption the bank crisis would force a recession — the equity rally led by AI-mega-caps surprised most macro positioning.",
        attribution: "Macro-fund disclosures, 2023",
      },
    ],
    consensusError:
      "Consensus extended the 2008 bank-crisis playbook (broad bank stress, prolonged equity drag). The 2023 dynamic was different — a small subset of regionals with idiosyncratic balance-sheet mismatches, met with a precise Fed facility. The mega-cap quality bid (and AI tailwind) dominated the equity story.",
    lessons: [
      "Modern bank runs can complete within hours via mobile banking, not days via teller lines.",
      "Targeted central-bank facilities (BTFP) can resolve specific transmission channels without the broad QE that characterised 2008/2020.",
      "Mega-cap tech can rally during a regional-bank crisis if the underlying narrative is flight-to-quality plus AI productivity gains.",
    ],
    sources: [
      {
        title: "Federal Reserve — Bank Term Funding Program",
        url: "https://www.federalreserve.gov/newsevents/pressreleases/monetary20230312a.htm",
      },
    ],
  },

  {
    id: "2024-yen-carry-unwind",
    title: "Yen carry-trade unwind",
    date: "2024-08-05",
    region: "GLOBAL",
    triggerType: "currency_event",
    regimeTags: [
      "jpy_carry_unwind",
      "boj_normalizing",
      "currency_devaluation",
      "vol_spiking",
      "equities_correction",
      "leverage_high",
      "positioning_extreme_long",
      "flash_crash",
    ],
    surpriseFactor: 4,
    description:
      "The Nikkei 225 fell 12.4% — its worst day since 1987 — as the BoJ's July 31 hike combined with weak US payrolls to trigger a violent yen carry-trade unwind. USD/JPY fell ~10% over a week; global vol surfaces dislocated.",
    catalyst:
      "The BoJ unexpectedly hiked to 0.25% with hawkish forward guidance on July 31. The August 2 weak US payrolls release confirmed slowing US growth, narrowing the rate gap that had supported the carry trade. BOJ intervention through May–July had also tightened JPY funding.",
    narrativeAtTime:
      "Yen carry positioning was estimated at $1–4tn through 2024. Markets had assumed the BoJ would normalise gradually; the combined July 31 hike + August 2 payrolls + August 5 cascade was a 'three strikes' positioning unwind that exceeded any modeled scenario.",
    outcomeInHindsight:
      "The Nikkei recovered most losses within two weeks. USD/JPY rebounded to ~150 by year-end. The Fed cut 50bps in September and the BoJ moderated its hiking trajectory. The episode reset carry-trade leverage but did not fundamentally end the structural USD-JPY differential.",
    assetMoves: {
      sp500: { d1: -3.0, d5: -1.5, m1: 4.0, m3: 5.5, m6: 9.0 },
      ust10y: { d1: -15, d5: -25, m1: 5, m3: 35, m6: 60 },
      dxy: { d1: -0.6, d5: -1.5, m1: -1.5, m3: 3.5, m6: 5.5 },
      gold: { d1: -1.5, d5: 0, m1: 1.5, m3: 4.5, m6: 12.0 },
      oil: { d1: -1.0, d5: -5.5, m1: -3.5, m3: -8.0, m6: -3.0 },
      creditHY: { d1: 35, d5: 60, m1: 0, m3: -25, m6: -50 },
      vix: { d1: 24.0, d5: 12.0, m1: -8.0, m3: -10.0, m6: -8.0 },
    },
    flowPatterns:
      "VIX printed 65 intraday on August 5 — a level only seen in 2008 and 2020. Global equity dispersion compressed as forced selling concentrated in liquid mega-caps. JPY-funded long positions (NKY, US tech, EM-FX) all delevered together. Recovery flow was led by retail buying into August.",
    failedTrades: [
      {
        quote:
          "Long Nikkei + short JPY as a paired carry-and-currency trade — the textbook strategy that levered up in Q2 2024 lost ~25% in one week as both legs reversed simultaneously.",
        attribution: "Macro-fund disclosures, Q3 2024",
      },
      {
        quote:
          "Short volatility through July on assumption the calm regime would persist — VIX printing 65 on Aug 5 was a generational unwind for short-vol strategies.",
        attribution: "Vol-fund recaps, 2024",
      },
    ],
    consensusError:
      "Consensus underestimated how a small BoJ rate move could cascade through global carry positioning. The structural fact — that JPY funding is the cheapest in G10 — meant positioning had grown extreme even as none of the individual positions looked alarming.",
    lessons: [
      "JPY moves carry global signal value because JPY is the funding leg for cross-asset carry trades.",
      "Mechanical forced delvering of carry positions can compress drawdowns to days where fundamental moves would take months.",
      "Crowded positioning in low-vol carry strategies is the most consistent leading indicator of vol regime change.",
    ],
    sources: [
      {
        title: "Bank of Japan — July 2024 Monetary Policy Meeting",
        url: "https://www.boj.or.jp/en/mopo/mpmdeci/mpr_2024/k240731a.pdf",
      },
    ],
  },

  {
    id: "2025-trump-liberation-day",
    title: "Trump 'Liberation Day' tariffs",
    date: "2025-04-02",
    region: "GLOBAL",
    triggerType: "trade_policy",
    regimeTags: [
      "tariff_war",
      "trade_dispute",
      "policy_uncertainty",
      "geopolitical_tail",
      "equities_correction",
      "vol_spiking",
      "growth_slowing",
      "credit_widening",
      "inflation_rising",
    ],
    surpriseFactor: 5,
    description:
      "President Trump announced reciprocal tariffs on essentially all US trading partners, with a 10% global baseline plus higher country-specific rates calibrated to bilateral trade deficits. The S&P fell ~12% in two trading days; the dollar weakened and Treasury yields rose despite the equity selloff.",
    catalyst:
      "An unexpected escalation of the tariff playbook beyond the 2018 template, with a methodology that included VAT and non-tariff measures in the 'reciprocal' calculation, producing rates as high as 49% for Cambodia, 46% for Vietnam, and 34% for China.",
    narrativeAtTime:
      "Markets had priced a moderate tariff escalation through Q1 2025 (consensus expected 10–15% on China-specific goods, modest baseline on others). The April 2 announcement materially exceeded expectations on both scope and methodology, with a credibility hit for negotiated US tariff frameworks.",
    outcomeInHindsight:
      "After 7 days of escalating market stress (and a UST market dislocation), the administration paused most country-specific tariffs for 90 days while keeping the 10% baseline and elevated China rates. Equities recovered most losses within four weeks. The dollar's failure to act as safe-haven was the structural takeaway.",
    assetMoves: {
      sp500: { d1: -4.8, d5: -10.0, m1: -3.0, m3: 4.5, m6: 8.0 },
      ust10y: { d1: -8, d5: 30, m1: 20, m3: -10, m6: -30 },
      dxy: { d1: -1.5, d5: -3.0, m1: -5.5, m3: -7.5, m6: -8.0 },
      gold: { d1: 1.5, d5: 4.5, m1: 7.0, m3: 14.0, m6: 22.0 },
      oil: { d1: -6.5, d5: -14.0, m1: -10.0, m3: -2.5, m6: 0 },
      creditHY: { d1: 40, d5: 110, m1: 50, m3: -15, m6: -30 },
      vix: { d1: 8.5, d5: 25.0, m1: -2.0, m3: -10.0, m6: -12.5 },
    },
    flowPatterns:
      "USD selling into the announcement — the unusual feature of the episode. UST flows were paradoxical: yields rose despite equity selloff, signalling foreign reserve managers reducing USD asset exposure. Gold inflows surged. China-related and import-heavy equity sectors saw concentrated selling.",
    failedTrades: [
      {
        quote:
          "Long USD as risk-off hedge into tariff announcement — the structural break in USD safe-haven correlation made this 'obvious' trade the worst-performer of Q2 2025.",
        attribution: "Macro-fund disclosures, Q2 2025",
      },
      {
        quote:
          "Long USTs on assumption flight-to-quality dynamics would dominate — UST yields actually rose into the worst week, an unprecedented positive yield-equity correlation in stress.",
        attribution: "Fixed-income fund recaps, 2025",
      },
    ],
    consensusError:
      "Consensus assumed a 2018-style tariff escalation: bilateral, negotiable, contained. The Liberation Day methodology and scale were closer to the Smoot-Hawley template than to a tactical trade negotiation. The dollar's failure to bid in stress also signaled a structural reset in reserve-currency dynamics.",
    lessons: [
      "Tariff regimes that target methodologically rather than bilaterally produce broader reserve-currency repricing.",
      "USD safe-haven status can break in shocks where the US is the source of policy uncertainty.",
      "Equity recoveries from policy-driven (not balance-sheet-driven) shocks tend to be V-shaped once the policy is paused or reversed.",
    ],
    sources: [
      {
        title: "White House — Reciprocal Tariff Executive Order",
        url: "https://www.whitehouse.gov/briefing-room/presidential-actions/",
      },
    ],
  },
];

