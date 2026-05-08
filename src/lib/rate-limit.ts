import { NextRequest } from "next/server";

/**
 * Per-IP token-bucket rate limit. Bucket size and refill rate are
 * configurable; the default (10 tokens, 1 token / 6s) matches a
 * "burst of 10, sustained 10/min" budget — generous for humans, lethal
 * for `curl` loops.
 *
 * Storage is process-memory. On Vercel each Lambda is short-lived but
 * sticky-ish for warm invocations; this is good-enough at our traffic
 * levels and avoids a Redis dependency. When Vercel KV (or Upstash
 * Redis) is later wired in, swap the Map for a KV-backed store.
 *
 * We separately apply Vercel BotID at the edge if available — this
 * library is a defence-in-depth fallback when BotID returns "unknown".
 */

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

interface RateLimitConfig {
  capacity: number;
  refillPerSecond: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  capacity: 10,
  refillPerSecond: 1 / 6, // 10/min sustained
};

const buckets = new Map<string, Bucket>();

// Periodic eviction so the map doesn't grow unbounded across long-lived
// invocations. We evict buckets that are full (i.e. user is dormant).
let _lastSweepMs = 0;
function maybeSweep(now: number) {
  if (now - _lastSweepMs < 60_000) return;
  _lastSweepMs = now;
  for (const [key, b] of buckets) {
    if (b.tokens >= DEFAULT_CONFIG.capacity) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetSeconds: number;
}

export function consumeRateLimitToken(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): RateLimitResult {
  const now = Date.now();
  maybeSweep(now);
  const existing = buckets.get(key);
  const bucket: Bucket = existing ?? {
    tokens: config.capacity,
    lastRefillMs: now,
  };

  const elapsedSec = (now - bucket.lastRefillMs) / 1000;
  bucket.tokens = Math.min(
    config.capacity,
    bucket.tokens + elapsedSec * config.refillPerSecond,
  );
  bucket.lastRefillMs = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const deficit = 1 - bucket.tokens;
    return {
      ok: false,
      remaining: 0,
      resetSeconds: Math.ceil(deficit / config.refillPerSecond),
    };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return {
    ok: true,
    remaining: Math.floor(bucket.tokens),
    resetSeconds: Math.ceil(
      (config.capacity - bucket.tokens) / config.refillPerSecond,
    ),
  };
}

/**
 * Extract a stable identifier for the requester. Prefers Vercel's
 * `x-forwarded-for` (most-trusted leftmost token), falls back to
 * `x-real-ip`, then to a generic "unknown" bucket which is intentionally
 * shared so abuse from no-IP clients is rate-limited as a single bucket.
 */
export function rateLimitKey(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return `ip:${first}`;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return `ip:${xri.trim()}`;
  return "ip:unknown";
}

/**
 * Lightweight bot heuristic: blocks obviously-non-browser User-Agents.
 * Vercel BotID gives a real signal; this is a "first line" cheap filter
 * that avoids spending an LLM call on `curl/python-requests/wget`.
 */
const BOT_UA_PATTERN =
  /\b(curl|wget|python-requests|httpie|postman|axios|go-http-client|java\/|libwww|bot|spider|crawler|scrapy|headlesschrome)/i;

export function looksLikeBot(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua) return true;
  return BOT_UA_PATTERN.test(ua);
}
