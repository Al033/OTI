import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCron } from "../guard";
import {
  getDailyBrief,
  getMatches,
  markPublished,
} from "@/lib/regime/store";
import { EVENT_BY_ID } from "@/lib/events";
import { publishToBluesky } from "@/lib/publish/bluesky";
import { publishEmailDigest } from "@/lib/publish/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron 2 — publish-digest. Triggered by Vercel Cron at 10:00 UTC
 * (6:00am ET) Tue–Sat. Reads yesterday's persisted brief and:
 *
 *   1. Posts the headline + OG card to Bluesky (free, AT Protocol).
 *   2. Sends the Resend daily-digest broadcast to subscribers.
 *
 * Decoupled from cron 1 so a Bluesky / Resend hiccup doesn't lose the
 * snapshot. If yesterday's brief is missing (cron 1 failed), this
 * route 404s rather than improvising.
 */

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return runIt(req);
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return runIt(req);
}

async function runIt(req: NextRequest) {
  const url = new URL(req.url);

  // The cron fires the morning AFTER the snapshot, so default to "yesterday".
  const overrideDate = url.searchParams.get("date");
  const date =
    overrideDate ??
    (() => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().slice(0, 10);
    })();

  const brief = await getDailyBrief(date);
  const matches = await getMatches(date);
  if (!brief || !matches || matches.positives.length === 0) {
    return NextResponse.json(
      { ok: false, error: "no_brief_for_date", date },
      { status: 404 },
    );
  }

  const top = matches.positives[0];
  const topEvent = EVENT_BY_ID.get(top.eventId);
  if (!topEvent) {
    return NextResponse.json(
      { ok: false, error: "top_event_not_in_corpus", id: top.eventId },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const permalinkUrl = `${appUrl.replace(/\/$/, "")}/today/${date}`;
  const ogImageUrl = `${appUrl.replace(/\/$/, "")}/api/og/today/${date}`;

  // Run publishers in parallel so a slow Resend broadcast doesn't block the
  // Bluesky post (or vice versa).
  const [bsky, email] = await Promise.allSettled([
    publishToBluesky({
      date,
      brief: brief.brief,
      topAnalogue: topEvent,
      topSimilarity: top.similarity,
      permalinkUrl,
      ogImageUrl,
    }),
    publishEmailDigest({
      date,
      brief: brief.brief,
      topAnalogue: topEvent,
      topSimilarity: top.similarity,
      permalinkUrl,
      ogImageUrl,
    }),
  ]);

  // Mark published if EITHER channel succeeded — partial success is still
  // a publish event. The detailed status comes back in the response body.
  const bskyOk = bsky.status === "fulfilled" && bsky.value.posted;
  const emailOk = email.status === "fulfilled" && email.value.sent;
  if (bskyOk || emailOk) {
    await markPublished(date);
  }

  return NextResponse.json({
    ok: bskyOk || emailOk,
    date,
    bluesky:
      bsky.status === "fulfilled"
        ? bsky.value
        : { posted: false, reason: String(bsky.reason) },
    email:
      email.status === "fulfilled"
        ? email.value
        : { sent: false, reason: String(email.reason) },
  });
}
