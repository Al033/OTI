/**
 * Generate the manual-submission pack for the MCP directories that
 * don't auto-index from GitHub. Outputs to /out/mcp-submission/.
 *
 *   pnpm mcp:submission-pack
 */

import "dotenv/config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MCP_TOOLS } from "../src/lib/mcp/tools";

const OUT_DIR = join(process.cwd(), "out", "mcp-submission");

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const manifestPath = join(process.cwd(), "mcp", "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  // 1. Manifest verbatim
  writeFileSync(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  // 2. description.md — long-form for forms that ask for one
  writeFileSync(
    join(OUT_DIR, "description.md"),
    `# ${manifest.display_name}\n\n${manifest.long_description}\n\n## Tools\n\n${MCP_TOOLS.map(
      (t) => `### \`${t.name}\`\n\n${t.description}`,
    ).join("\n\n")}\n\n## Discovery\n\n- \`GET ${manifest.server.url}\` — JSON server self-description\n- \`GET https://oti.app/.well-known/mcp\` — RFC well-known mirror\n- \`GET https://oti.app/api/openapi.json\` — OpenAPI spec for the public read-only surface\n\n## License\n\n${manifest.license}\n`,
  );

  // 3. submission-checklist.md
  writeFileSync(
    join(OUT_DIR, "submission-checklist.md"),
    `# OTI MCP submission checklist\n\nFollow in order; each step takes <10min.\n\n- [ ] **Glama** — wait for crawl (auto-indexes from GitHub) then request A-rating at https://glama.ai/mcp/servers\n- [ ] **Smithery** — \`npx -y @smithery/cli publish\` from this repo\n- [ ] **mcp.so** — submit at https://mcp.so/submit with manifest URL https://oti.app/.well-known/mcp\n- [ ] **PulseMCP** — wait for crawl (no manual submission)\n- [ ] **modelcontextprotocol/servers** — open PR adding entry to README under "Community Servers" with display_name + short description + url\n- [ ] **punkpeye/awesome-mcp-servers** — requires Glama A-rating first; then PR with link to OTI repo + Glama listing + screenshots\n- [ ] **Anthropic Desktop Extension** — submit interest form at https://anthropic.com/desktop-extensions; mention it integrates with the May 2026 Financial Services Suite\n- [ ] **mcp-registry (LibLab)** — wait for crawl\n\n## Cross-checks\n\n- [ ] manifest.json is canonical (compare against latest at /mcp/manifest.json in repo)\n- [ ] All screenshots referenced in manifest.screenshots are reachable\n- [ ] Repo README has an "Use as MCP server" section with the canonical claude_desktop_config.json snippet\n- [ ] mcp/DIRECTORIES.md status table is updated as listings appear\n`,
  );

  // 4. tools.md — rendered tool docs
  writeFileSync(
    join(OUT_DIR, "tools.md"),
    `# OTI MCP tools\n\n${MCP_TOOLS.map(
      (t) =>
        `## ${t.name}\n\n${t.description}\n\n\`\`\`json\n${JSON.stringify(t.inputSchema, null, 2)}\n\`\`\`\n`,
    ).join("\n")}`,
  );

  console.log(`[mcp-submission] wrote pack to ${OUT_DIR}`);
}

main();
