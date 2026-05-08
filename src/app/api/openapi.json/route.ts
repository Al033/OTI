import { NextResponse } from "next/server";
import { REGIME_TAGS, REGIONS, TRIGGER_TYPES } from "@/lib/regime-tags";

export const runtime = "nodejs";
export const revalidate = 3600;

/**
 * Hand-curated OpenAPI 3.1 export for OTI's public read-only surface.
 *
 *   /api/events
 *   /api/events/:id
 *   /api/analyze (gated by rate limit; LLM-cost-incurring)
 *   /api/mcp (JSON-RPC; described separately)
 *
 * Why hand-rolled vs zod-to-openapi: the public surface is small, the
 * Zod schemas have project-specific affordances (z.refine, dynamic
 * enums) the auto-converters mishandle, and we want the descriptions
 * to read like documentation. Easier to maintain by hand at this size.
 */

export async function GET() {
  const spec = buildSpec();
  return NextResponse.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function buildSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "OTI — Historical Macro Analogue Engine",
      version: "0.2.0",
      description:
        "Read-only access to OTI's curated 30-event historical-macro-analogue corpus, plus the LLM analyse pipeline. Memory, not prediction.",
      license: { name: "MIT", url: "https://github.com/Al033/OTI/blob/main/LICENSE" },
      contact: { name: "OTI", url: "https://github.com/Al033/OTI" },
    },
    servers: [
      {
        url: "{baseUrl}",
        variables: { baseUrl: { default: "https://oti.example.app" } },
      },
    ],
    paths: {
      "/api/events": {
        get: {
          summary: "List all events in the corpus",
          tags: ["events"],
          responses: {
            "200": {
              description: "Slim event index.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["corpusVersion", "count", "events"],
                    properties: {
                      corpusVersion: { type: "string" },
                      count: { type: "integer" },
                      events: {
                        type: "array",
                        items: { $ref: "#/components/schemas/EventSummary" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/events/{id}": {
        get: {
          summary: "Fetch a single event by id",
          tags: ["events"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "2008-lehman",
            },
            {
              name: "view",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["full", "pit"], default: "full" },
              description:
                "Use 'pit' (point-in-time) to omit hindsight fields and longer-horizon asset moves.",
            },
          ],
          responses: {
            "200": {
              description: "Event payload (full or PIT, depending on `view`).",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
            "404": { description: "Unknown event id." },
          },
        },
      },
      "/api/analyze": {
        post: {
          summary: "Run the full analyse pipeline (synchronous JSON)",
          description:
            "Per-IP rate-limited (token bucket: burst 10, sustained 10/min). Bot-heuristic-gated. Use /api/analyze/stream for the progressive streaming variant used by the UI.",
          tags: ["analyze"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnalyzeRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "PipelineResult with brief + retrieval audit.",
              content: { "application/json": { schema: { type: "object" } } },
            },
            "429": { description: "Rate-limited or bot detected." },
            "503": { description: "No AI provider configured server-side." },
          },
        },
      },
      "/api/mcp": {
        post: {
          summary: "Model Context Protocol JSON-RPC endpoint",
          description:
            "Stateless MCP server. Methods: initialize, ping, tools/list, tools/call. Tools: search_analogues, get_event, list_events. See /api/mcp (GET) for self-describing schema.",
          tags: ["mcp"],
        },
        get: {
          summary: "MCP server self-description",
          tags: ["mcp"],
        },
      },
    },
    components: {
      schemas: {
        EventSummary: {
          type: "object",
          required: ["id", "title", "date", "region", "triggerType", "regimeTags", "surpriseFactor"],
          properties: {
            id: { type: "string", example: "2008-lehman" },
            title: { type: "string", example: "Lehman bankruptcy" },
            date: { type: "string", format: "date" },
            region: { type: "string", enum: [...REGIONS] },
            triggerType: { type: "string", enum: [...TRIGGER_TYPES] },
            regimeTags: { type: "array", items: { type: "string", enum: [...REGIME_TAGS] } },
            surpriseFactor: { type: "integer", minimum: 1, maximum: 5 },
          },
        },
        AnalyzeRequest: {
          oneOf: [
            {
              type: "object",
              required: ["query"],
              properties: {
                query: {
                  type: "string",
                  minLength: 8,
                  maxLength: 2000,
                  example: "Trump announces 25% tariffs on EU autos",
                },
                tagModel: { type: "string" },
                synthModel: { type: "string" },
              },
            },
            {
              type: "object",
              required: ["demoId"],
              properties: { demoId: { type: "string" } },
            },
          ],
        },
      },
    },
    tags: [
      { name: "events", description: "Read the curated corpus." },
      { name: "analyze", description: "Run the full LLM pipeline." },
      { name: "mcp", description: "Model Context Protocol surface." },
    ],
  } as const;
}
