import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/sparkline";
import { EVENTS } from "@/lib/events";
import { formatDate, formatPct } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dataset",
  description:
    "The 30 curated macro events that power OTI. 1971–2025.",
};

export default function DatasetPage() {
  const sorted = [...EVENTS].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24">
        <header className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Dataset
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            30 macro events, 1971–2025
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
            Hand-curated, version-controlled, MIT-licensed. Each row stores
            structured tags, point-in-time narrative, asset-move data,
            failed-trade quotes with attribution, and a retrospective lesson.
            Source: <code className="mono text-xs">data/events.ts</code>.
          </p>
        </header>

        <Card className="mt-10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm">
              <thead className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/30">
                <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Region</th>
                  <th className="px-4 py-3 font-medium">Trigger</th>
                  <th className="px-4 py-3 font-medium text-right">Surprise</th>
                  <th className="px-4 py-3 font-medium">S&P · 1d → 6m</th>
                  <th className="px-4 py-3 font-medium text-right">@1m</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => {
                  const sp = e.assetMoves.sp500;
                  const series = [sp.d1, sp.d5, sp.m1, sp.m3, sp.m6];
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-surface-elevated)]/30"
                    >
                      <td className="px-4 py-3 mono text-[11px] text-[var(--color-muted-foreground)]">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {e.title}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {e.regimeTags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="font-mono text-[9px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 mono text-[11px] text-[var(--color-muted-foreground)]">
                        {e.region}
                      </td>
                      <td className="px-4 py-3 mono text-[11px] text-[var(--color-muted-foreground)]">
                        {e.triggerType}
                      </td>
                      <td className="px-4 py-3 text-right mono text-[11px]">
                        {e.surpriseFactor}/5
                      </td>
                      <td className="px-4 py-3">
                        <Sparkline values={series} width={100} height={22} showBaseline />
                      </td>
                      <td className="px-4 py-3 text-right mono text-xs">
                        <span
                          className={
                            sp.m1 === null
                              ? "text-[var(--color-muted-foreground)]"
                              : sp.m1 > 0
                                ? "text-[var(--color-positive)]"
                                : "text-[var(--color-negative)]"
                          }
                        >
                          {sp.m1 === null ? "—" : formatPct(sp.m1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="mt-6 text-xs text-[var(--color-muted-foreground)]">
          Asset-move data is approximate, sourced from public records, and
          intended to convey direction and magnitude. See{" "}
          <a href="/methodology" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
            methodology
          </a>{" "}
          for sources and known limitations.
        </p>
      </main>
      <Footer />
    </>
  );
}
