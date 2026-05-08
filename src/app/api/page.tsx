import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "API & MCP",
  description: "Public read-only API and MCP server for OTI's curated macro corpus.",
};

export default function ApiPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-24">
        <article className="space-y-12">
          <header className="space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              API & MCP
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Pull OTI's corpus into your tools
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
              Free, public, MIT-licensed. Read-only HTTP for the curated 30-event corpus, and an MCP server so any agentic client (Claude Desktop, Cursor, OpenBB Workspace) can search analogues and pull events directly.
            </p>
          </header>

          <Section label="01" title="Read the corpus">
            <p>
              <Code>GET /api/events</Code> — slim list of all events with id, title, date, region, triggerType, regimeTags, surpriseFactor.
            </p>
            <p>
              <Code>GET /api/events/{`{id}`}</Code> — full payload. Add{" "}
              <Code>?view=pit</Code> for the point-in-time view (no <em>outcomeInHindsight</em>, no longer-horizon asset moves, no failedTrades, no consensusError).
            </p>
            <p>
              <Code>GET /api/openapi.json</Code> — OpenAPI 3.1 spec. Both endpoints are CORS-open and cached for 1h.
            </p>
            <Pre>{`curl https://your-oti.app/api/events
curl https://your-oti.app/api/events/2008-lehman?view=pit`}</Pre>
          </Section>

          <Section label="02" title="Run the analyse pipeline">
            <p>
              <Code>POST /api/analyze</Code> — synchronous JSON. Returns the full <Code>PipelineResult</Code> with brief, retrieval audit, and the corpus version. Per-IP rate-limited (token bucket: burst 10, sustained 10/min). Bot-heuristic-gated.
            </p>
            <p>
              <Code>POST /api/analyze/stream</Code> — newline-delimited JSON streaming. Emits <Code>started</Code>, <Code>queryTags</Code>, <Code>candidates</Code>, <Code>phaseA</Code>+<Code>phaseAFinal</Code>, <Code>phaseB</Code>+<Code>phaseBFinal</Code>, <Code>complete</Code>, <Code>error</Code>. Used by the in-app UI.
            </p>
            <Pre>{`curl -X POST https://your-oti.app/api/analyze \\
  -H 'content-type: application/json' \\
  -d '{"query":"Trump announces 25% tariffs on EU autos"}'`}</Pre>
          </Section>

          <Section label="03" title="MCP server (the distribution wedge)">
            <p>
              <Code>POST /api/mcp</Code> — stateless JSON-RPC 2.0. Implements <Code>initialize</Code>, <Code>ping</Code>, <Code>tools/list</Code>, <Code>tools/call</Code>. Three tools:
            </p>
            <ul>
              <li>
                <Code>search_analogues</Code> — top-K events for a free-text query. Goes through tag → embed → retrieve → rerank, but skips synthesis to stay sub-second.
              </li>
              <li>
                <Code>get_event</Code> — fetch by id. <Code>includeHindsight</Code> flag toggles point-in-time vs full payload.
              </li>
              <li>
                <Code>list_events</Code> — corpus discovery surface.
              </li>
            </ul>
            <p>
              Add to <Code>claude_desktop_config.json</Code>:
            </p>
            <Pre>{`{
  "mcpServers": {
    "oti": {
      "url": "https://your-oti.app/api/mcp",
      "type": "http"
    }
  }
}`}</Pre>
            <p>
              Or use as a remote MCP server in Cursor / OpenBB Workspace / any agent built on the official MCP SDK.
            </p>
          </Section>

          <Section label="04" title="Versioning">
            <p>
              Every response includes <Code>corpusVersion</Code> — an FNV-1a hash of the corpus identity. It changes when events are added, removed, or have their <Code>id</Code> renamed. Clients that mirror the corpus should re-fetch when this changes.
            </p>
            <p>
              The schema for events is published in TypeScript at{" "}
              <a
                href="https://github.com/Al033/OTI/blob/main/src/lib/types.ts"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                src/lib/types.ts
              </a>{" "}
              and as JSON Schema via the OpenAPI export.
            </p>
          </Section>

          <Section label="05" title="Licence">
            <p>
              MIT. No auth, no API key, no terms. If you build something on top of OTI, drop a link to the repo somewhere visible and we'll cross-link back from the{" "}
              <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
                home page
              </Link>
              .
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-[var(--color-border-subtle)] pt-10">
      <div className="flex items-baseline gap-3">
        <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {label}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4 text-base leading-relaxed text-[var(--color-foreground)]/85 [&>p]:text-pretty [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&_strong]:text-[var(--color-foreground)] [&_em]:italic">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="mono text-[12px] px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mono overflow-x-auto rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 text-[12px] leading-relaxed text-[var(--color-foreground)]/90">
      {children}
    </pre>
  );
}
