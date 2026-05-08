/**
 * Thin FRED REST client. No SDK, no Python — the API is one endpoint
 * shape and a query string.
 *
 *   GET https://api.stlouisfed.org/fred/series/observations
 *     ?series_id=VIXCLS
 *     &api_key=$FRED_API_KEY
 *     &file_type=json
 *     &observation_start=2003-01-01
 *     &observation_end=2008-09-15
 *     &sort_order=asc
 *
 * 120 req/min rate limit (per their docs). For OTI's daily cron + corpus
 * centroid build, we stay nowhere near that.
 */

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

export interface FredObservation {
  date: string; // ISO
  value: number; // null observations are filtered out
}

export interface FredFetchOpts {
  seriesId: string;
  /** ISO yyyy-mm-dd inclusive lower bound. */
  observationStart?: string;
  /** ISO yyyy-mm-dd inclusive upper bound. */
  observationEnd?: string;
  /** Limit the number of returned observations. */
  limit?: number;
  /** "asc" (default) or "desc". */
  sortOrder?: "asc" | "desc";
  signal?: AbortSignal;
}

/**
 * Fetch a series from FRED. Throws if FRED_API_KEY is missing or the API
 * rejects the request.
 */
export async function fetchFredSeries(opts: FredFetchOpts): Promise<FredObservation[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error("FRED_API_KEY is not set");
  }
  const params = new URLSearchParams({
    series_id: opts.seriesId,
    api_key: apiKey,
    file_type: "json",
    sort_order: opts.sortOrder ?? "asc",
  });
  if (opts.observationStart) params.set("observation_start", opts.observationStart);
  if (opts.observationEnd) params.set("observation_end", opts.observationEnd);
  if (opts.limit) params.set("limit", String(opts.limit));

  const res = await fetch(`${FRED_BASE}?${params.toString()}`, {
    signal: opts.signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`FRED ${opts.seriesId}: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as {
    observations: Array<{ date: string; value: string }>;
  };
  return data.observations
    .filter((o) => o.value !== "." && o.value !== null && o.value !== undefined)
    .map((o) => ({
      date: o.date,
      value: Number.parseFloat(o.value),
    }))
    .filter((o) => Number.isFinite(o.value));
}

/**
 * Fetch the most recent observation up to a date. Returns null if FRED
 * has nothing in range or the key is missing — calling code can fall
 * back to alternate sources or accept a null vector dim.
 */
export async function fetchFredLatestUpTo(
  seriesId: string,
  asOf: string,
  signal?: AbortSignal,
): Promise<FredObservation | null> {
  if (!process.env.FRED_API_KEY) return null;
  try {
    const obs = await fetchFredSeries({
      seriesId,
      observationEnd: asOf,
      sortOrder: "desc",
      limit: 1,
      signal,
    });
    return obs[0] ?? null;
  } catch (err) {
    console.warn(`[fred] ${seriesId}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

/**
 * Fetch a window of observations for trailing z-score windows. Keeps the
 * call to FRED bounded: we ask for ~6 years of daily data so the 1260-
 * trading-day window can be computed with margin.
 */
export async function fetchFredWindow(args: {
  seriesId: string;
  asOf: string; // ISO
  yearsBack?: number;
  signal?: AbortSignal;
}): Promise<FredObservation[]> {
  if (!process.env.FRED_API_KEY) return [];
  const yearsBack = args.yearsBack ?? 6;
  const start = new Date(args.asOf);
  start.setUTCFullYear(start.getUTCFullYear() - yearsBack);
  try {
    return await fetchFredSeries({
      seriesId: args.seriesId,
      observationStart: start.toISOString().slice(0, 10),
      observationEnd: args.asOf,
      sortOrder: "asc",
      signal: args.signal,
    });
  } catch (err) {
    console.warn(`[fred] ${args.seriesId} window: ${err instanceof Error ? err.message : err}`);
    return [];
  }
}
