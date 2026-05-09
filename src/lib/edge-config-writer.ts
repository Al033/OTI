/**
 * Server-side Vercel Edge Config writer for the daily-cron path.
 * Edge Config doesn't have a Node SDK for writes — only the
 * `@vercel/sdk` REST API, or direct fetch to the Edge Config API.
 * We use direct fetch to avoid pulling in the full Vercel SDK for
 * one operation.
 *
 * Required env vars:
 *   VERCEL_API_TOKEN     — a token with edge-config:write scope
 *   EDGE_CONFIG_ID       — the Edge Config item id
 *   VERCEL_TEAM_ID       — optional, when the config is on a team
 */

import type { DailyBrief } from "./regime/brief";

const EDGE_CONFIG_API = "https://api.vercel.com/v1/edge-config";

export async function writeEdgeConfigForToday(args: {
  date: string;
  brief: DailyBrief;
  topAnalogueId: string;
  topAnalogueTitle: string;
  similarity: number;
  corpusVersion: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.VERCEL_API_TOKEN;
  const configId = process.env.EDGE_CONFIG_ID;
  if (!token || !configId) {
    return { ok: false, reason: "VERCEL_API_TOKEN / EDGE_CONFIG_ID not set" };
  }
  const teamQuery = process.env.VERCEL_TEAM_ID
    ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}`
    : "";

  const items = [
    {
      operation: "upsert" as const,
      key: "oti_today",
      value: {
        date: args.date,
        headline: args.brief.headline,
        topAnalogueId: args.topAnalogueId,
        topAnalogueTitle: args.topAnalogueTitle,
        similarity: args.similarity,
      },
    },
    {
      operation: "upsert" as const,
      key: "oti_corpus_version",
      value: args.corpusVersion,
    },
  ];

  try {
    const res = await fetch(
      `${EDGE_CONFIG_API}/${encodeURIComponent(configId)}/items${teamQuery}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, reason: `${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
