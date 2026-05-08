import { NextResponse } from "next/server";
import { EVENTS, CORPUS_VERSION } from "@/lib/events";

export const runtime = "nodejs";
export const revalidate = 3600; // 1h cache; corpus changes are deliberate.

/**
 * Public read-only event index. Returns a slim list — full payloads
 * available at /api/events/:id. Suitable for discovery, aggregation, or
 * mirroring the corpus in third-party tools.
 *
 * No auth, generous CORS — this is the "what used to cost $30k" surface.
 */

export async function GET() {
  const slim = EVENTS.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    region: e.region,
    triggerType: e.triggerType,
    regimeTags: e.regimeTags,
    surpriseFactor: e.surpriseFactor,
  }));

  return NextResponse.json(
    {
      corpusVersion: CORPUS_VERSION,
      count: slim.length,
      events: slim,
      docs: "https://github.com/Al033/OTI",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

export function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
