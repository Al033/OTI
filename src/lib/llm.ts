import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import {
  QueryTagsSchema,
  BriefOutputSchema,
  type QueryTags,
  type BriefOutput,
  type RetrievalCandidate,
  type HistoricalEvent,
} from "./types";
import {
  TAG_SYSTEM_PROMPT,
  buildTagUserPrompt,
  SYNTHESIS_SYSTEM_PROMPT,
  buildSynthesisUserPrompt,
} from "./prompts";
import { z } from "zod";

/**
 * AI Gateway routing. Uses provider/model strings ("anthropic/claude-sonnet-4-6").
 * The gateway handles auth, fallback and observability when AI_GATEWAY_API_KEY
 * is set. If the user prefers direct provider keys (ANTHROPIC_API_KEY etc.),
 * the AI SDK falls through automatically.
 */

export const DEFAULT_TAG_MODEL =
  process.env.OTI_TAG_MODEL ?? "anthropic/claude-haiku-4-5";

export const DEFAULT_SYNTH_MODEL =
  process.env.OTI_SYNTH_MODEL ?? "anthropic/claude-sonnet-4-6";

export const ALLOWED_PROVIDER_MODELS = [
  "anthropic/claude-sonnet-4-6",
  "anthropic/claude-haiku-4-5",
  "anthropic/claude-opus-4-7",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/o1",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "mistral/mistral-large-latest",
] as const;

export type AllowedModel = (typeof ALLOWED_PROVIDER_MODELS)[number];

export function isAllowedModel(model: string): model is AllowedModel {
  return ALLOWED_PROVIDER_MODELS.includes(model as AllowedModel);
}

export async function tagQuery(args: {
  query: string;
  model?: string;
}): Promise<QueryTags> {
  const model = args.model ?? DEFAULT_TAG_MODEL;
  const result = await generateObject({
    model: gateway(model),
    schema: QueryTagsSchema,
    system: TAG_SYSTEM_PROMPT,
    prompt: buildTagUserPrompt(args.query),
    temperature: 0.1,
  });
  return result.object;
}

/**
 * Build a corpus-constrained variant of the BriefOutputSchema. The eventId
 * inside each analogue is restricted at runtime to the actual top-N IDs,
 * so the LLM cannot hallucinate events outside the retrieved candidates.
 */
function buildConstrainedBriefSchema(allowedIds: readonly string[]) {
  if (allowedIds.length === 0) {
    throw new Error("Cannot constrain brief schema with empty allowedIds.");
  }
  // z.enum requires a non-empty tuple at the type level.
  const idEnum = z.enum(allowedIds as [string, ...string[]]);

  return z.object({
    headline: z.string().min(10).max(160),
    oneLineSummary: z.string().min(20).max(300),
    analogues: z
      .array(
        z.object({
          eventId: idEnum,
          whyAnalogous: z.string().min(30),
          whereThisMightNotFit: z.string().min(20),
          fitConfidence: z.number().min(0).max(1),
        }),
      )
      .length(3),
    disagreementNote: z.string().nullable(),
    failedTradesPattern: z.string().min(20),
    consensusError: z.string().min(20),
    caveats: z.array(z.string().min(10)).min(1).max(5),
  });
}

export async function synthesizeBrief(args: {
  userQuery: string;
  queryTags: QueryTags;
  candidates: Array<RetrievalCandidate & { event: HistoricalEvent }>;
  model?: string;
}): Promise<BriefOutput> {
  const model = args.model ?? DEFAULT_SYNTH_MODEL;
  const allowedIds = args.candidates.map((c) => c.eventId);
  const schema = buildConstrainedBriefSchema(allowedIds);

  const result = await generateObject({
    model: gateway(model),
    schema,
    system: SYNTHESIS_SYSTEM_PROMPT,
    prompt: buildSynthesisUserPrompt({
      userQuery: args.userQuery,
      queryTags: args.queryTags,
      candidates: args.candidates,
    }),
    temperature: 0.4,
  });

  // Validate against the unconstrained schema as well so downstream consumers
  // can rely on BriefOutput types.
  return BriefOutputSchema.parse(result.object);
}
