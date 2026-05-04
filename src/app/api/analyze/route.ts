import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runPipeline } from "@/lib/pipeline";
import { isAllowedModel } from "@/lib/llm";
import { DEMO_RESULTS } from "@/lib/demo-cache";

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

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { query, tagModel, synthModel, demoId } = parsed.data;

  // Demo mode bypass — works without API keys.
  if (demoId) {
    const cached = DEMO_RESULTS.get(demoId);
    if (cached) {
      return NextResponse.json(cached);
    }
    return NextResponse.json({ error: "Unknown demo id" }, { status: 404 });
  }

  if (tagModel && !isAllowedModel(tagModel)) {
    return NextResponse.json(
      { error: `Model ${tagModel} is not in the allowlist.` },
      { status: 400 },
    );
  }
  if (synthModel && !isAllowedModel(synthModel)) {
    return NextResponse.json(
      { error: `Model ${synthModel} is not in the allowlist.` },
      { status: 400 },
    );
  }

  const hasGatewayKey = !!process.env.AI_GATEWAY_API_KEY;
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  if (!hasGatewayKey && !hasAnthropicKey && !hasOpenAIKey) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Set AI_GATEWAY_API_KEY (recommended) or a direct provider key in .env.local. " +
          "You can still try the demo examples on the home page.",
      },
      { status: 503 },
    );
  }

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const result = await runPipeline({ query, tagModel, synthModel });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Pipeline failed", message },
      { status: 500 },
    );
  }
}
