/**
 * Controlled vocabulary of regime tags.
 *
 * Tags are the structured side of the two-stage retrieval. The Jaccard
 * similarity over tag sets is deterministic and auditable; embeddings
 * cover semantic nuance the tags miss. Both are scored and shown in the
 * "show your work" panel.
 *
 * Adding a new tag is a deliberate act — every event in data/events.ts
 * must be re-tagged consistently or retrieval drifts. Keep the list lean.
 */

export const REGIME_TAGS = [
  // Inflation
  "inflation_rising",
  "inflation_falling",
  "inflation_high",
  "deflation_risk",
  "stagflation_risk",

  // Growth
  "growth_strong",
  "growth_slowing",
  "recession_risk",
  "recession_underway",

  // Monetary policy
  "fed_hiking",
  "fed_cutting",
  "fed_hold",
  "fed_surprise_hawkish",
  "fed_surprise_dovish",
  "qe_active",
  "qt_active",
  "ecb_hiking",
  "ecb_cutting",
  "boj_normalizing",
  "boj_easing",
  "boe_hiking",
  "china_easing",
  "china_tightening",

  // Currency
  "usd_strong",
  "usd_weak",
  "em_fx_stress",
  "peg_break_risk",
  "peg_break",
  "jpy_carry_unwind",
  "currency_devaluation",

  // Credit
  "credit_widening",
  "credit_tightening",
  "hy_stress",
  "ig_calm",
  "sovereign_stress",
  "sovereign_default",
  "bank_stress",
  "bank_failure",

  // Risk regime
  "risk_off",
  "risk_on",
  "vol_spiking",
  "vol_compressed",
  "flight_to_quality",
  "dollar_squeeze",
  "liquidity_squeeze",

  // Geopolitics
  "war_outbreak",
  "war_active",
  "war_risk",
  "sanctions_active",
  "energy_shock",
  "tariff_war",
  "trade_dispute",
  "geopolitical_tail",
  "terrorist_attack",
  "regime_change",

  // Structural / market
  "bubble_late_stage",
  "bubble_burst",
  "flash_crash",
  "leverage_high",
  "leverage_low",
  "positioning_extreme_long",
  "positioning_extreme_short",

  // Asset-class state
  "equities_bear",
  "equities_bull",
  "equities_correction",
  "bonds_selloff",
  "bonds_rally",
  "oil_surging",
  "oil_collapsing",
  "gold_surging",

  // Other
  "debt_ceiling",
  "downgrade_risk",
  "downgrade_event",
  "election_uncertainty",
  "policy_uncertainty",
  "pandemic_active",
  "natural_disaster",
] as const;

export type RegimeTag = (typeof REGIME_TAGS)[number];

export const REGIME_TAG_SET = new Set<string>(REGIME_TAGS);

export const TRIGGER_TYPES = [
  "monetary_policy",
  "fiscal_policy",
  "trade_policy",
  "geopolitical",
  "credit_event",
  "currency_event",
  "commodity_event",
  "structural_event",
  "bubble_burst",
  "pandemic_disaster",
  "election_political",
] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number];

export const REGIONS = [
  "US",
  "EU",
  "UK",
  "JP",
  "CN",
  "EM",
  "GLOBAL",
] as const;

export type Region = (typeof REGIONS)[number];

/**
 * Jaccard similarity over two sets of regime tags.
 * Returns a value in [0, 1]. Identical tag sets score 1.
 */
export function jaccardSimilarity(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersect = 0;
  for (const tag of setA) if (setB.has(tag)) intersect++;
  const union = setA.size + setB.size - intersect;
  return union === 0 ? 0 : intersect / union;
}
