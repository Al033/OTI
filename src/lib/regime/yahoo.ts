/**
 * Yahoo Finance fallback for series FRED doesn't carry. Used for ^MOVE
 * (rates volatility) and ^SKEW. The unofficial chart endpoint is stable
 * across 2024-2026 in practice; we wrap it in retry-with-backoff and
 * never make it the sole source for any vector dim — if Yahoo flakes,
 * the dim is null and Mahalanobis falls back to the partial-vector
 * pathway.
 */

const YAHOO_BASE = "https://query2.finance.yahoo.com/v8/finance/chart/";

export interface YahooDailyPoint {
  date: string; // ISO yyyy-mm-dd
  close: number;
}

export interface YahooWindowOpts {
  symbol: string;
  /** ISO yyyy-mm-dd, end of window. */
  asOf: string;
  /** How many years of history to pull. */
  yearsBack?: number;
  /** Override per-attempt timeout (ms). */
  timeoutMs?: number;
  /** Number of retry attempts on 5xx / network errors. */
  retries?: number;
  signal?: AbortSignal;
}

/**
 * Fetch up to N years of daily closes for a Yahoo symbol, ending on or
 * before `asOf`. Returns [] on hard failure — caller decides whether to
 * propagate or accept a missing dim.
 */
export async function fetchYahooDaily(
  opts: YahooWindowOpts,
): Promise<YahooDailyPoint[]> {
  const yearsBack = opts.yearsBack ?? 6;
  const period2 = Math.floor(new Date(opts.asOf).getTime() / 1000);
  const period1 =
    period2 - Math.floor(yearsBack * 365.25 * 24 * 60 * 60);
  const url = `${YAHOO_BASE}${encodeURIComponent(opts.symbol)}?interval=1d&period1=${period1}&period2=${period2}&events=history&includePrePost=false`;

  const retries = opts.retries ?? 2;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, opts.timeoutMs ?? 8000, opts.signal);
      if (!res.ok) {
        if (res.status >= 500 && attempt < retries) {
          await delay(250 * (attempt + 1));
          continue;
        }
        return [];
      }
      const json = (await res.json()) as YahooChartResponse;
      const result = json.chart?.result?.[0];
      if (!result) return [];

      const timestamps = result.timestamp ?? [];
      const closes = result.indicators?.quote?.[0]?.close ?? [];
      const out: YahooDailyPoint[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const c = closes[i];
        if (c === null || c === undefined || !Number.isFinite(c)) continue;
        const iso = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);
        out.push({ date: iso, close: c });
      }
      return out;
    } catch (err) {
      if (attempt < retries) {
        await delay(250 * (attempt + 1));
        continue;
      }
      console.warn(
        `[yahoo] ${opts.symbol}: ${err instanceof Error ? err.message : err}`,
      );
      return [];
    }
  }
  return [];
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  parentSignal?: AbortSignal,
): Promise<Response> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  if (parentSignal) {
    parentSignal.addEventListener(
      "abort",
      () => ac.abort(),
      { once: true },
    );
  }
  try {
    return await fetch(url, {
      signal: ac.signal,
      headers: {
        // Yahoo throttles bare requests; a UA seems to help in practice.
        "User-Agent": "Mozilla/5.0 (compatible; OTI/0.3; +https://github.com/Al033/OTI)",
        Accept: "application/json",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface YahooChartResponse {
  chart: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
}
