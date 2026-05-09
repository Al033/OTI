import { NextRequest, NextResponse } from "next/server";
import {
  MCP_TOOLS,
  searchAnalogues,
  getEvent,
  listEvents,
  SearchAnaloguesInputSchema,
  GetEventInputSchema,
  ListEventsInputSchema,
} from "@/lib/mcp/tools";
import { MCP_RESOURCES, readResourceContent } from "@/lib/mcp/resources";
import { MCP_PROMPTS, buildPromptMessages } from "@/lib/mcp/prompts";
import {
  consumeRateLimitToken,
  rateLimitKey,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * MCP server endpoint. Accepts JSON-RPC 2.0 over POST and implements the
 * subset of the Model Context Protocol that OTI cares about: initialize,
 * tools/list, tools/call, ping, and the `notifications/initialized`
 * post-handshake notification. Stateless — each request is independent.
 *
 * This is the v0.2 distribution wedge: any MCP-compatible client (Claude
 * Desktop, Cursor, OpenBB Workspace, plain agents using the MCP SDK) can
 * pull historical analogues into their context loop without re-running
 * the full /api/analyze pipeline.
 *
 * Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
 *
 *   {
 *     "mcpServers": {
 *       "oti": {
 *         "url": "https://your-oti-deployment.vercel.app/api/mcp",
 *         "type": "http"
 *       }
 *     }
 *   }
 */

const SERVER_INFO = {
  name: "oti-historical-analogues",
  version: "0.5.0",
  title: "OTI — Historical Macro Analogue Engine",
};

const PROTOCOL_VERSION = "2025-06-18";

const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  PROTOCOL_VERSION,
  "2025-03-26",
  "2024-11-05",
]);

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

function _rpcResult(id: string | number | null | undefined, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(
  id: string | number | null | undefined,
  code: number,
  message: string,
  data?: unknown,
) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message, ...(data !== undefined ? { data } : {}) },
  });
}

export async function GET() {
  // Health/discovery: lightweight payload describing the server.
  return NextResponse.json({
    server: SERVER_INFO,
    protocol: PROTOCOL_VERSION,
    transport: "json-rpc-over-http",
    tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
    resources: MCP_RESOURCES.map((r) => ({ uri: r.uri, name: r.name, mimeType: r.mimeType })),
    prompts: MCP_PROMPTS.map((p) => ({ name: p.name, description: p.description })),
    docs: "Send JSON-RPC 2.0 over POST. Implements: initialize, tools/list, tools/call, resources/list, resources/read, prompts/list, prompts/get, ping.",
  });
}

export async function POST(req: NextRequest) {
  // Per-IP rate limit (separate bucket from /api/analyze; agentic clients
  // hit MCP harder, so the bucket is more generous: 60 req / minute burst).
  const rl = consumeRateLimitToken(`mcp:${rateLimitKey(req)}`, {
    capacity: 60,
    refillPerSecond: 1, // 60/minute sustained
  });
  if (!rl.ok) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32000, message: "rate_limited" } },
      { status: 429, headers: { "Retry-After": String(rl.resetSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  // The protocol allows batch requests as arrays — we accept them but
  // dispatch sequentially.
  const items = Array.isArray(body) ? body : [body];
  const results = await Promise.all(items.map((it) => dispatch(it)));
  // Notifications (no id) yield null; filter them out.
  const responses = results.filter((r): r is NonNullable<typeof r> => r !== null);
  if (responses.length === 0) {
    // Per JSON-RPC spec: if all were notifications, return 202 with no body.
    return new NextResponse(null, { status: 202 });
  }
  return NextResponse.json(Array.isArray(body) ? responses : responses[0]);
}

async function dispatch(raw: unknown) {
  if (!raw || typeof raw !== "object" || (raw as JsonRpcRequest).jsonrpc !== "2.0") {
    return { jsonrpc: "2.0" as const, id: null, error: { code: -32600, message: "Invalid Request" } };
  }
  const { id, method, params } = raw as JsonRpcRequest;

  // Notifications (no `id`): we ack with null and don't return a body.
  const isNotification = id === undefined;

  try {
    switch (method) {
      case "initialize": {
        const requestedVersion =
          (params as { protocolVersion?: string } | undefined)?.protocolVersion;
        const negotiated =
          requestedVersion && SUPPORTED_PROTOCOL_VERSIONS.has(requestedVersion)
            ? requestedVersion
            : PROTOCOL_VERSION;
        return rpc(id, {
          protocolVersion: negotiated,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
            logging: {},
          },
          serverInfo: SERVER_INFO,
          instructions:
            "OTI exposes a curated 39-event historical-macro-analogue corpus. " +
            "Use search_analogues for free-text queries, get_event for a specific event by id " +
            "(point-in-time view by default to avoid look-ahead leakage), and list_events for discovery. " +
            "Resources surface the full corpus + JSON Schema for read-only context. " +
            "Server-defined Prompts (compare-regimes, rank-by-fit, negative-analogue) are one-click " +
            "templates Claude.ai users can invoke directly. " +
            "The corpus is MIT-licensed and versioned — `corpusVersion` in tool responses changes when " +
            "events are added/edited.",
        });
      }
      case "ping": {
        return rpc(id, {});
      }
      case "tools/list": {
        return rpc(id, { tools: MCP_TOOLS });
      }
      case "tools/call": {
        const p = params as { name?: string; arguments?: unknown } | undefined;
        if (!p?.name) {
          return rpc(id, undefined, { code: -32602, message: "tool name required" });
        }
        return await callTool(id, p.name, p.arguments ?? {});
      }
      case "resources/list": {
        return rpc(id, { resources: MCP_RESOURCES });
      }
      case "resources/read": {
        const p = params as { uri?: string } | undefined;
        if (!p?.uri) {
          return rpc(id, undefined, { code: -32602, message: "uri required" });
        }
        return await readResource(id, p.uri);
      }
      case "prompts/list": {
        return rpc(id, { prompts: MCP_PROMPTS });
      }
      case "prompts/get": {
        const p = params as { name?: string; arguments?: Record<string, unknown> } | undefined;
        if (!p?.name) {
          return rpc(id, undefined, { code: -32602, message: "prompt name required" });
        }
        return await getPrompt(id, p.name, p.arguments ?? {});
      }
      case "notifications/initialized":
      case "notifications/cancelled":
      case "notifications/progress": {
        // Acknowledge silently.
        if (isNotification) return null;
        return rpc(id, {});
      }
      default: {
        return rpc(id, undefined, { code: -32601, message: `method not found: ${method}` });
      }
    }
  } catch (err) {
    console.error("[mcp] dispatch error:", err);
    return rpc(id, undefined, {
      code: -32603,
      message: "internal error",
      data: err instanceof Error ? err.message : String(err),
    });
  }
}

function rpc(
  id: string | number | null | undefined,
  result: unknown,
  err?: { code: number; message: string; data?: unknown },
) {
  if (id === undefined) return null;
  if (err) {
    return { jsonrpc: "2.0" as const, id: id ?? null, error: err };
  }
  return { jsonrpc: "2.0" as const, id: id ?? null, result };
}

async function callTool(
  id: string | number | null | undefined,
  name: string,
  args: unknown,
) {
  switch (name) {
    case "search_analogues": {
      const parsed = SearchAnaloguesInputSchema.safeParse(args);
      if (!parsed.success) {
        return rpc(id, undefined, {
          code: -32602,
          message: "invalid arguments",
          data: parsed.error.flatten(),
        });
      }
      const result = await searchAnalogues(parsed.data);
      return toolResult(id, result);
    }
    case "get_event": {
      const parsed = GetEventInputSchema.safeParse(args);
      if (!parsed.success) {
        return rpc(id, undefined, {
          code: -32602,
          message: "invalid arguments",
          data: parsed.error.flatten(),
        });
      }
      const result = getEvent(parsed.data);
      return toolResult(id, result);
    }
    case "list_events": {
      ListEventsInputSchema.parse(args);
      return toolResult(id, listEvents());
    }
    default:
      return rpc(id, undefined, { code: -32602, message: `unknown tool: ${name}` });
  }
}

function toolResult(
  id: string | number | null | undefined,
  payload: unknown,
) {
  // MCP tool results are wrapped: content[] of typed parts. We return both
  // a structured JSON part (preferred for agent consumption) and a text
  // fallback for older clients that only render `text` parts.
  return rpc(id, {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
    isError: false,
  });
}

async function readResource(
  id: string | number | null | undefined,
  uri: string,
) {
  const content = readResourceContent(uri);
  if (!content) {
    return rpc(id, undefined, {
      code: -32602,
      message: `unknown resource uri: ${uri}`,
    });
  }
  return rpc(id, {
    contents: [content],
  });
}

async function getPrompt(
  id: string | number | null | undefined,
  name: string,
  args: Record<string, unknown>,
) {
  const built = buildPromptMessages(name, args);
  if (!built) {
    return rpc(id, undefined, {
      code: -32602,
      message: `unknown or unavailable prompt: ${name}`,
    });
  }
  return rpc(id, built);
}
