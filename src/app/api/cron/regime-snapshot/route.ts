import { NextRequest, NextResponse } from "next/server";
import { orchestrateDailyBrief } from "@/lib/regime/orchestrate";
import { isAuthorizedCron } from "../guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Cron 1 — daily regime snapshot. Triggered by Vercel Cron at 21:05 UTC
 * (5:05pm ET, after US close). Pulls the macro state vector, runs
 * Mahalanobis k-NN, generates the brief, persists everything.
 *
 * Idempotent: if today's brief already exists, returns it without
 * regenerating (cron retries do not re-bill the LLM call).
 *
 * Security: gated by CRON_SECRET. Vercel Cron sends `Authorization:
 * Bearer ${CRON_SECRET}` automatically when the env var is configured.
 */

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return runIt(req);
}

// Vercel Cron Jobs send GET by default in some configurations; accept both.
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return runIt(req);
}

async function runIt(req: NextRequest) {
  const url = new URL(req.url);
  const dateOverride = url.searchParams.get("date");
  const force = url.searchParams.get("force") === "1";
  try {
    const result = await orchestrateDailyBrief({
      asOf: dateOverride ?? undefined,
      force,
    });
    return NextResponse.json({
      ok: true,
      date: result.date,
      source: result.source,
      headline: result.brief.headline,
      topAnalogueId: result.positives[0]?.eventId ?? null,
      topSimilarity: result.positives[0]?.similarity ?? null,
      hasNegative: !!result.negative,
    });
  } catch (err) {
    console.error("[cron/regime-snapshot] failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
