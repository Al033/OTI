import { z } from "zod";
import { tagQuery } from "@/lib/llm";
import { embedQuery } from "@/lib/embed";
import { retrieve, hydrate } from "@/lib/retrieval";
import { rerankCandidates } from "@/lib/rerank";
import { EVENTS, EVENT_BY_ID, CORPUS_VERSION } from "@/lib/events";
import { sanitiseUserQuery } from "@/lib/prompts";

/**
 * Tool surface exposed via the MCP server. Designed for agentic consumers
 * (Claude Desktop, Cursor, OpenBB Workspace, generic AI agents): each
 * tool returns structured JSON the calling LLM can reason over, NOT a
 * pre-rendered brief. The full /api/analyze pipeline is too slow to
 * sit in an agent's loop; MCP tools should respond in <1s.
 */

export const SearchAnaloguesInputSchema = z.object({
  query: z.string().min(8).max(2000).describe(
    "A market event in plain English. e.g. 'Trump announces 25% tariffs on EU autos'.",
  ),
  topK: z.number().int().min(1).max(20).default(5).describe(
    "Number of analogues to return.",
  ),
  rerank: z.boolean().default(true).describe(
    "Whether to apply the cross-encoder rerank pass.",
  ),
  region: z
    .enum(["US", "EU", "UK", "JP", "CN", "EM", "GLOBAL"])
    .optional()
    .describe(
      "Hard-filter analogues to this region. If omitted, the LLM tagger picks one from the query.",
    ),
});

export type SearchAnaloguesInput = z.infer<typeof SearchAnaloguesInputSchema>;

export async function searchAnalogues(input: SearchAnaloguesInput) {
  const query = sanitiseUserQuery(input.query);
  if (query.length < 8) throw new Error("query too short after sanitisation");

  const [queryTags, queryEmbedding] = await Promise.all([
    tagQuery({ query }),
    embedQuery(query),
  ]);
  const region = input.region ?? queryTags.region;

  const preRerank = await retrieve(
    { ...queryTags, region },
    {
      topK: Math.max(input.topK * 2, 10),
      queryEmbedding,
    },
  );
  const hydrated = hydrate(preRerank);

  const reranked = input.rerank
    ? await rerankCandidates({
        query,
        candidates: hydrated,
        topK: input.topK,
      })
    : { candidates: hydrated.slice(0, input.topK).map((c) => ({ ...c, rerankScore: null })), used: false };

  return {
    query,
    queryTags,
    rerankUsed: reranked.used,
    corpusVersion: CORPUS_VERSION,
    analogues: reranked.candidates.map((c) => ({
      eventId: c.eventId,
      title: c.event.title,
      date: c.event.date,
      region: c.event.region,
      triggerType: c.event.triggerType,
      regimeTags: c.event.regimeTags,
      surpriseFactor: c.event.surpriseFactor,
      catalyst: c.event.catalyst,
      narrativeAtTime: c.event.narrativeAtTime,
      assetMovesT0: {
        sp500_d1: c.event.assetMoves.sp500.d1,
        ust10y_d1bp: c.event.assetMoves.ust10y.d1,
        dxy_d1: c.event.assetMoves.dxy.d1,
        gold_d1: c.event.assetMoves.gold.d1,
        oil_d1: c.event.assetMoves.oil.d1,
      },
      scores: {
        jaccard: c.jaccard,
        cosine: c.cosine,
        combined: c.combined,
        rerank: c.rerankScore,
      },
    })),
  };
}

export const GetEventInputSchema = z.object({
  id: z.string().describe("The corpus event id, e.g. '2008-lehman'."),
  includeHindsight: z
    .boolean()
    .default(false)
    .describe(
      "When true, returns outcomeInHindsight, full asset-move horizons, failedTrades and consensusError. When false, returns the point-in-time view only — use this when you don't want look-ahead leakage.",
    ),
});
export type GetEventInput = z.infer<typeof GetEventInputSchema>;

export function getEvent(input: GetEventInput) {
  const e = EVENT_BY_ID.get(input.id);
  if (!e) {
    throw new Error(`Unknown event id: ${input.id}. Use list_events to see all ids.`);
  }
  if (!input.includeHindsight) {
    return {
      id: e.id,
      title: e.title,
      date: e.date,
      region: e.region,
      triggerType: e.triggerType,
      regimeTags: e.regimeTags,
      surpriseFactor: e.surpriseFactor,
      description: e.description,
      catalyst: e.catalyst,
      narrativeAtTime: e.narrativeAtTime,
      assetMovesT0: {
        sp500_d1: e.assetMoves.sp500.d1,
        ust10y_d1bp: e.assetMoves.ust10y.d1,
        dxy_d1: e.assetMoves.dxy.d1,
        gold_d1: e.assetMoves.gold.d1,
        oil_d1: e.assetMoves.oil.d1,
        creditHY_d1bp: e.assetMoves.creditHY.d1,
        vix_d1: e.assetMoves.vix.d1,
      },
      flowPatterns: e.flowPatterns,
      sources: e.sources,
      pointInTimeOnly: true,
    };
  }
  return { ...e, pointInTimeOnly: false };
}

export const ListEventsInputSchema = z.object({});
export type ListEventsInput = z.infer<typeof ListEventsInputSchema>;

export function listEvents() {
  return {
    corpusVersion: CORPUS_VERSION,
    count: EVENTS.length,
    events: EVENTS.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      region: e.region,
      triggerType: e.triggerType,
      regimeTags: e.regimeTags,
    })),
  };
}

/** Tool descriptors used by the MCP listTools handler. */
export const MCP_TOOLS = [
  {
    name: "search_analogues",
    description:
      "Find historical macro events analogous to a user-described market event. Returns top-K events with their point-in-time narrative, t=0 market reaction, and retrieval scores. Use this when the user asks 'what does this rhyme with', 'what historical analogues fit', or wants memory-style framing for a current market event. Schema-constrained to OTI's 39-event corpus (1929-2025).",
    inputSchema: zodToJsonSchema(SearchAnaloguesInputSchema),
  },
  {
    name: "get_event",
    description:
      "Return a single event from OTI's curated corpus by id. Use includeHindsight=true for the full payload (outcomeInHindsight, full asset-move horizons, failedTrades, consensusError). Use includeHindsight=false for the point-in-time view that's safe to use when reasoning about whether a current setup rhymes with the event.",
    inputSchema: zodToJsonSchema(GetEventInputSchema),
  },
  {
    name: "list_events",
    description:
      "List every event in OTI's corpus with id, title, date, region, triggerType, and regimeTags. Use this as a discovery surface before calling get_event or search_analogues.",
    inputSchema: zodToJsonSchema(ListEventsInputSchema),
  },
];

/** Lightweight zod-to-json-schema. Covers what our tool inputs use. */
function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, child] of Object.entries(shape)) {
      properties[key] = zodFieldToSchema(child);
      if (!(child instanceof z.ZodOptional) && !hasDefault(child)) {
        required.push(key);
      }
    }
    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
      additionalProperties: false,
    };
  }
  return zodFieldToSchema(schema);
}

function hasDefault(schema: z.ZodType): boolean {
  return schema instanceof z.ZodDefault;
}

function zodFieldToSchema(schema: z.ZodType): Record<string, unknown> {
  let inner = schema;
  let defaultVal: unknown;

  if (schema instanceof z.ZodOptional) {
    inner = schema.unwrap();
  }
  if (inner instanceof z.ZodDefault) {
    defaultVal = inner._def.defaultValue();
    inner = inner.removeDefault();
  }
  // The zod public surface for descriptions is `_def.description`.
  const description = (inner as { _def?: { description?: string } })._def?.description;

  let core: Record<string, unknown>;
  if (inner instanceof z.ZodString) core = { type: "string" };
  else if (inner instanceof z.ZodNumber) {
    core = { type: "number" };
    const minCheck = inner._def.checks.find((c) => c.kind === "min") as
      | { value: number }
      | undefined;
    const maxCheck = inner._def.checks.find((c) => c.kind === "max") as
      | { value: number }
      | undefined;
    if (minCheck) core.minimum = minCheck.value;
    if (maxCheck) core.maximum = maxCheck.value;
    if (inner._def.checks.some((c) => c.kind === "int")) core.type = "integer";
  } else if (inner instanceof z.ZodBoolean) core = { type: "boolean" };
  else if (inner instanceof z.ZodEnum) {
    core = { type: "string", enum: inner.options };
  } else if (inner instanceof z.ZodArray) {
    core = { type: "array", items: zodFieldToSchema(inner.element) };
  } else if (inner instanceof z.ZodObject) {
    core = zodToJsonSchema(inner);
  } else {
    core = {};
  }

  if (description) core.description = description;
  if (defaultVal !== undefined) core.default = defaultVal;
  return core;
}
