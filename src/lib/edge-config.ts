/**
 * Vercel Edge Config — sub-5ms global reads for "hot" config that
 * changes rarely (multiple times a day at most).
 *
 * Used by:
 *   - Home page TodayStrip: read `today_regime_tag` + `today_headline`
 *     without hitting Postgres on every page render.
 *   - Live "is the corpus current?" check: read `corpus_version_hash`,
 *     compare with the in-process CORPUS_VERSION; show a stale banner
 *     when they diverge.
 *
 * Writes happen from the regime-snapshot cron after a successful daily
 * brief generation. The Vercel Edge Config write API is HTTP — see
 * lib/edge-config-writer.ts for the cron-side path.
 *
 * Falls back to null when EDGE_CONFIG isn't set (dev / no-Vercel
 * deployments). Callers must tolerate null.
 */

interface CachedConfig {
  today: {
    date: string;
    headline: string;
    topAnalogueId: string;
    topAnalogueTitle: string;
    similarity: number;
  } | null;
  corpusVersion: string | null;
}

let _cache: CachedConfig | null = null;
let _cacheExpiresAt = 0;
const PROCESS_CACHE_MS = 30_000; // 30s, in addition to Edge Config's own caching

export async function readEdgeConfig(): Promise<CachedConfig> {
  const now = Date.now();
  if (_cache && _cacheExpiresAt > now) return _cache;

  if (!process.env.EDGE_CONFIG) {
    _cache = { today: null, corpusVersion: null };
    _cacheExpiresAt = now + PROCESS_CACHE_MS;
    return _cache;
  }

  try {
    // Dynamic import so the dep is optional at runtime.
    const mod = await import("@vercel/edge-config");
    const all = await mod.getAll<Record<string, unknown>>();
    _cache = {
      today: (all?.oti_today as CachedConfig["today"]) ?? null,
      corpusVersion: (all?.oti_corpus_version as string) ?? null,
    };
    _cacheExpiresAt = now + PROCESS_CACHE_MS;
    return _cache;
  } catch (err) {
    console.warn("[edge-config] read failed, falling back to null:", err);
    _cache = { today: null, corpusVersion: null };
    _cacheExpiresAt = now + PROCESS_CACHE_MS;
    return _cache;
  }
}
