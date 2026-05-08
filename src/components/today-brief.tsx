"use client";

import * as React from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/sparkline";
import { cn, formatDate } from "@/lib/utils";
import { REGIME_COMPONENTS } from "@/lib/regime/vector";
import type { DailyBrief } from "@/lib/regime/brief";
import type { HistoricalEvent } from "@/lib/types";

interface TodayBriefProps {
  date: string; // ISO
  brief: DailyBrief;
  zVector: Array<number | null>;
  events: ReadonlyMap<string, HistoricalEvent>;
  similarities: { positives: number[]; negative: number | null };
}

export function TodayBrief({
  date,
  brief,
  zVector,
  events,
  similarities,
}: TodayBriefProps) {
  const positiveEvents = brief.positives
    .map((p) => events.get(p.eventId))
    .filter((e): e is HistoricalEvent => !!e);
  const negativeEvent = brief.negative
    ? events.get(brief.negative.eventId)
    : null;

  return (
    <article className="space-y-12 fade-up">
      <Hero date={date} brief={brief} primaryEvent={positiveEvents[0]} similarity={similarities.positives[0] ?? 0} />
      <RegimeFingerprint zVector={zVector} />
      <PositivesGrid brief={brief} events={positiveEvents} similarities={similarities.positives} />
      {brief.negative && negativeEvent && similarities.negative !== null && (
        <NegativeAnalogue brief={brief.negative} event={negativeEvent} similarity={similarities.negative} />
      )}
      <Caveats caveats={brief.caveats} />
    </article>
  );
}

function Hero({
  date,
  brief,
  primaryEvent,
  similarity,
}: {
  date: string;
  brief: DailyBrief;
  primaryEvent?: HistoricalEvent;
  similarity: number;
}) {
  return (
    <header className="space-y-5">
      <div className="flex items-center gap-2">
        <Badge variant="accent" className="font-mono">OTI Daily</Badge>
        <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
          {formatDate(date)}
        </span>
      </div>
      <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
        {brief.headline}
      </h1>
      {primaryEvent && (
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Top analogue
          </span>
          <span className="font-medium">{primaryEvent.title}</span>
          <span className="mono text-[11px] text-[var(--color-muted-foreground)]">
            {primaryEvent.date} · similarity {(similarity * 100).toFixed(0)}%
          </span>
        </div>
      )}
      <p className="text-balance max-w-3xl text-base text-[var(--color-muted-foreground)] leading-relaxed md:text-lg">
        {brief.regimeSummary}
      </p>
    </header>
  );
}

function RegimeFingerprint({ zVector }: { zVector: Array<number | null> }) {
  const max = Math.max(2, ...zVector.map((v) => Math.abs(v ?? 0)));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Today's regime fingerprint</SectionLabel>
        <span className="mono text-[10px] text-[var(--color-muted-foreground)] hidden sm:inline">
          z-score vs trailing 5y
        </span>
      </div>
      <Card>
        <CardContent className="p-5">
          <div className="space-y-2">
            {REGIME_COMPONENTS.map((c, i) => {
              const z = zVector[i];
              const isAvail = z !== null && z !== undefined && Number.isFinite(z);
              const value = isAvail ? (z as number) : 0;
              const tone = !isAvail
                ? "neutral"
                : Math.abs(value) > 1.5
                  ? value > 0
                    ? "negative"
                    : "positive"
                  : "neutral";
              return (
                <div
                  key={c.key}
                  className="grid grid-cols-[120px_1fr_56px] items-center gap-3 text-xs"
                >
                  <span className="text-[var(--color-muted-foreground)]">
                    {c.label}
                  </span>
                  <div className="relative h-3 rounded-sm bg-[var(--color-surface-elevated)]">
                    {/* Centre line at z=0 */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-[var(--color-border)]"
                      style={{ left: "50%" }}
                    />
                    {isAvail && (
                      <div
                        className={cn(
                          "absolute top-0 bottom-0 rounded-sm",
                          tone === "positive"
                            ? "bg-[var(--color-positive-subtle)]"
                            : tone === "negative"
                              ? "bg-[var(--color-negative-subtle)]"
                              : "bg-[var(--color-accent-subtle)]/60",
                        )}
                        style={
                          value >= 0
                            ? {
                                left: "50%",
                                width: `${(value / max) * 50}%`,
                              }
                            : {
                                right: "50%",
                                width: `${(Math.abs(value) / max) * 50}%`,
                              }
                        }
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mono text-[11px] text-right",
                      isAvail ? "text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)]",
                    )}
                  >
                    {isAvail ? value.toFixed(2) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function PositivesGrid({
  brief,
  events,
  similarities,
}: {
  brief: DailyBrief;
  events: HistoricalEvent[];
  similarities: number[];
}) {
  return (
    <section className="space-y-4">
      <SectionLabel>Three regimes that rhyme</SectionLabel>
      <div className="grid gap-4 md:grid-cols-3">
        {brief.positives.map((p, i) => {
          const event = events[i];
          if (!event) return null;
          const series = [
            event.assetMoves.sp500.d1,
            event.assetMoves.sp500.d5,
            event.assetMoves.sp500.m1,
            event.assetMoves.sp500.m3,
            event.assetMoves.sp500.m6,
          ];
          return (
            <Card key={p.eventId} className="overflow-hidden">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-baseline justify-between">
                  <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                    Analogue {i + 1}
                  </span>
                  <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                    {(similarities[i] * 100).toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-pretty text-base font-semibold leading-snug">
                  {event.title}
                </h3>
                <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                  {formatDate(event.date)}
                </span>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Sparkline
                  values={series}
                  width={224}
                  height={28}
                  showBaseline
                  labels={["1d", "5d", "1m", "3m", "6m"]}
                  unit="pct"
                  ariaLabel={`S&P 500 returns following ${event.title}`}
                />
                <p className="text-sm leading-relaxed">{p.oneLineFit}</p>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dataset#${event.id}`}
                    className="text-xs text-[var(--color-accent)] hover:underline underline-offset-2 inline-flex items-center gap-1"
                  >
                    Read the full event
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function NegativeAnalogue({
  brief,
  event,
  similarity,
}: {
  brief: NonNullable<DailyBrief["negative"]>;
  event: HistoricalEvent;
  similarity: number;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <SectionLabel>The near-miss — went the other way</SectionLabel>
        <Badge variant="outline" className="font-mono text-[9px]">
          contrastive
        </Badge>
      </div>
      <Card className="border-[var(--color-warning-subtle)]">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold tracking-tight">{event.title}</h3>
            <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
              {formatDate(event.date)} · similarity {(similarity * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm leading-relaxed">{brief.oneLineFit}</p>
          <div className="rounded-md border border-[var(--color-warning-subtle)]/60 bg-[color-mix(in_oklch,var(--color-warning)_5%,transparent)] p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-warning)] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-warning)]">
                  Disambiguator
                </p>
                <p className="text-xs leading-relaxed text-[var(--color-foreground)]/85">
                  {brief.disambiguator}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Caveats({ caveats }: { caveats: string[] }) {
  return (
    <section className="space-y-3">
      <SectionLabel>Caveats</SectionLabel>
      <Card>
        <CardContent className="p-5">
          <ul className="space-y-2">
            {caveats.map((c, i) => (
              <li
                key={i}
                className="relative pl-5 text-xs leading-relaxed text-[var(--color-muted-foreground)] before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-[var(--color-muted-foreground)]"
              >
                {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
      {children}
    </div>
  );
}
