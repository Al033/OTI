/**
 * Stooq daily CSV fetcher. The endpoint returns a header row + one
 * row per trading day for the requested window:
 *
 *   GET https://stooq.com/q/d/l/?s=^spx&d1=20070801&d2=20080301&i=d
 *   Date,Open,High,Low,Close,Volume
 *   2007-08-01,1455.27,1465.81,1455.27,1465.81,...
 *   ...
 *
 * Reliability notes (May 2026): Stooq is free for the per-symbol
 * `q/d/l/` endpoint but subject to rate-throttling and occasional
 * 403s. We retry with backoff and accept that some windows simply
 * fail — the refresh script will fall back to FRED or skip the asset.
 *
 * Symbols: caret + lowercase for indices (`^spx`, `^vix`, `^dxy`).
 */

const STOOQ_BASE = "https://stooq.com/q/d/l/";

export interface StooqDailyPoint {
  date: string; // ISO yyyy-mm-dd
  close: number;
}

export interface StooqWindowOpts {
  symbol: string;
  /** ISO yyyy-mm-dd */
  start: string;
  /** ISO yyyy-mm-dd */
  end: string;
  retries?: number;
  signal?: AbortSignal;
}

export async function fetchStooqDaily(
  opts: StooqWindowOpts,
): Promise<StooqDailyPoint[]> {
  const url = `${STOOQ_BASE}?s=${encodeURIComponent(opts.symbol)}&d1=${opts.start.replace(/-/g, "")}&d2=${opts.end.replace(/-/g, "")}&i=d`;
  const retries = opts.retries ?? 2;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: opts.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OTI-refresh/0.4)",
          Accept: "text/csv,*/*",
        },
      });
      if (!res.ok) {
        if (attempt < retries && res.status >= 500) {
          await delay(500 * (attempt + 1));
          continue;
        }
        return [];
      }
      const text = await res.text();
      return parseCsv(text);
    } catch (err) {
      if (attempt < retries) {
        await delay(500 * (attempt + 1));
        continue;
      }
      console.warn(
        `[stooq] ${opts.symbol}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }
  return [];
}

function parseCsv(text: string): StooqDailyPoint[] {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  const header = lines[0].toLowerCase();
  // Stooq sometimes returns a "No data" string on bad symbols.
  if (!header.includes("date") || !header.includes("close")) return [];

  const cols = header.split(",");
  const dateIdx = cols.indexOf("date");
  const closeIdx = cols.indexOf("close");
  if (dateIdx < 0 || closeIdx < 0) return [];

  const out: StooqDailyPoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const parts = row.split(",");
    if (parts.length <= Math.max(dateIdx, closeIdx)) continue;
    const date = parts[dateIdx];
    const closeNum = Number.parseFloat(parts[closeIdx]);
    if (!Number.isFinite(closeNum)) continue;
    out.push({ date, close: closeNum });
  }
  return out;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
