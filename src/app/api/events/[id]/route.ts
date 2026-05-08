import { NextRequest, NextResponse } from "next/server";
import { EVENT_BY_ID, CORPUS_VERSION } from "@/lib/events";

export const runtime = "nodejs";
export const revalidate = 3600;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Public read-only single-event fetch.
 *
 *   GET /api/events/2008-lehman                  → full payload (default)
 *   GET /api/events/2008-lehman?view=pit         → point-in-time view
 *                                                  (no outcomeInHindsight,
 *                                                   no >1d asset moves,
 *                                                   no failedTrades,
 *                                                   no consensusError)
 *
 * The PIT view is for downstream tools that want to use OTI's curation
 * without leaking hindsight into their own analyses. This is the same
 * split the synthesis Phase A uses internally.
 */

export async function GET(req: NextRequest, ctx: RouteParams) {
  const { id } = await ctx.params;
  const event = EVENT_BY_ID.get(id);
  if (!event) {
    return NextResponse.json(
      { error: "not_found", id },
      { status: 404, headers: corsHeaders() },
    );
  }

  const view = req.nextUrl.searchParams.get("view") ?? "full";

  const payload =
    view === "pit"
      ? {
          id: event.id,
          title: event.title,
          date: event.date,
          region: event.region,
          triggerType: event.triggerType,
          regimeTags: event.regimeTags,
          surpriseFactor: event.surpriseFactor,
          description: event.description,
          catalyst: event.catalyst,
          narrativeAtTime: event.narrativeAtTime,
          assetMovesT0: {
            sp500_d1: event.assetMoves.sp500.d1,
            ust10y_d1bp: event.assetMoves.ust10y.d1,
            dxy_d1: event.assetMoves.dxy.d1,
            gold_d1: event.assetMoves.gold.d1,
            oil_d1: event.assetMoves.oil.d1,
            creditHY_d1bp: event.assetMoves.creditHY.d1,
            vix_d1: event.assetMoves.vix.d1,
          },
          flowPatterns: event.flowPatterns,
          sources: event.sources,
        }
      : event;

  return NextResponse.json(
    { corpusVersion: CORPUS_VERSION, view, event: payload },
    { headers: corsHeaders() },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  };
}
