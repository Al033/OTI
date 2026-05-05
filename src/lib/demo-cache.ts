import { retrieve } from "./retrieval";
import type { PipelineResult, QueryTags } from "./types";

/**
 * Pre-computed outputs for a small set of example queries so the public
 * landing page works without API keys (and without burning LLM cost
 * when the demo is shared on social media).
 *
 * Tagging is the deterministic-vocabulary side of the pipeline so we
 * compute it inline; only the synthesis output is hand-written.
 */

interface DemoExample {
  id: string;
  label: string;
  query: string;
  queryTags: QueryTags;
  brief: PipelineResult["brief"];
}

const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: "trump-tariffs",
    label: "Trump 'Liberation Day' tariffs",
    query: "Trump announces 25% tariffs on essentially all US trading partners.",
    queryTags: {
      triggerType: "trade_policy",
      regimeTags: [
        "tariff_war",
        "trade_dispute",
        "policy_uncertainty",
        "geopolitical_tail",
        "vol_spiking",
        "growth_slowing",
      ],
      region: "GLOBAL",
      surpriseFactor: 5,
      assetFocus: ["S&P 500", "USD", "USTs", "credit"],
      dateHint: null,
      rationale:
        "Broad reciprocal-tariff regime change, methodologically aggressive, with cross-asset uncertainty premium and growth-slowing signal.",
    },
    brief: {
      headline:
        "Three echoes of a methodological tariff escalation",
      oneLineSummary:
        "Across these three regimes, the dominant pattern was that the dollar's role in the stress regime was the single most important divergence — not the equity drawdown.",
      analogues: [
        {
          eventId: "2025-trump-liberation-day",
          whyAnalogous:
            "Same regime profile and same methodological vector — reciprocal tariff calculation that includes VAT and non-tariff measures, applied at scale rather than bilaterally. Equity drawdown was modest and policy-reversible; the structural surprise was USD selling rather than safe-haven bid.",
          whereThisMightNotFit:
            "If your event is incremental rather than structural, the 2025 dynamic is more severe than the analogue you need.",
          fitConfidence: 0.92,
        },
        {
          eventId: "2018-powell-pivot-eve",
          whyAnalogous:
            "Both episodes featured policy uncertainty stacking on top of an already-tightening Fed and ongoing trade-war anxiety. The Q4 2018 selloff teaches how concurrent policy-tightening regimes amplify drawdowns into year-end illiquidity.",
          whereThisMightNotFit:
            "The 2018 catalyst was monetary, not trade; tariff-only stress lacks the QT-feedback channel that drove the 2018 cascade.",
          fitConfidence: 0.62,
        },
        {
          eventId: "1971-nixon-shock",
          whyAnalogous:
            "Both events involved unilateral US trade-policy moves (tariffs/import surcharge) that altered the implicit reserve-currency framework. The 1971 episode shows how a USD-source policy shock can produce immediate dollar weakening rather than safe-haven bid — exactly the 2025 pattern.",
          whereThisMightNotFit:
            "1971's gold-window closing was a regime-defining structural break; today's tariff regime is reversible by executive order. The episodes rhyme on the dollar dynamic, not on permanence.",
          fitConfidence: 0.71,
        },
      ],
      disagreementNote:
        "Across these three episodes, equity recovery times ranged from 4 weeks (2025 once tariffs paused) to over 18 months (1971 into stagflation). Direction agreed; speed and depth did not.",
      failedTradesPattern:
        "The recurring failed trade is 'long USD as a risk-off hedge' when the US is the source of the policy shock. The dollar's safe-haven response inverts when policy uncertainty is endogenous to the US, not external. Long-duration UST positions also failed in 1971 and 2025 as foreign reserve managers reduced USD asset exposure.",
      consensusError:
        "Consensus systematically underprices regime changes that erode the implicit USD reserve-currency premium. Each of these three episodes was viewed as bilateral or tactical when first announced; the cross-asset re-pricing of US assets unfolded over weeks, not days.",
      caveats: [
        "The 2025 tariff regime was paused for 90 days within a week of announcement; analogues lasted longer in their original form, which biases recovery comparisons.",
        "The 1971 analogue is from an explicit fixed-FX regime, which does not exist today.",
        "Asset-move horizons are computed from the announcement date and do not adjust for the policy-pause headlines.",
      ],
    },
  },

  {
    id: "fed-surprise-cut",
    label: "Fed surprise 50bp cut",
    query:
      "The Federal Reserve surprises markets with an inter-meeting 50bp emergency rate cut.",
    queryTags: {
      triggerType: "monetary_policy",
      regimeTags: [
        "fed_cutting",
        "fed_surprise_dovish",
        "credit_widening",
        "vol_spiking",
        "risk_off",
        "policy_uncertainty",
      ],
      region: "US",
      surpriseFactor: 5,
      assetFocus: ["S&P 500", "USTs", "credit", "USD"],
      dateHint: null,
      rationale:
        "Inter-meeting emergency action with dovish surprise — historically associated with credit-stress or growth-shock backstops.",
    },
    brief: {
      headline: "Three echoes of an emergency Fed pivot",
      oneLineSummary:
        "Surprise cuts cluster around credit-stress events, not growth-data revisions. The lesson across all three is that the cut is a confirmation of stress, not a removal of it.",
      analogues: [
        {
          eventId: "1998-russia-ltcm",
          whyAnalogous:
            "The Fed cut three times in seven weeks including a surprise inter-meeting cut after LTCM was rescued — the canonical template for emergency easing into hedge-fund-leverage stress. Equity bottoms occurred near the surprise cut, not before.",
          whereThisMightNotFit:
            "1998's stress was concentrated in convergence-trade leverage; if your current stress is broader (banks, sovereigns), 2008 is the closer template.",
          fitConfidence: 0.85,
        },
        {
          eventId: "2020-covid-crash",
          whyAnalogous:
            "March 2020 saw the Fed cut 50bp inter-meeting (March 3) followed by 100bp emergency cut (March 15). The surprise-cut pattern was repeated and accelerated by an unprecedented funding-market crisis. Equity recovery was V-shaped once the policy backstop arrived in scale.",
          whereThisMightNotFit:
            "2020 had a one-of-a-kind exogenous shock (pandemic) and an unprecedented fiscal-monetary scale. Emergency cuts in less extreme stress regimes do not produce as fast a recovery.",
          fitConfidence: 0.78,
        },
        {
          eventId: "2008-lehman",
          whyAnalogous:
            "Fed cuts and emergency-facility creation through Q4 2008 are the canonical example of how surprise easing into a balance-sheet crisis is necessary but not sufficient. Equity markets continued lower for months after the policy turn.",
          whereThisMightNotFit:
            "2008's surprise was the failure to backstop, not the cuts themselves. If your event is purely an easing surprise without a balance-sheet event, this analogue overweights the credit-cascade dynamic.",
          fitConfidence: 0.66,
        },
      ],
      disagreementNote:
        "These three regimes diverge sharply on the time-to-equity-bottom: 1998 (~6 weeks), 2020 (~2 weeks post-cut), 2008 (~6 months post-cut). Treating an emergency cut as a buy signal works in the first two but not the third.",
      failedTradesPattern:
        "The recurring failure is 'sell the news' on the cut itself — which works in 2008 but produces sharp losses in 1998 and 2020. Trades that worked: short-duration credit on stable carry into recovery, and equity exposure scaled to the policy-response signal rather than to the price drop.",
      consensusError:
        "Consensus tends to interpret emergency cuts as the bottom signal. They are the bottom signal when the underlying stress is positioning-driven (1998) or shock-driven (2020), but not when the stress is balance-sheet-driven (2008). Distinguishing those is the entire game.",
      caveats: [
        "Two of three analogues had dramatic policy-frameworks responses (TARP, CARES Act). A purely monetary-only emergency cut is rarer in the dataset.",
        "The 1998 case had hedge-fund-specific contagion that does not generalise.",
        "Emergency cuts coincide with extreme vol spikes; many positions are not tradeable in the windows shown.",
      ],
    },
  },

  {
    id: "yields-spike",
    label: "Bond yields spike to 5%",
    query: "US 10-year Treasury yields rapidly spike toward 5% on inflation worries.",
    queryTags: {
      triggerType: "monetary_policy",
      regimeTags: [
        "bonds_selloff",
        "fed_hiking",
        "inflation_rising",
        "fed_surprise_hawkish",
        "vol_spiking",
        "credit_widening",
      ],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["USTs", "S&P 500", "USD", "credit"],
      dateHint: null,
      rationale:
        "Sharp duration repricing on inflation persistence; structurally similar to first-hike or surprise-tightening regimes.",
    },
    brief: {
      headline: "Three echoes of a violent duration repricing",
      oneLineSummary:
        "Bond drawdowns of this magnitude historically produce equity correction but not sustained bear, as long as growth holds. The risk is in the convexity-product feedback rather than the level itself.",
      analogues: [
        {
          eventId: "1994-greenspan-hike",
          whyAnalogous:
            "1994 produced a ~250bp 10y move and remains the cleanest analogue for a pure-rates repricing. The lesson: equities ended roughly flat despite the bond bear, but leveraged-fixed-income strategies and EM currencies broke under the duration unwind.",
          whereThisMightNotFit:
            "The 1994 episode was driven by unexpected Fed action; if your spike is driven by inflation persistence rather than Fed surprise, the cycle dynamics differ.",
          fitConfidence: 0.84,
        },
        {
          eventId: "2013-taper-tantrum",
          whyAnalogous:
            "A communication-only Fed signal in May 2013 drove a 100bp 10y rise over four months. EM-FX carry and high-yield credit were the highest-beta amplifiers. Equity absorbed the rates move because growth was strong.",
          whereThisMightNotFit:
            "2013 stress was largely overseas (EM); a domestic-focused yield spike (e.g., on US fiscal concerns) has different transmission.",
          fitConfidence: 0.76,
        },
        {
          eventId: "2022-uk-gilt-crisis",
          whyAnalogous:
            "Demonstrates the structural-leverage feedback loop when sovereign yields move violently. UK pension LDI books mirror the kind of structural duration positioning that exists in similar form across global pension and life-insurance balance sheets.",
          whereThisMightNotFit:
            "Gilt crisis was UK-specific and fiscal-credibility-driven; a US-yield spike on Fed reaction function rather than fiscal credibility may not produce the same forced-selling cascade.",
          fitConfidence: 0.55,
        },
      ],
      disagreementNote: null,
      failedTradesPattern:
        "Across all three: short volatility into duration-led stress fails. So does long mortgage-IO / negative-convexity strategies, which extend duration as yields rise and mechanically force selling. Long EM-FX carry consistently underperforms in violent rates regimes regardless of US growth.",
      consensusError:
        "Consensus tends to treat each spike as 'it can't go higher than X bps' until structural-leverage products break. The breaking point reveals the actual ceiling rather than fundamentals.",
      caveats: [
        "Two of these three analogues featured Fed action as catalyst; if the trigger is fiscal or external rather than monetary, the analogue strength is lower.",
        "Asset-move ranges across 1994/2013/2022 are wide; do not interpret medians as point estimates.",
        "VIX behaviour during rates-led drawdowns is muted relative to credit-led drawdowns.",
      ],
    },
  },

  {
    id: "china-deval",
    label: "China devalues the yuan",
    query: "The PBOC unexpectedly weakens the yuan fix, signalling a competitive devaluation.",
    queryTags: {
      triggerType: "currency_event",
      regimeTags: [
        "currency_devaluation",
        "china_easing",
        "em_fx_stress",
        "growth_slowing",
        "deflation_risk",
        "risk_off",
      ],
      region: "CN",
      surpriseFactor: 4,
      assetFocus: ["USD/CNY", "S&P 500", "oil", "EM credit"],
      dateHint: null,
      rationale:
        "China-led FX surprise with deflation export; historically a high-beta source of global cross-asset stress.",
    },
    brief: {
      headline: "Three echoes of a yuan devaluation surprise",
      oneLineSummary:
        "China FX moves are signal-rich because the PBOC manages tightly; small headline moves carry outsized information about underlying stress, especially for commodities and EM credit.",
      analogues: [
        {
          eventId: "2015-china-deval",
          whyAnalogous:
            "The Aug 2015 ~1.9% fix move was the canonical example of how a small headline FX action by the PBOC triggers global cross-asset re-pricing. Oil collapsed, EM credit widened, and global equities corrected. The deflation impulse from China dominated the next 12-month macro story.",
          whereThisMightNotFit:
            "2015 occurred against a backdrop of sliding Chinese growth and Fed liftoff; if today's environment is different in those vectors, the contagion path will differ.",
          fitConfidence: 0.91,
        },
        {
          eventId: "1997-thai-baht",
          whyAnalogous:
            "1997 demonstrates how an Asian-currency event can cascade through regional pegs and short-USD-funded leverage. While the proximate trigger was Thai, the contagion pattern (regional FX, USD bid, oil weakness, EM credit widening) is similar to a yuan-led episode.",
          whereThisMightNotFit:
            "China's role in 2025 differs from Thailand's in 1997 — China is a structurally larger economy with capital controls. Direct contagion via banking-system USD funding gaps is much smaller.",
          fitConfidence: 0.55,
        },
        {
          eventId: "2024-yen-carry-unwind",
          whyAnalogous:
            "JPY and CNH share a structural feature: both serve as funding currencies for cross-asset carry trades. Aug 2024 demonstrates how violent unwinds can be when funding-currency expectations shift suddenly. Risk-asset drawdowns can be deep but short-duration.",
          whereThisMightNotFit:
            "A devaluation moves CNH against the carry trade direction; a yen unwind reverses the carry. The mechanic is similar but the directional asset moves differ.",
          fitConfidence: 0.48,
        },
      ],
      disagreementNote:
        "Equity recovery times across these three range from days (2024) to weeks (2015) to many months (1997). The size of the underlying domestic banking-system stress determines the duration.",
      failedTradesPattern:
        "Long oil and long EM credit consistently fail in yuan/EM-led FX stress regimes, even when developed-market central banks ease in response. The underlying signal of deflation export from China is the dominant macro impulse for 6-12 months.",
      consensusError:
        "Consensus persistently underestimates the global-deflation signal value of China FX moves. The market reads them as bilateral USD/CNY events when they are systemic.",
      caveats: [
        "China's capital controls and reserves position make a 1997-style cascade unlikely, biasing the comparison.",
        "Two of three analogues are not direct CNY events; the structural carry parallel is partial.",
        "Asset-move ranges depend on the magnitude of the fix surprise; small adjustments behave differently than step-changes.",
      ],
    },
  },

  {
    id: "sov-bank-stress",
    label: "Major bank fails on duration losses",
    query:
      "A large regional bank fails after disclosing unrealised Treasury losses, triggering deposit outflows.",
    queryTags: {
      triggerType: "credit_event",
      regimeTags: [
        "bank_failure",
        "bank_stress",
        "credit_widening",
        "flight_to_quality",
        "vol_spiking",
        "liquidity_squeeze",
        "fed_surprise_dovish",
      ],
      region: "US",
      surpriseFactor: 4,
      assetFocus: ["S&P 500", "regional banks", "USTs", "USD"],
      dateHint: null,
      rationale:
        "Single-bank failure on duration-mismatch funding shock; Fed-facility response template applies.",
    },
    brief: {
      headline: "Three echoes of a duration-driven bank failure",
      oneLineSummary:
        "Modern bank runs complete in hours rather than days. Targeted Fed facilities can resolve specific transmission channels without broad QE — but mega-cap-tech leadership rather than broad equity weakness has been the post-2023 pattern.",
      analogues: [
        {
          eventId: "2023-svb-collapse",
          whyAnalogous:
            "Direct template for regional-bank failure on duration losses. The BTFP par-value-collateral facility resolved the Treasury-holding solvency concern within 72 hours. Mega-cap tech rallied on flight-to-quality plus AI thematic; KRE bank ETF fell ~30% peak-to-trough.",
          whereThisMightNotFit:
            "Today's environment may not have an AI-thematic bid to support mega-cap equities the way 2023 did. The dispersion between bank pain and broad-equity outcome may be smaller.",
          fitConfidence: 0.94,
        },
        {
          eventId: "2008-lehman",
          whyAnalogous:
            "2008 is the canonical bank-failure cascade; useful as the worst-case template for what happens if the policy backstop is ambiguous or delayed. The 2008 dynamics — money-market freeze, prime-broker withdrawals, USD short squeeze — define what 'cascade' means.",
          whereThisMightNotFit:
            "2008's structural fragilities (commercial-paper funding, opaque MBS collateral) are largely absent from the post-Dodd-Frank framework. The 2023 template is closer to today's institutional structure.",
          fitConfidence: 0.55,
        },
        {
          eventId: "2007-bnp-paribas",
          whyAnalogous:
            "BNP Paribas demonstrates how an early funding-stress signal in one institution often precedes broader crisis by months. Money-market dislocation and ECB liquidity injection patterns are the leading indicators worth watching after a single-bank failure.",
          whereThisMightNotFit:
            "BNP was a European-bank stress event; the US transmission channels are structurally different (Fed standing facilities, FHLB advances, BTFP).",
          fitConfidence: 0.62,
        },
      ],
      disagreementNote:
        "These three regimes had wildly different equity-market outcomes: 2023 saw indices rise on mega-cap tech leadership; 2008 saw a multi-month grind to new lows; 2007 had equities make new highs before turning. Same proximate cause, very different cross-asset paths.",
      failedTradesPattern:
        "Buying-the-dip in regional banks consistently fails until the broad bank-funding gap stabilises. Short equities expecting 2008-style cascades fails when targeted Fed facilities arrive in 24-72 hours. Long gold flight-to-quality has worked in 2007 and 2008 but underperformed mega-cap tech in 2023.",
      consensusError:
        "Consensus oscillates between extremes: either treating each bank failure as the 'next 2008' (overreaction) or dismissing it as idiosyncratic (underreaction). The 2023 lesson — that targeted facilities resolve specific transmission channels — is the modern playbook regulators apply.",
      caveats: [
        "The Fed's BTFP-style facility framework is now well-established; analogues without that institutional knowledge over-state risk.",
        "Mega-cap tech leadership in 2023 was specific to that period and may not repeat.",
        "Banking-system structural changes since 2008 (capital, liquidity, central clearing) reduce direct comparability with the older analogues.",
      ],
    },
  },

  {
    id: "war-shock",
    label: "Major-power war risk",
    query: "Tensions escalate between the US and China over Taiwan, with markets pricing war risk.",
    queryTags: {
      triggerType: "geopolitical",
      regimeTags: [
        "war_risk",
        "geopolitical_tail",
        "vol_spiking",
        "energy_shock",
        "tariff_war",
        "flight_to_quality",
        "policy_uncertainty",
      ],
      region: "GLOBAL",
      surpriseFactor: 5,
      assetFocus: ["S&P 500", "oil", "USD", "USTs", "gold"],
      dateHint: null,
      rationale:
        "Geopolitical tail-risk regime with energy and supply-chain transmission, distinct from prior tariff/trade-war episodes.",
    },
    brief: {
      headline: "Three echoes of a major-power tail risk",
      oneLineSummary:
        "War-risk premia historically peak before the conflict, not during. The cross-asset transmission depends on whether the tail risk fragments supply chains or reroutes them.",
      analogues: [
        {
          eventId: "2022-russia-ukraine",
          whyAnalogous:
            "Direct template for a major-power war initiation. Initial volatility and oil spike were short-duration; the dominant 2022 macro story shifted to inflation and Fed policy within three weeks. Sanctions impact persisted for some assets (Russian banks) and faded for others (commodities, where alternative buyers and routes emerged).",
          whereThisMightNotFit:
            "Russia-Ukraine had clear supply consequences in oil, gas, wheat, and fertilizer. A Taiwan crisis has different supply consequences (semiconductors, electronics) that are harder to reroute and may produce more durable economic damage.",
          fitConfidence: 0.78,
        },
        {
          eventId: "1990-iraq-kuwait",
          whyAnalogous:
            "1990 demonstrates the canonical 'tail-risk premium peaks before the conflict' pattern. Equity bottom preceded the war start by weeks; oil collapsed back to pre-invasion levels by April 1991. 'Buy when the bombs drop' worked because uncertainty resolution outweighed realised damage.",
          whereThisMightNotFit:
            "Iraq-Kuwait had a clear, decisive end (Operation Desert Storm). A Taiwan scenario likely involves no clean resolution and may persist as a structural tail-risk premium for years.",
          fitConfidence: 0.62,
        },
        {
          eventId: "2001-911",
          whyAnalogous:
            "9/11 demonstrates how a sudden geopolitical-tail shock to the US can compress to a 5-week round trip when central-bank response is decisive. The Fed cut 50bp on the re-open day. Demand-destruction shocks compress oil even when geopolitical premium is high.",
          whereThisMightNotFit:
            "9/11 was a one-time terrorist event with no ongoing supply-chain consequences. A sustained great-power tail risk has a different time signature.",
          fitConfidence: 0.45,
        },
      ],
      disagreementNote:
        "These three episodes had very different durations of tail-risk premium: 9/11 (weeks), Iraq-Kuwait (months), Russia-Ukraine (still ongoing as a structural feature). The duration determines the cross-asset trade.",
      failedTradesPattern:
        "Long oil for sustained war premium consistently fails in major-power crises. Short equities through the actual conflict initiation also consistently fails because uncertainty resolution rallies markets. Long gold has worked at the entry to the crisis but unwound on USD short squeeze in extreme stress.",
      consensusError:
        "Consensus prices war risk as a continuous tail premium when historically the premium is concentrated in the days before the conflict and decays sharply once the conflict starts. Macro narratives also tend to revert to whatever was dominant before the geopolitical shock within weeks (in 2022's case, inflation and Fed).",
      caveats: [
        "Taiwan-specific supply consequences (semiconductors) have no historical analogue at scale; the 2022 commodity playbook may not transfer.",
        "Current USD reserve-currency dynamics (post-2022 sanctions) may reduce the safe-haven bid relative to historical patterns.",
        "Three datapoints with very different durations make medians unreliable.",
      ],
    },
  },
];

export const DEMO_RESULTS: ReadonlyMap<string, PipelineResult> = new Map(
  DEMO_EXAMPLES.map((d) => {
    // The hand-written demo briefs were curated for narrative quality, so a
    // chosen analogue may rank below the top-10 of the deterministic Jaccard
    // retrieval. To keep the "show your work" panel coherent (every selected
    // analogue must be visible with its retrieval scores), pull the full
    // corpus ranking and union the top-10 with any chosen analogues that
    // would otherwise fall below it.
    const top10 = retrieve(d.queryTags, { topK: 10 });
    const fullRanked = retrieve(d.queryTags, { topK: 100 });
    const chosenIds = new Set(d.brief.analogues.map((a) => a.eventId));
    const inTop10 = new Set(top10.map((c) => c.eventId));
    const extras = fullRanked.filter(
      (c) => chosenIds.has(c.eventId) && !inTop10.has(c.eventId),
    );
    const candidates = [...top10, ...extras];

    const result: PipelineResult = {
      query: d.query,
      queryTags: d.queryTags,
      candidates,
      brief: d.brief,
      modelTag: "demo (precomputed)",
      modelSynth: "demo (precomputed)",
      durationMs: 0,
      generatedAt: "2025-04-15T00:00:00.000Z",
      isDemo: true,
    };
    return [d.id, result];
  }),
);

export const DEMO_EXAMPLE_LIST = DEMO_EXAMPLES.map(
  ({ id, label, query }) => ({ id, label, query }),
);
