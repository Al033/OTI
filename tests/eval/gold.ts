import type { QueryTags } from "@/lib/types";

/**
 * Retrieval gold set. Each case specifies a *tagged* query (the
 * deterministic side of the pipeline) plus the analyst's expectation:
 *
 *   - mustContain: events that MUST appear in the top-3 retrieved
 *     candidates. If any go missing, the case fails.
 *   - niceToHave: events the analyst would also accept; counted toward
 *     recall@5 but not enforced strictly.
 *
 * Hand-tagged so we can pin retrieval quality without paying for an LLM
 * call on every CI run. A separate `eval:full` harness exercises the
 * tagging step too, when keys are present.
 *
 * Add cases here when you find queries the pipeline gets wrong — the
 * gold set is the corpus's living definition of "good retrieval."
 */

export interface GoldCase {
  id: string;
  description: string;
  queryTags: QueryTags;
  mustContain: string[];
  niceToHave: string[];
}

export const GOLD_CASES: GoldCase[] = [
  {
    id: "tariff-shock",
    description: "Broad reciprocal tariff regime change",
    queryTags: {
      triggerType: "trade_policy",
      regimeTags: ["tariff_war", "trade_dispute", "policy_uncertainty", "vol_spiking", "growth_slowing"],
      region: "GLOBAL",
      surpriseFactor: 5,
      assetFocus: ["S&P 500", "USD"],
      dateHint: null,
      rationale: "tariff regime change",
    },
    mustContain: ["2025-trump-liberation-day", "2018-powell-pivot-eve"],
    niceToHave: ["1971-nixon-shock"],
  },
  {
    id: "fed-emergency-cut",
    description: "Surprise inter-meeting Fed cut on credit stress",
    queryTags: {
      triggerType: "monetary_policy",
      regimeTags: ["fed_cutting", "fed_surprise_dovish", "credit_widening", "vol_spiking", "risk_off"],
      region: "US",
      surpriseFactor: 5,
      assetFocus: ["S&P 500", "credit"],
      dateHint: null,
      rationale: "emergency Fed easing",
    },
    mustContain: ["1998-russia-ltcm", "2020-covid-crash"],
    niceToHave: ["2008-lehman"],
  },
  {
    id: "yields-spike-violent",
    description: "Violent duration repricing on inflation worry",
    queryTags: {
      triggerType: "monetary_policy",
      regimeTags: ["bonds_selloff", "fed_hiking", "inflation_rising", "vol_spiking"],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["USTs"],
      dateHint: null,
      rationale: "rates shock",
    },
    mustContain: ["1994-greenspan-hike", "2013-taper-tantrum"],
    niceToHave: ["2022-uk-gilt-crisis", "1979-volcker-shock"],
  },
  {
    id: "yuan-deval",
    description: "PBOC weakens fix unexpectedly",
    queryTags: {
      triggerType: "currency_event",
      regimeTags: ["currency_devaluation", "china_easing", "em_fx_stress", "deflation_risk", "risk_off"],
      region: "CN",
      surpriseFactor: 4,
      assetFocus: ["USD/CNY"],
      dateHint: null,
      rationale: "yuan devaluation",
    },
    mustContain: ["2015-china-deval"],
    niceToHave: ["1997-thai-baht", "2024-yen-carry-unwind"],
  },
  {
    id: "regional-bank-fail",
    description: "Bank failure on duration losses",
    queryTags: {
      triggerType: "credit_event",
      regimeTags: ["bank_failure", "bank_stress", "credit_widening", "flight_to_quality", "vol_spiking"],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["regional banks"],
      dateHint: null,
      rationale: "bank stress",
    },
    mustContain: ["2023-svb-collapse", "2008-lehman"],
    niceToHave: ["2007-bnp-paribas"],
  },
  {
    id: "war-major-power",
    description: "Major-power war risk",
    queryTags: {
      triggerType: "geopolitical",
      regimeTags: ["war_risk", "geopolitical_tail", "vol_spiking", "energy_shock", "flight_to_quality"],
      region: "GLOBAL",
      surpriseFactor: 5,
      assetFocus: ["oil", "USD"],
      dateHint: null,
      rationale: "war tail risk",
    },
    mustContain: ["2022-russia-ukraine", "1990-iraq-kuwait"],
    niceToHave: ["2001-911", "1973-opec-embargo"],
  },
  {
    id: "carry-unwind",
    description: "Funding-currency carry unwinds violently",
    queryTags: {
      triggerType: "structural_event",
      regimeTags: ["jpy_carry_unwind", "vol_spiking", "risk_off", "positioning_extreme_long", "flight_to_quality"],
      region: "JP",
      surpriseFactor: 4,
      assetFocus: ["JPY"],
      dateHint: null,
      rationale: "carry-trade unwind",
    },
    mustContain: ["2024-yen-carry-unwind"],
    niceToHave: ["1998-russia-ltcm", "2018-volmageddon"],
  },
  {
    id: "vol-event",
    description: "Volatility spike from short-vol unwind",
    queryTags: {
      triggerType: "structural_event",
      regimeTags: ["vol_spiking", "positioning_extreme_short", "flash_crash", "risk_off"],
      region: "US",
      surpriseFactor: 5,
      assetFocus: ["VIX"],
      dateHint: null,
      rationale: "vol regime shift",
    },
    mustContain: ["2018-volmageddon"],
    niceToHave: ["2010-flash-crash", "1987-black-monday"],
  },
  {
    id: "sterling-crisis",
    description: "Sterling defence breaks",
    queryTags: {
      triggerType: "currency_event",
      regimeTags: ["peg_break", "currency_devaluation", "policy_uncertainty", "vol_spiking"],
      region: "UK",
      surpriseFactor: 5,
      assetFocus: ["GBP"],
      dateHint: null,
      rationale: "FX peg break",
    },
    mustContain: ["1992-black-wednesday"],
    niceToHave: ["2022-uk-gilt-crisis", "1997-thai-baht"],
  },
  {
    id: "dotcom",
    description: "Bubble bursts in growth tech",
    queryTags: {
      triggerType: "bubble_burst",
      regimeTags: ["bubble_burst", "bubble_late_stage", "equities_bear", "vol_spiking", "risk_off"],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["S&P 500"],
      dateHint: null,
      rationale: "bubble burst",
    },
    mustContain: ["2000-dotcom-peak"],
    niceToHave: ["1987-black-monday", "2018-volmageddon"],
  },
  {
    id: "credit-spread-widening",
    description: "HY spreads blow out on liquidity stress",
    queryTags: {
      triggerType: "credit_event",
      regimeTags: ["credit_widening", "hy_stress", "liquidity_squeeze", "vol_spiking", "risk_off"],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["credit"],
      dateHint: null,
      rationale: "credit blow-out",
    },
    mustContain: ["2008-lehman", "2007-bnp-paribas"],
    niceToHave: ["1998-russia-ltcm", "2020-covid-crash"],
  },
  {
    id: "geo-shock-no-supply",
    description: "Geopolitical shock without supply consequences",
    queryTags: {
      triggerType: "geopolitical",
      regimeTags: ["geopolitical_tail", "terrorist_attack", "vol_spiking", "flight_to_quality", "risk_off"],
      region: "US",
      surpriseFactor: 5,
      assetFocus: ["S&P 500"],
      dateHint: null,
      rationale: "geo shock",
    },
    mustContain: ["2001-911"],
    niceToHave: ["1990-iraq-kuwait"],
  },
  {
    id: "downgrade-event",
    description: "US sovereign rating cut",
    queryTags: {
      triggerType: "credit_event",
      regimeTags: ["downgrade_event", "sovereign_stress", "credit_widening", "vol_spiking"],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["USTs"],
      dateHint: null,
      rationale: "sovereign downgrade",
    },
    mustContain: ["2011-us-downgrade"],
    niceToHave: ["2022-uk-gilt-crisis"],
  },
  {
    id: "election-shock",
    description: "Political election surprise",
    queryTags: {
      triggerType: "election_political",
      regimeTags: ["election_uncertainty", "policy_uncertainty", "vol_spiking", "risk_off"],
      region: "US",
      surpriseFactor: 5,
      assetFocus: ["S&P 500", "USD"],
      dateHint: null,
      rationale: "election surprise",
    },
    mustContain: ["2016-trump-election"],
    niceToHave: ["2016-brexit"],
  },
  {
    id: "brexit-style",
    description: "Sovereign sentiment shock from referendum",
    queryTags: {
      triggerType: "election_political",
      regimeTags: ["election_uncertainty", "policy_uncertainty", "vol_spiking", "currency_devaluation"],
      region: "UK",
      surpriseFactor: 5,
      assetFocus: ["GBP"],
      dateHint: null,
      rationale: "referendum shock",
    },
    mustContain: ["2016-brexit"],
    niceToHave: ["1992-black-wednesday"],
  },
  {
    id: "qe-pivot",
    description: "Central bank pivots to easing on stress",
    queryTags: {
      triggerType: "monetary_policy",
      regimeTags: ["fed_cutting", "qe_active", "credit_widening", "risk_off"],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["S&P 500"],
      dateHint: null,
      rationale: "QE pivot",
    },
    mustContain: ["2018-powell-pivot-eve", "2020-covid-crash"],
    niceToHave: ["1998-russia-ltcm"],
  },
  {
    id: "ecb-whatever",
    description: "ECB pledges open-ended support",
    queryTags: {
      triggerType: "monetary_policy",
      regimeTags: ["ecb_cutting", "sovereign_stress", "qe_active", "credit_widening"],
      region: "EU",
      surpriseFactor: 5,
      assetFocus: ["EUR"],
      dateHint: null,
      rationale: "ECB pivot",
    },
    mustContain: ["2012-whatever-it-takes"],
    niceToHave: [],
  },
  {
    id: "oil-shock",
    description: "Oil supply shock",
    queryTags: {
      triggerType: "commodity_event",
      regimeTags: ["energy_shock", "oil_surging", "inflation_rising", "stagflation_risk"],
      region: "GLOBAL",
      surpriseFactor: 5,
      assetFocus: ["oil"],
      dateHint: null,
      rationale: "oil shock",
    },
    mustContain: ["1973-opec-embargo"],
    niceToHave: ["1990-iraq-kuwait", "2022-russia-ukraine"],
  },
  {
    id: "pandemic-crash",
    description: "Pandemic-driven liquidity crisis",
    queryTags: {
      triggerType: "pandemic_disaster",
      regimeTags: ["pandemic_active", "vol_spiking", "risk_off", "fed_cutting", "credit_widening", "liquidity_squeeze"],
      region: "GLOBAL",
      surpriseFactor: 5,
      assetFocus: ["S&P 500"],
      dateHint: null,
      rationale: "pandemic shock",
    },
    mustContain: ["2020-covid-crash"],
    niceToHave: ["2008-lehman"],
  },
  {
    id: "1987-style",
    description: "One-day equity crash with no clear catalyst",
    queryTags: {
      triggerType: "structural_event",
      regimeTags: ["flash_crash", "vol_spiking", "equities_bear", "leverage_high", "risk_off"],
      region: "US",
      surpriseFactor: 5,
      assetFocus: ["S&P 500"],
      dateHint: null,
      rationale: "structural crash",
    },
    mustContain: ["1987-black-monday"],
    niceToHave: ["2010-flash-crash", "2018-volmageddon"],
  },
];
