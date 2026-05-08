/**
 * Persistence helpers for the daily-regime feature. All three tables
 * (regime_snapshots, daily_matches, daily_briefs) are keyed by date so
 * the cron flow is: snapshot → match → brief → publish, and the
 * publish step (cron 2) is a pure read.
 *
 * In dev without POSTGRES_URL, all reads return null and writes are
 * silent no-ops. The /today page degrades to a "configure POSTGRES_URL
 * and run the cron once" message rather than 500ing.
 */

import { eq } from "drizzle-orm";
import { isDbConfigured, getDb, schema } from "@/lib/db/client";
import type {
  RegimeSnapshotRow,
  DailyMatchesRow,
  DailyBriefRow,
} from "@/lib/db/schema";
import type { DailyBrief } from "./brief";

export interface PersistedSnapshot {
  date: string;
  rawVector: Array<number | null>;
  zVector: Array<number | null>;
  meta: Record<string, unknown>;
  createdAt: Date;
}

export interface PersistedMatches {
  date: string;
  positives: Array<{ eventId: string; distance: number; similarity: number }>;
  negative: {
    eventId: string;
    distance: number;
    similarity: number;
    disambiguator: string;
  } | null;
  createdAt: Date;
}

export interface PersistedBrief {
  date: string;
  brief: DailyBrief;
  modelSynth: string;
  corpusVersion: string;
  publishedAt: Date | null;
  createdAt: Date;
}

export async function saveSnapshot(args: PersistedSnapshot): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db
    .insert(schema.regimeSnapshots)
    .values({
      date: args.date,
      rawVector: args.rawVector,
      zVector: args.zVector,
      meta: args.meta,
    })
    .onConflictDoUpdate({
      target: schema.regimeSnapshots.date,
      set: {
        rawVector: args.rawVector,
        zVector: args.zVector,
        meta: args.meta,
      },
    });
}

export async function getSnapshot(date: string): Promise<PersistedSnapshot | null> {
  if (!isDbConfigured()) return null;
  try {
    const db = getDb();
    const row: RegimeSnapshotRow | undefined = await db.query.regimeSnapshots.findFirst({
      where: eq(schema.regimeSnapshots.date, date),
    });
    if (!row) return null;
    return {
      date: row.date,
      rawVector: row.rawVector,
      zVector: row.zVector,
      meta: row.meta,
      createdAt: row.createdAt,
    };
  } catch (err) {
    console.warn("[regime-store] getSnapshot failed:", err);
    return null;
  }
}

export async function saveMatches(args: PersistedMatches): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db
    .insert(schema.dailyMatches)
    .values({
      date: args.date,
      positives: args.positives,
      negative: args.negative,
    })
    .onConflictDoUpdate({
      target: schema.dailyMatches.date,
      set: {
        positives: args.positives,
        negative: args.negative,
      },
    });
}

export async function getMatches(date: string): Promise<PersistedMatches | null> {
  if (!isDbConfigured()) return null;
  try {
    const db = getDb();
    const row: DailyMatchesRow | undefined = await db.query.dailyMatches.findFirst({
      where: eq(schema.dailyMatches.date, date),
    });
    if (!row) return null;
    return {
      date: row.date,
      positives: row.positives,
      negative: row.negative,
      createdAt: row.createdAt,
    };
  } catch (err) {
    console.warn("[regime-store] getMatches failed:", err);
    return null;
  }
}

export async function saveBrief(args: {
  date: string;
  brief: DailyBrief;
  modelSynth: string;
  corpusVersion: string;
}): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db
    .insert(schema.dailyBriefs)
    .values({
      date: args.date,
      payload: args.brief,
      modelSynth: args.modelSynth,
      corpusVersion: args.corpusVersion,
    })
    .onConflictDoUpdate({
      target: schema.dailyBriefs.date,
      set: {
        payload: args.brief,
        modelSynth: args.modelSynth,
        corpusVersion: args.corpusVersion,
      },
    });
}

export async function markPublished(date: string): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db
    .update(schema.dailyBriefs)
    .set({ publishedAt: new Date() })
    .where(eq(schema.dailyBriefs.date, date));
}

export async function getDailyBrief(date: string): Promise<PersistedBrief | null> {
  if (!isDbConfigured()) return null;
  try {
    const db = getDb();
    const row: DailyBriefRow | undefined = await db.query.dailyBriefs.findFirst({
      where: eq(schema.dailyBriefs.date, date),
    });
    if (!row) return null;
    return {
      date: row.date,
      brief: row.payload as DailyBrief,
      modelSynth: row.modelSynth,
      corpusVersion: row.corpusVersion,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
    };
  } catch (err) {
    console.warn("[regime-store] getDailyBrief failed:", err);
    return null;
  }
}

/**
 * Most-recent N daily briefs, descending date. Used by the /today page
 * to fall back to yesterday if today's hasn't been generated yet, and
 * by the archive sidebar.
 */
export async function getRecentBriefs(limit = 30): Promise<PersistedBrief[]> {
  if (!isDbConfigured()) return [];
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.dailyBriefs)
      .orderBy(schema.dailyBriefs.date)
      .limit(limit);
    return rows
      .reverse()
      .map((row) => ({
        date: row.date,
        brief: row.payload as DailyBrief,
        modelSynth: row.modelSynth,
        corpusVersion: row.corpusVersion,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
      }));
  } catch (err) {
    console.warn("[regime-store] getRecentBriefs failed:", err);
    return [];
  }
}
