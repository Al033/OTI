import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runPipeline } from "@/lib/pipeline";
import { isAllowedModel } from "@/lib/llm";
import { DEMO_RESULTS } from "@/lib/demo-cache";
import { saveBrief, briefIdFor } from "@/lib/brief-store";
import {
  consumeRateLimitToken,
  rateLimitKey,
  looksLikeBot,
} from "@/lib/rate-limit";
import { sanitiseUserQuery } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RequestSchema = z
  .object({
    query: z.string().min(8).max(2000).optional(),
    tagModel: z.string().optional(),
    synthModel: z.string().optional(),
    demoId: z.string().optional(),
  })
  .refine((v) => !!v.query || !!v.demoId, {
    message: "Either query or demoId must be provided.",
  });

function publicError(status: number, code: string, hint?: string) {
  return NextResponse.json({ error: code, hint }, { status });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return publicError(400, "invalid_json");
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return publicError(400, "invalid_request");
  }

  const { tagModel, synthModel, demoId } = parsed.data;
  const rawQuery = parsed.data.query;

  // Demo path: precomputed, no LLM cost, no rate limit.
  if (demoId) {
    const cached = DEMO_RESULTS.get(demoId);
    if (cached) return NextResponse.json(cached);
    return publicError(404, "unknown_demo_id");
  }

  // Bot heuristic — cheap filter before any cost.
  if (looksLikeBot(req)) {
    return publicError(
      429,
      "bot_detected",
      "Automated clients should use the public read-only API at /api/events.",
    );
  }

  // Per-IP token bucket.
  const rl = consumeRateLimitToken(rateLimitKey(req));
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(rl.resetSeconds),
  };
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", hint: `Try again in ${rl.resetSeconds}s.` },
      { status: 429, headers },
    );
  }

  // Model allowlist: prevents using arbitrary provider/model strings to
  // route through the gateway.
  if (tagModel && !isAllowedModel(tagModel)) {
    return publicError(400, "tag_model_not_allowed");
  }
  if (synthModel && !isAllowedModel(synthModel)) {
    return publicError(400, "synth_model_not_allowed");
  }

  const hasGatewayKey = !!process.env.AI_GATEWAY_API_KEY;
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  if (!hasGatewayKey && !hasAnthropicKey && !hasOpenAIKey) {
    return publicError(503, "no_provider_configured", "Try the /examples demo briefs.");
  }

  if (!rawQuery) return publicError(400, "missing_query");
  const query = sanitiseUserQuery(rawQuery);
  if (query.length < 8) return publicError(400, "query_too_short_after_sanitisation");

  try {
    const result = await runPipeline({ query, tagModel, synthModel });

    // Best-effort persistence so the brief is sharable. Failure here doesn't
    // break the response — the brief still renders in the client even if KV
    // / Postgres is down.
    saveBrief(briefIdFor(query, result.modelTag, result.modelSynth, result.corpusVersion), result).catch((err) => {
      console.warn("[analyze] saveBrief failed:", err);
    });

    return NextResponse.json(result, { headers });
  } catch (err) {
    // Log full error server-side; return a stable code to the client.
    console.error("[analyze] pipeline failed:", err);
    return publicError(500, "pipeline_failed");
  }
}
