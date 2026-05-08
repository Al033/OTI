/**
 * The 8-component macro-state vector — OTI's "regime fingerprint".
 *
 * Measured at any market date, z-scored against the trailing 1260-day
 * (≈5-year) window. Same vector definition is used for:
 *
 *   1. Daily snapshots (today's regime, populated by cron at 21:05 UTC).
 *   2. Historical centroids (one vector per corpus event, populated at
 *      build time by `pnpm regime:centroids`).
 *
 * The k-NN match between today's vector and the corpus centroids is
 * Mahalanobis distance with a Ledoit-Wolf-shrunk covariance matrix —
 * the canonical pattern from Kritzman & Li (2010).
 *
 * Pre-1990 events lack VIX (component 1); pre-1996 lack HY OAS (3);
 * pre-1976 lack DGS2 (4); pre-2003 lack T10YIE (6). We store nulls in
 * those positions; the distance computation restricts comparison to the
 * intersection of present dims and requires ≥5 of 8 to be present in
 * both vectors before declaring a match.
 *
 * Schema bumps require a `REGIME_VECTOR_VERSION` bump and a corpus
 * re-centroid pass (`pnpm regime:centroids --force`).
 */

export const REGIME_VECTOR_VERSION = "v1";

export interface RegimeComponent {
  key: string;
  label: string;
  /** FRED series id when that's the canonical source. */
  fredSeries?: string;
  /** Yahoo Finance ticker when FRED doesn't have it. */
  yahooSymbol?: string;
  /** Earliest date the underlying series is reliably available (ISO). */
  startDate: string;
  /** Transformation applied before z-scoring. */
  transform:
    | "level"
    | "log_level"
    | "log_return_60d"
    | "deviation_from_12m_mean";
  description: string;
}

export const REGIME_COMPONENTS: ReadonlyArray<RegimeComponent> = [
  {
    key: "vix",
    label: "Equity vol",
    fredSeries: "VIXCLS",
    startDate: "1990-01-02",
    transform: "log_level",
    description: "S&P 500 implied vol. Z-scored on log to fatten the lower tail.",
  },
  {
    key: "move",
    label: "Rates vol",
    yahooSymbol: "^MOVE",
    startDate: "1988-04-08",
    transform: "log_level",
    description: "ICE BofAML Treasury rates implied vol.",
  },
  {
    key: "hy_oas",
    label: "HY credit",
    fredSeries: "BAMLH0A0HYM2",
    startDate: "1996-12-31",
    transform: "level",
    description: "ICE BofA US HY OAS, percentage points.",
  },
  {
    key: "term_slope",
    label: "Term slope",
    fredSeries: "T10Y2Y", // Pre-computed FRED series = DGS10 - DGS2.
    startDate: "1976-06-01",
    transform: "level",
    description: "10y minus 2y UST yield, percentage points.",
  },
  {
    key: "real_rate",
    label: "Real rate",
    fredSeries: "DFII10", // 10y TIPS yield, ≈ real rate.
    startDate: "2003-01-02",
    transform: "level",
    description: "10y TIPS yield as the real-rate proxy.",
  },
  {
    key: "breakeven_5y",
    label: "Inflation breakeven",
    fredSeries: "T5YIE",
    startDate: "2003-01-02",
    transform: "level",
    description: "5y breakeven inflation rate.",
  },
  {
    key: "dollar",
    label: "Dollar regime",
    fredSeries: "DTWEXBGS",
    startDate: "2006-01-02",
    transform: "log_return_60d",
    description: "Trade-weighted USD index, 60-day log-return.",
  },
  {
    key: "policy_stance",
    label: "Policy stance",
    fredSeries: "DFF",
    startDate: "1954-07-01",
    transform: "deviation_from_12m_mean",
    description: "Effective fed funds rate minus 12m trailing mean.",
  },
] as const;

export const REGIME_DIMENSIONS = REGIME_COMPONENTS.length;

/** The number of components a vector must have populated to be eligible
 *  for k-NN matching. Set deliberately conservative: any pair with
 *  fewer than 5 overlapping dims is excluded from matching. */
export const REGIME_MIN_OVERLAP = 5;

/**
 * Apply a component's transform. Each transform consumes the raw point
 * value plus enough history for context (e.g. 12m for the policy stance).
 *
 * Returns null when the inputs are insufficient.
 */
export function applyTransform(args: {
  component: RegimeComponent;
  asOfDate: string; // ISO
  // Series points sorted ascending by date, with iso date keys.
  history: Array<{ date: string; value: number }>;
}): number | null {
  const { component, asOfDate, history } = args;
  if (history.length === 0) return null;

  const upTo = history.filter((p) => p.date <= asOfDate);
  if (upTo.length === 0) return null;
  const last = upTo[upTo.length - 1];

  switch (component.transform) {
    case "level":
      return last.value;
    case "log_level":
      return last.value > 0 ? Math.log(last.value) : null;
    case "log_return_60d": {
      // 60 trading days back, approximated as 60 calendar slots in the array.
      if (upTo.length < 61) return null;
      const past = upTo[upTo.length - 61];
      if (past.value <= 0 || last.value <= 0) return null;
      return Math.log(last.value / past.value);
    }
    case "deviation_from_12m_mean": {
      // 252 trading days ≈ 12 months.
      if (upTo.length < 252) return null;
      const window = upTo.slice(-252);
      const mean = window.reduce((acc, p) => acc + p.value, 0) / window.length;
      return last.value - mean;
    }
  }
}

/**
 * Z-score a single point against a trailing window of historical points,
 * each of which has already been transformed.
 *
 * windowSize defaults to 1260 trading days (≈5 years).
 */
export function zScore(
  point: number,
  history: number[],
  windowSize = 1260,
): number | null {
  if (history.length < 60) return null; // need at least ~3 months of history
  const window = history.slice(-windowSize);
  const mean = window.reduce((a, b) => a + b, 0) / window.length;
  const variance =
    window.reduce((acc, x) => acc + (x - mean) ** 2, 0) / window.length;
  const sd = Math.sqrt(variance);
  if (!Number.isFinite(sd) || sd < 1e-9) return null;
  return (point - mean) / sd;
}
