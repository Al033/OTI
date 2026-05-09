import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const revalidate = 86400;

/**
 * RFC-style well-known endpoint mirroring /api/mcp. Most MCP directory
 * crawlers (Glama, PulseMCP, mcp.so) look here first for self-
 * describing metadata. Returns the OTI manifest verbatim.
 */
export async function GET() {
  try {
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "mcp", "manifest.json"), "utf8"),
    );
    return NextResponse.json(manifest, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "manifest_unavailable" },
      { status: 500 },
    );
  }
}
