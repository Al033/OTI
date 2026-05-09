/**
 * Inline OTI Daily preview card — rendered above the fold on the home
 * page so the first-time visitor sees what the engine actually produces
 * before typing anything. The "fewer-clicks" affordance: zero clicks
 * required to see a real (or PREVIEW-labelled) brief.
 *
 * Resolves data in this order:
 *   1. Live persisted brief (DB) — when the cron has produced one.
 *   2. Synthetic preview — when nothing's persisted yet.
 *
 * Both paths render the same component shape, so this card looks the
 * same in dev, in synthetic-preview state, and in live cron state. The
 * PREVIEW pill is the only visual difference when the source is
 * synthetic — and we don't pass it to the cron path.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { HistoricalEvent } from "@/lib/types";
import type { DailyBrief } from "@/lib/regime/brief";

export interface TodayPreviewCardProps {
  date: string;
  brief: DailyBrief;
  similarities: number[]; // for the 3 positives, in order
  positiveEvents: ReadonlyArray<HistoricalEvent | undefined>; // length 3
  isPreview?: boolean;
}

export function TodayPreviewCard({
  date,
  brief,
  similarities,
  positiveEvents,
  isPreview = false,
}: TodayPreviewCardProps) {
  return (
    <section
      className="space-y-5"
      aria-label="Today's regime — preview brief"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="relative inline-flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
        </span>
        <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
          OTI Daily · {formatDate(date)}
        </span>
        {isPreview && (
          <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider">
            Preview
          </Badge>
        )}
      </div>

      <Link
        href="/today"
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] rounded-lg"
      >
        <Card className="overflow-hidden transition-colors hover:border-[var(--color-border)] group-hover:bg-[var(--color-surface-elevated)]/50">
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {brief.headline}
            </h2>
            <p className="text-pretty max-w-3xl text-sm leading-relaxed text-[var(--color-muted-foreground)] md:text-base">
              {brief.regimeSummary}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {brief.positives.map((p, i) => {
                const event = positiveEvents[i];
                if (!event) return null;
                const series = [
                  event.assetMoves.sp500.d1,
                  event.assetMoves.sp500.d5,
                  event.assetMoves.sp500.m1,
                  event.assetMoves.sp500.m3,
                  event.assetMoves.sp500.m6,
                ];
                return (
                  <div
                    key={p.eventId}
                    className="space-y-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                        Analogue {i + 1}
                      </span>
                      <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                        {(similarities[i] * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug">
                      {event.title}
                    </p>
                    <p className="mono text-[10px] text-[var(--color-muted-foreground)]">
                      {formatDate(event.date)}
                    </p>
                    <Sparkline
                      values={series}
                      width={220}
                      height={26}
                      showBaseline
                      labels={["1d", "5d", "1m", "3m", "6m"]}
                      unit="pct"
                      ariaLabel={`S&P 500 returns following ${event.title}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center text-sm text-[var(--color-accent)] group-hover:underline underline-offset-4">
              <span>Read the full brief — fingerprint, negative analogue, caveats</span>
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </section>
  );
}
