"use client";

import * as React from "react";
import {
  AlertTriangle,
  ChevronDown,
  Info,
  Quote,
  ScrollText,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sparkline } from "@/components/sparkline";
import { cn, formatPct, formatBps, formatDate } from "@/lib/utils";
import type {
  PipelineResult,
  HistoricalEvent,
  ReturnSeries,
} from "@/lib/types";

type AssetKey = "sp500" | "ust10y" | "dxy" | "gold" | "oil" | "creditHY" | "vix";

interface BriefProps {
  result: PipelineResult;
  events: ReadonlyMap<string, HistoricalEvent>;
}

export function Brief({ result, events }: BriefProps) {
  const analogueEvents = result.brief.analogues.map((a) => ({
    output: a,
    event: events.get(a.eventId)!,
  }));

  return (
    <article className="space-y-12 fade-up">
      <BriefHeader result={result} analogueEvents={analogueEvents} />

      {result.brief.disagreementNote && (
        <DisagreementBanner note={result.brief.disagreementNote} />
      )}

      <AnalogueGrid analogueEvents={analogueEvents} />

      <AssetMovesSection analogueEvents={analogueEvents} />

      <PatternSection
        icon={<Quote className="h-3.5 w-3.5" />}
        label="Trades that looked obvious — and failed"
        body={result.brief.failedTradesPattern}
        accent
      >
        <FailedTradeQuotes analogueEvents={analogueEvents} />
      </PatternSection>

      <PatternSection
        icon={<Target className="h-3.5 w-3.5" />}
        label="Where consensus went wrong"
        body={result.brief.consensusError}
      />

      <CaveatsSection caveats={result.brief.caveats} />

      <ShowYourWork result={result} events={events} />
    </article>
  );
}

function BriefHeader({
  result,
  analogueEvents,
}: {
  result: PipelineResult;
  analogueEvents: Array<{ output: PipelineResult["brief"]["analogues"][number]; event: HistoricalEvent }>;
}) {
  return (
    <header className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="accent" className="font-mono">
          {result.isDemo ? "Demo · precomputed" : `${result.modelSynth}`}
        </Badge>
        <Badge variant="outline">
          {analogueEvents.length} analogues from {result.candidates.length} candidates
        </Badge>
        {!result.isDemo && (
          <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
            {(result.durationMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        {result.brief.headline}
      </h1>
      <p className="text-balance max-w-3xl text-base text-[var(--color-muted-foreground)] leading-relaxed">
        {result.brief.oneLineSummary}
      </p>
    </header>
  );
}

function DisagreementBanner({ note }: { note: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--color-warning-subtle)] bg-[color-mix(in_oklch,var(--color-warning)_8%,transparent)] p-4">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
      <div className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-warning)]">
          Analogues disagree
        </p>
        <p className="text-sm leading-relaxed text-[var(--color-foreground)]/90">
          {note}
        </p>
      </div>
    </div>
  );
}

function AnalogueGrid({
  analogueEvents,
}: {
  analogueEvents: Array<{ output: PipelineResult["brief"]["analogues"][number]; event: HistoricalEvent }>;
}) {
  return (
    <section className="space-y-4">
      <SectionLabel>Three historical analogues</SectionLabel>
      <div className="grid gap-4 md:grid-cols-3">
        {analogueEvents.map((a, idx) => (
          <AnalogueCard key={a.event.id} index={idx + 1} {...a} />
        ))}
      </div>
    </section>
  );
}

function AnalogueCard({
  index,
  output,
  event,
}: {
  index: number;
  output: PipelineResult["brief"]["analogues"][number];
  event: HistoricalEvent;
}) {
  const sp = event.assetMoves.sp500;
  const series = [sp.d1, sp.d5, sp.m1, sp.m3, sp.m6];
  const m1 = sp.m1;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-baseline justify-between">
          <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Analogue {index}
          </span>
          <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
            {formatDate(event.date)}
          </span>
        </div>
        <h3 className="text-pretty text-base font-semibold leading-snug">
          {event.title}
        </h3>
        <FitConfidence value={output.fitConfidence} />
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
              S&P, 1d → 6m
            </span>
            <span
              className={cn(
                "mono text-xs font-medium",
                m1 !== null && m1 > 0
                  ? "text-[var(--color-positive)]"
                  : m1 !== null && m1 < 0
                    ? "text-[var(--color-negative)]"
                    : "text-[var(--color-muted-foreground)]",
              )}
            >
              {m1 !== null ? formatPct(m1) : "—"}
              <span className="ml-1 text-[10px] text-[var(--color-muted-foreground)]">@1m</span>
            </span>
          </div>
          <Sparkline
            values={series}
            width={224}
            height={28}
            className="mt-2"
            showBaseline
            labels={["1d", "5d", "1m", "3m", "6m"]}
            unit="pct"
            ariaLabel={`S&P 500 returns following ${event.title}`}
          />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Why analogous
          </p>
          <p className="text-sm leading-relaxed">{output.whyAnalogous}</p>
        </div>

        <div className="space-y-2 rounded-md border border-[var(--color-warning-subtle)]/60 bg-[color-mix(in_oklch,var(--color-warning)_5%,transparent)] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-warning)]">
            Where this might not fit
          </p>
          <p className="text-xs leading-relaxed text-[var(--color-foreground)]/85">
            {output.whereThisMightNotFit}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {event.regimeTags.slice(0, 6).map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono text-[9px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FitConfidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        Fit
      </span>
      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
        <div
          className="absolute left-0 top-0 h-full bg-[var(--color-accent)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mono text-[10px] text-[var(--color-foreground)]">
        {pct}%
      </span>
    </div>
  );
}

const ASSETS: Array<{ key: AssetKey; label: string; unit: "pct" | "bps" | "level" }> = [
  { key: "sp500", label: "S&P 500", unit: "pct" },
  { key: "ust10y", label: "10y UST", unit: "bps" },
  { key: "dxy", label: "DXY", unit: "pct" },
  { key: "gold", label: "Gold", unit: "pct" },
  { key: "oil", label: "Oil", unit: "pct" },
  { key: "creditHY", label: "HY OAS", unit: "bps" },
  { key: "vix", label: "VIX", unit: "level" },
];

function AssetMovesSection({
  analogueEvents,
}: {
  analogueEvents: Array<{ output: PipelineResult["brief"]["analogues"][number]; event: HistoricalEvent }>;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon={<TrendingUp className="h-3 w-3" />}>
          Asset behaviour, next 6 months
        </SectionLabel>
        <span className="mono text-[10px] text-[var(--color-muted-foreground)] hidden sm:inline">
          horizons: 1d · 5d · 1m · 3m · 6m
        </span>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="border-b border-[var(--color-border-subtle)]">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-medium">
                  Asset
                </th>
                {analogueEvents.map((a, i) => (
                  <th
                    key={a.event.id}
                    className="px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)] font-medium"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[var(--color-foreground)]">
                        Analogue {i + 1}
                      </span>
                      <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                        {a.event.date.slice(0, 4)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((asset) => (
                <tr
                  key={asset.key}
                  className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-surface-elevated)]/30"
                >
                  <td className="px-4 py-3 font-medium">{asset.label}</td>
                  {analogueEvents.map((a) => (
                    <td key={a.event.id} className="px-4 py-3">
                      <AssetCell series={a.event.assetMoves[asset.key]} unit={asset.unit} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function AssetCell({
  series,
  unit,
}: {
  series: ReturnSeries;
  unit: "pct" | "bps" | "level";
}) {
  const values = [series.d1, series.d5, series.m1, series.m3, series.m6];
  const m1 = series.m1;
  const allNull = values.every((v) => v === null);

  if (allNull) {
    return <span className="mono text-[10px] text-[var(--color-muted-foreground)]">— series unavailable</span>;
  }

  const tone =
    m1 === null
      ? "neutral"
      : unit === "bps"
        ? m1 > 0
          ? "negative"
          : m1 < 0
            ? "positive"
            : "neutral"
        : unit === "level"
          ? m1 > 0
            ? "negative"
            : "positive"
          : m1 > 0
            ? "positive"
            : m1 < 0
              ? "negative"
              : "neutral";

  return (
    <div className="flex items-center gap-3">
      <Sparkline
        values={values}
        width={88}
        height={22}
        tone={tone as "positive" | "negative" | "neutral"}
        showBaseline
        labels={["1d", "5d", "1m", "3m", "6m"]}
        unit={unit}
      />
      <span
        className={cn(
          "mono text-xs whitespace-nowrap",
          tone === "positive"
            ? "text-[var(--color-positive)]"
            : tone === "negative"
              ? "text-[var(--color-negative)]"
              : "text-[var(--color-muted-foreground)]",
        )}
      >
        {m1 === null ? "—" : unit === "bps" ? formatBps(m1) : unit === "level" ? (m1 > 0 ? `+${m1.toFixed(1)}` : m1.toFixed(1)) : formatPct(m1)}
      </span>
    </div>
  );
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function PatternSection({
  icon,
  label,
  body,
  children,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
  children?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section className="space-y-3">
      <SectionLabel icon={icon}>{label}</SectionLabel>
      <Card>
        <CardContent className="p-5">
          <p
            className={cn(
              "text-base leading-relaxed text-pretty",
              accent ? "text-[var(--color-foreground)]" : "text-[var(--color-foreground)]/90",
            )}
          >
            {body}
          </p>
          {children && <div className="mt-4">{children}</div>}
        </CardContent>
      </Card>
    </section>
  );
}

function FailedTradeQuotes({
  analogueEvents,
}: {
  analogueEvents: Array<{ output: PipelineResult["brief"]["analogues"][number]; event: HistoricalEvent }>;
}) {
  const allQuotes = analogueEvents.flatMap((a) =>
    a.event.failedTrades.slice(0, 1).map((ft) => ({
      ...ft,
      eventTitle: a.event.title,
    })),
  );
  if (allQuotes.length === 0) return null;
  return (
    <ul className="space-y-3 border-t border-[var(--color-border-subtle)] pt-4">
      {allQuotes.map((q, i) => (
        <li key={i} className="flex gap-3 text-xs leading-relaxed">
          <Quote className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-muted-foreground)]" />
          <div className="space-y-1">
            <p className="italic text-[var(--color-foreground)]/85">"{q.quote}"</p>
            <p className="mono text-[10px] text-[var(--color-muted-foreground)]">
              — {q.attribution} <span className="opacity-60">· {q.eventTitle}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CaveatsSection({ caveats }: { caveats: string[] }) {
  return (
    <section className="space-y-3">
      <SectionLabel icon={<Info className="h-3 w-3" />}>
        Caveats
      </SectionLabel>
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

function ShowYourWork({
  result,
  events,
}: {
  result: PipelineResult;
  events: ReadonlyMap<string, HistoricalEvent>;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <section className="space-y-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 py-3 text-left text-sm font-medium transition-colors hover:bg-[var(--color-surface-elevated)]">
            <div className="flex items-center gap-2">
              <ScrollText className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
              <span>Show your work</span>
              <Badge variant="outline">retrieval candidates · scores</Badge>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[var(--color-muted-foreground)] transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="p-5 space-y-6">
              <QueryTagsAudit result={result} />
              <Separator />
              <CandidatesAudit result={result} events={events} />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

function QueryTagsAudit({ result }: { result: PipelineResult }) {
  const t = result.queryTags;
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
        Query interpretation
      </p>
      <div className="grid gap-3 text-xs md:grid-cols-3">
        <KV label="trigger" value={t.triggerType} mono />
        <KV label="region" value={t.region} mono />
        <KV label="surprise" value={`${t.surpriseFactor}/5`} mono />
      </div>
      <div className="flex flex-wrap gap-1">
        {t.regimeTags.map((tag) => (
          <Badge key={tag} variant="accent" className="font-mono text-[9px]">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-[var(--color-muted-foreground)] border-l-2 border-[var(--color-accent-subtle)] pl-3">
        {t.rationale}
      </p>
    </div>
  );
}

function CandidatesAudit({
  result,
  events,
}: {
  result: PipelineResult;
  events: ReadonlyMap<string, HistoricalEvent>;
}) {
  const chosen = new Set(result.brief.analogues.map((a) => a.eventId));
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
        Top retrieval candidates
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <th className="px-2 py-2 font-medium">Rank</th>
              <th className="px-2 py-2 font-medium">Event</th>
              <th className="px-2 py-2 font-medium text-right">Jaccard</th>
              <th className="px-2 py-2 font-medium text-right">Cosine</th>
              <th className="px-2 py-2 font-medium text-right">Combined</th>
            </tr>
          </thead>
          <tbody>
            {result.candidates.map((c, i) => {
              const ev = events.get(c.eventId);
              if (!ev) return null;
              const isChosen = chosen.has(c.eventId);
              return (
                <tr
                  key={c.eventId}
                  className={cn(
                    "border-t border-[var(--color-border-subtle)]",
                    isChosen && "bg-[color-mix(in_oklch,var(--color-accent)_6%,transparent)]",
                  )}
                >
                  <td className="px-2 py-2 mono text-[10px] text-[var(--color-muted-foreground)]">
                    {i + 1}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span>{ev.title}</span>
                      {isChosen && (
                        <Badge variant="accent" className="text-[9px]">selected</Badge>
                      )}
                    </div>
                    <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                      {ev.date.slice(0, 7)} · {ev.region}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right mono">{c.jaccard.toFixed(3)}</td>
                  <td className="px-2 py-2 text-right mono text-[var(--color-muted-foreground)]">
                    {c.cosine === null ? "—" : c.cosine.toFixed(3)}
                  </td>
                  <td className="px-2 py-2 text-right mono font-medium">{c.combined.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
        Cosine scores require precomputed embeddings (run <code className="mono text-[10px] px-1 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">pnpm embeddings</code> with an embedding-capable provider key). Without them, retrieval falls back to deterministic Jaccard scoring only.
      </p>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className={cn("text-xs", mono && "mono")}>{value}</p>
    </div>
  );
}
