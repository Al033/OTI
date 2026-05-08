/**
 * Asset-move source mapping for `pnpm refresh-prices`. Each asset has:
 *   - A primary source (FRED for rates/yields/spreads/macro; Stooq for
 *     long-history equities).
 *   - A "transform" describing how a t+h observation becomes a return:
 *       pct  — percentage change vs t (S&P, DXY, gold, oil)
 *       bps  — basis-point change vs t (UST 10Y yield, HY OAS)
 *       lvl  — absolute-level change vs t (VIX, in absolute index points)
 *   - A startDate before which the underlying series simply doesn't
 *     exist (pre-1990 VIX, pre-1996 HY OAS, pre-1986 oil).
 *
 * The refresh script computes returns at 1d / 5d / 1m / 3m / 6m horizons
 * (≈ 1, 5, 21, 63, 126 trading days). For each event in the corpus we
 * pull a window covering [event_date - 5, event_date + 6 months + 5] and
 * compute the snapped-to-trading-day returns.
 */

export type Asset = "sp500" | "ust10y" | "dxy" | "gold" | "oil" | "creditHY" | "vix";

export type Transform = "pct" | "bps" | "lvl";

export interface AssetSource {
  asset: Asset;
  transform: Transform;
  /** FRED series id when the canonical source is FRED. */
  fred?: string;
  /** Stooq symbol when only Stooq has the long history. */
  stooq?: string;
  /** ISO yyyy-mm-dd; events earlier than this stay null on this asset. */
  startDate: string;
}

export const ASSET_SOURCES: ReadonlyArray<AssetSource> = [
  // Equities — Stooq has the longer history (^spx back to 1789 in their data
  // but consistently usable from ~1928); FRED's SP500 is licensing-limited
  // to ~10y. Use Stooq.
  { asset: "sp500", transform: "pct", stooq: "^spx", startDate: "1928-01-03" },
  // 10y UST yield (% level), bps difference at horizons.
  { asset: "ust10y", transform: "bps", fred: "DGS10", startDate: "1962-01-02" },
  // Trade-weighted USD broad — DTWEXBGS goes back to 2006. Pre-2006 we'd
  // need to splice DXY index from Stooq; for now leave nulls earlier.
  { asset: "dxy", transform: "pct", fred: "DTWEXBGS", startDate: "2006-01-04" },
  // Gold — LBMA PM fix (FRED, daily, post-1968).
  {
    asset: "gold",
    transform: "pct",
    fred: "GOLDPMGBD228NLBM",
    startDate: "1968-04-01",
  },
  // WTI Cushing — FRED DCOILWTICO from 1986-01-02.
  { asset: "oil", transform: "pct", fred: "DCOILWTICO", startDate: "1986-01-02" },
  // ICE BofA US HY OAS (percentage points), bps difference.
  {
    asset: "creditHY",
    transform: "bps",
    fred: "BAMLH0A0HYM2",
    startDate: "1996-12-31",
  },
  // VIX — FRED VIXCLS from 1990-01-02.
  { asset: "vix", transform: "lvl", fred: "VIXCLS", startDate: "1990-01-02" },
];

/** Trading-day offsets per horizon. ~21 trading days/month is the
 *  standard convention; we do not adjust for individual holidays at
 *  this resolution. */
export const HORIZON_OFFSETS = [
  { key: "d1", days: 1 },
  { key: "d5", days: 5 },
  { key: "m1", days: 21 },
  { key: "m3", days: 63 },
  { key: "m6", days: 126 },
] as const;

export type HorizonKey = (typeof HORIZON_OFFSETS)[number]["key"];
