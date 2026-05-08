import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--color-border-subtle)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium">OTI</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted-foreground)] max-w-xs">
              A historical-analogue research engine for macro markets. Memory,
              not prediction. Open source.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/methodology" className="hover:text-[var(--color-foreground)] text-[var(--color-muted-foreground)] transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/examples" className="hover:text-[var(--color-foreground)] text-[var(--color-muted-foreground)] transition-colors">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/dataset" className="hover:text-[var(--color-foreground)] text-[var(--color-muted-foreground)] transition-colors">
                  Dataset
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-[var(--color-foreground)] text-[var(--color-muted-foreground)] transition-colors">
                  API & MCP
                </Link>
              </li>
              <li>
                <a href="https://github.com/Al033/OTI" target="_blank" rel="noreferrer" className="hover:text-[var(--color-foreground)] text-[var(--color-muted-foreground)] transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Disclaimer
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-muted-foreground)]">
              OTI is for educational and research purposes only. It is not
              investment advice. Asset-move data is approximate and sourced from
              public records. Outputs may be wrong; treat them as a thinking
              tool, not a forecast.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[var(--color-border-subtle)] pt-6 text-[11px] text-[var(--color-muted-foreground)] md:flex-row md:items-center">
          <p>
            Markets don't predict — they remember.
          </p>
          <p>
            Built with Next.js, AI SDK, and a curated corpus of 30 macro events.
          </p>
        </div>
      </div>
    </footer>
  );
}
