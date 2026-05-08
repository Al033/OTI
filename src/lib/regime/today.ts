/**
 * Cached fetcher for today's macro z-vector. Used by the user-event
 * retrieval pipeline (when fusion is enabled) and by the daily-regime
 * cron orchestrator.
 *
 * Cache strategy: prefer the persisted `regime_snapshots` row for today
 * (populated by the daily cron). When unavailable, compute on the fly
 * via buildRegimeSnapshot — but THIS IS EXPENSIVE (8 FRED + Yahoo
 * fetches), so the result is held in process memory for 1h to amortise
 * across concurrent requests.
 *
 * Returns null when nothing's available (no FRED key, etc.) — the
 * caller falls back to text-only retrieval.
 */

import { buildRegimeSnapshot } from "./snapshot";
import { getSnapshot } from "./store";

interface CacheEntry {
  zVector: Array<number | null>;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
let _cache: CacheEntry | null = null;

export async function fetchTodayMacroZ(): Promise<Array<number | null> | null> {
  const now = Date.now();
  if (_cache && _cache.expiresAt > now) return _cache.zVector;

  const today = new Date().toISOString().slice(0, 10);

  // Prefer persisted snapshot (set by the cron).
  const snap = await getSnapshot(today);
  if (snap) {
    _cache = { zVector: snap.zVector, expiresAt: now + CACHE_TTL_MS };
    return _cache.zVector;
  }

  // Compute on the fly. Skips silently if FRED isn't configured.
  if (!process.env.FRED_API_KEY) return null;

  try {
    const built = await buildRegimeSnapshot(today);
    _cache = { zVector: built.zVector, expiresAt: now + CACHE_TTL_MS };
    return _cache.zVector;
  } catch (err) {
    console.warn("[today] regime snapshot failed:", err);
    return null;
  }
}
