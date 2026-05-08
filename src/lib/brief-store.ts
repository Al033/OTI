import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { isDbConfigured, getDb, schema } from "./db/client";
import type { PipelineResult } from "./types";

/**
 * Short-lived store for generated briefs so they have stable shareable URLs.
 *
 * Backed by Postgres `briefs` when `POSTGRES_URL` is configured. Falls
 * back to a process-local LRU when not — adequate for dev. The /b/:id
 * route reads from here.
 *
 * The id is a deterministic hash of (query + tagModel + synthModel +
 * corpusVersion) — same input → same id, so re-running an analyse
 * dedupes naturally and the share URL is stable across re-renders.
 */

const TTL_DAYS = 30;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;
const MEM_CAPACITY = 256;

interface MemEntry {
  result: PipelineResult;
  expiresAt: number;
}
const mem = new Map<string, MemEntry>();

export function briefIdFor(
  query: string,
  tagModel: string,
  synthModel: string,
  corpusVersion: string,
): string {
  // Compact, URL-safe, 12 chars of base32 — collision-resistant enough at
  // expected traffic; cheap to hash.
  const h = createHash("sha256")
    .update(`${corpusVersion}|${tagModel}|${synthModel}|${query}`)
    .digest("base64url");
  return h.slice(0, 12).replace(/[-_]/g, "x");
}

export async function saveBrief(id: string, result: PipelineResult): Promise<void> {
  const expiresAt = Date.now() + TTL_MS;

  if (isDbConfigured()) {
    try {
      const db = getDb();
      await db
        .insert(schema.briefs)
        .values({
          id,
          query: result.query,
          modelTag: result.modelTag,
          modelSynth: result.modelSynth,
          payload: result,
          expiresAt: new Date(expiresAt),
        })
        .onConflictDoNothing({ target: schema.briefs.id });
      return;
    } catch (err) {
      console.warn("[brief-store] DB save failed, falling back to memory:", err);
    }
  }

  // Memory fallback.
  if (mem.size >= MEM_CAPACITY) {
    // Evict the oldest entry — Map iteration is insertion order.
    const oldestKey = mem.keys().next().value;
    if (oldestKey) mem.delete(oldestKey);
  }
  mem.set(id, { result, expiresAt });
}

export async function getBrief(id: string): Promise<PipelineResult | null> {
  if (isDbConfigured()) {
    try {
      const db = getDb();
      const row = await db.query.briefs.findFirst({
        where: eq(schema.briefs.id, id),
      });
      if (row && row.expiresAt.getTime() > Date.now()) {
        return row.payload as PipelineResult;
      }
    } catch (err) {
      console.warn("[brief-store] DB read failed, trying memory:", err);
    }
  }

  const entry = mem.get(id);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    mem.delete(id);
    return null;
  }
  return entry.result;
}
