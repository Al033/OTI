# MCP directory submission tracker

Status of OTI's MCP server (`https://oti.app/api/mcp`) across the
2026 directory ecosystem. Submission is mostly mechanical — most
directories auto-index from GitHub or take a one-line CLI.

| Directory | URL | Status | Action |
|-----------|-----|--------|--------|
| **Glama** | https://glama.ai/mcp/servers | auto-indexes from GitHub | wait for crawl, request A-rating once indexed |
| **Smithery** | https://smithery.ai | manual | `npx -y @smithery/cli publish` from repo root |
| **mcp.so** | https://mcp.so | manual | submit at `/submit` with manifest URL |
| **PulseMCP** | https://www.pulsemcp.com | auto-indexes | wait for crawl |
| **modelcontextprotocol/servers** | https://github.com/modelcontextprotocol/servers | PR | open PR adding entry to README under "Community Servers" |
| **punkpeye/awesome-mcp-servers** | https://github.com/punkpeye/awesome-mcp-servers | PR | requires Glama A-rating, then PR |
| **Anthropic Desktop Extension Directory** | (form) | manual | submit via [interest form](https://anthropic.com/desktop-extensions) |
| **mcp-registry** (LibLab) | https://mcp.lib-lab.com | auto-indexes | wait for crawl |

## Submission script

A one-shot helper that prepares everything for the manual submissions:

```bash
pnpm mcp:submission-pack
```

Generates `out/mcp-submission/` with:
- `manifest.json` (the canonical OTI MCP manifest)
- `description.md` (long-form description for forms that ask)
- `tools.md` (rendered tool documentation)
- `screenshots/` (placeholder)
- `submission-checklist.md` (per-directory steps)

See `scripts/mcp-submission.ts` for the source.

## Discovery URLs

The OTI server is self-describing at:

- `GET /api/mcp` — JSON describing the server, tools, protocol version
- `GET /.well-known/mcp` — RFC-style well-known endpoint mirroring the above
- `GET /api/openapi.json` — OpenAPI 3.1 spec for the public read-only surface

These three URLs are what most directory crawlers look for. Adding
the well-known endpoint in particular helps discoverability.

## Categorisation

Submitting under these categories where the directory supports it:

- Primary: **Finance** / **Research** / **Data**
- Secondary: **Historical / Analogues** / **Macro**
- Anthropic-specific: **Capital markets** (Financial Services Suite category)

The Anthropic Financial Services Suite (May 5, 2026) shipped MCP
connectors for Moody's, D&B, Fiscal AI, Financial Modeling Prep,
Guidepoint, IBISWorld, Verisk, SS&C, Third Bridge. **OTI is the only
historical-analogue tool in that constellation** as of May 9, 2026
(see [research scan](../content/research/2026-05-09-memory-not-prediction.md)).
The submission text leans into this whitespace — "the analogue
retrieval tool the Financial Services suite is missing."

## Why this matters

MCP server distribution in 2026 is solved mechanically. There's no
secret. Every viral MCP server you see on Claude Desktop got there
by submitting to all 8 directories the same week. **The cost is one
afternoon; the upside is the only zero-CAC discovery channel for an
agentic-tool surface.**

This file gets updated as directories pick the server up — when
Glama crawls, the rating goes here; when Smithery publishes, the
URL goes here; when the Anthropic form clears, the .mcpb directory
listing URL goes here.
