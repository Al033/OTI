import type { DailyBrief } from "@/lib/regime/brief";
import type { HistoricalEvent } from "@/lib/types";

/**
 * Bluesky publisher. Uses @atproto/api with an app-password (revocable
 * via the user's Bluesky settings). The bot account is whatever
 * `BSKY_HANDLE` resolves to.
 *
 * X is too expensive in 2026 ($0.20/post with URLs after the Feb 2026
 * pricing change) and the free tier is gone. Bluesky is the right home
 * for OTI Daily — open API, no per-post cost, alt-text first-class.
 */

export interface PublishBlueskyArgs {
  date: string; // ISO
  brief: DailyBrief;
  topAnalogue: HistoricalEvent;
  topSimilarity: number;
  /** Public URL to /today/<date> for the link card. */
  permalinkUrl: string;
  /** Public URL to /api/og/today/<date>. */
  ogImageUrl: string;
}

export interface PublishResult {
  posted: boolean;
  postUri?: string;
  reason?: string;
}

export async function publishToBluesky(args: PublishBlueskyArgs): Promise<PublishResult> {
  const handle = process.env.BSKY_HANDLE;
  const password = process.env.BSKY_APP_PWD;

  if (!handle || !password) {
    return { posted: false, reason: "BSKY_HANDLE / BSKY_APP_PWD not configured" };
  }

  // Dynamic import so a missing dep doesn't break the rest of the route at
  // module-load time. The user runs `pnpm add @atproto/api` before going live.
  let api: typeof import("@atproto/api");
  try {
    api = await import("@atproto/api");
  } catch (err) {
    return {
      posted: false,
      reason: `@atproto/api not installed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const agent = new api.BskyAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: handle, password });

  const text = composePost(args);

  // Fetch the OG card and upload as a Bluesky blob.
  const imgRes = await fetch(args.ogImageUrl);
  if (!imgRes.ok) {
    return {
      posted: false,
      reason: `OG image fetch failed: ${imgRes.status}`,
    };
  }
  const imgBytes = new Uint8Array(await imgRes.arrayBuffer());
  const upload = await agent.uploadBlob(imgBytes, { encoding: "image/png" });

  const post = await agent.post({
    text,
    embed: {
      $type: "app.bsky.embed.images",
      images: [
        {
          alt: `OTI Daily for ${args.date}: today rhymes with ${args.topAnalogue.title} (similarity ${(args.topSimilarity * 100).toFixed(0)}%).`,
          image: upload.data.blob,
        },
      ],
    },
    createdAt: new Date().toISOString(),
  });

  return { posted: true, postUri: post.uri };
}

function composePost(args: PublishBlueskyArgs): string {
  // Bluesky posts cap at 300 graphemes — keep it tight.
  const sim = (args.topSimilarity * 100).toFixed(0);
  const headline = args.brief.headline;
  // Permalink is the cheap source of truth; we always include it.
  const tail = `\n\n${args.permalinkUrl}\n#OTIDaily #macro`;
  const budget = 300 - tail.length - 4;
  const trimmed = headline.length > budget ? headline.slice(0, budget - 1) + "…" : headline;
  return `${trimmed} (similarity ${sim}%)${tail}`;
}
