"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Brief } from "@/components/brief";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  HistoricalEvent,
  PipelineResult,
  QueryTags,
  RetrievalAudit,
  RetrievalCandidate,
  AnalogueOutput,
  BriefOutput,
} from "@/lib/types";

export type StreamingPhase =
  | "idle"
  | "started"
  | "tagging"
  | "retrieving"
  | "synthesisA"
  | "synthesisB"
  | "complete"
  | "error";

export interface StreamingState {
  phase: StreamingPhase;
  queryTags?: QueryTags;
  candidates?: RetrievalCandidate[];
  retrievalAudit?: RetrievalAudit;
  phaseA?: Partial<{
    headline: string;
    oneLineSummary: string;
    analogues: Array<Partial<AnalogueOutput>>;
    disagreementNote: string | null;
  }>;
  phaseB?: Partial<{
    failedTradesPattern: string;
    consensusError: string;
    caveats: string[];
  }>;
  result?: PipelineResult;
  briefId?: string;
  errorCode?: string;
}

interface StreamingBriefProps {
  state: StreamingState;
  events: ReadonlyMap<string, HistoricalEvent>;
}

/**
 * Progressive renderer. Once `state.phase === "complete"` and a full
 * result is in hand, defers entirely to the existing Brief component. In
 * earlier phases, renders whatever fragments are ready: query-tags chip,
 * pipeline-phase indicator, partial headline, partially-filled analogue
 * cards, asset-move table (deterministic from chosen IDs), and so on.
 */
export function StreamingBrief({ state, events }: StreamingBriefProps) {
  if (state.phase === "complete" && state.result) {
    return <Brief result={state.result} events={events} />;
  }

  if (state.phase === "error") {
    return (
      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted-foreground)]">
        <p className="font-medium text-[var(--color-foreground)]">
          Something broke in the pipeline.
        </p>
        <p className="mt-1">Code: <code className="mono text-[11px]">{state.errorCode ?? "unknown"}</code></p>
      </div>
    );
  }

  return (
    <article className="space-y-10 fade-up">
      <PhaseStrip phase={state.phase} />
      <PartialHeader state={state} />
      <PartialAnalogues state={state} events={events} />
      <PartialPhaseB state={state} />
    </article>
  );
}

const PHASES: Array<{ key: StreamingPhase; label: string }> = [
  { key: "tagging", label: "Tagging event" },
  { key: "retrieving", label: "Retrieving + reranking" },
  { key: "synthesisA", label: "Selecting analogues" },
  { key: "synthesisB", label: "Synthesising patterns" },
];

function phaseIndex(phase: StreamingPhase): number {
  switch (phase) {
    case "idle":
    case "started":
    case "tagging":
      return 0;
    case "retrieving":
      return 1;
    case "synthesisA":
      return 2;
    case "synthesisB":
    case "complete":
      return 3;
    default:
      return 0;
  }
}

function PhaseStrip({ phase }: { phase: StreamingPhase }) {
  const active = phaseIndex(phase);
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
      {PHASES.map((p, i) => {
        const state =
          i < active ? "done" : i === active ? "active" : "pending";
        return (
          <div key={p.key} className="flex items-center gap-1.5">
            <span className="relative inline-flex h-1.5 w-1.5">
              {state === "active" && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75 animate-ping" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  state === "done"
                    ? "bg-[var(--color-positive)]"
                    : state === "active"
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-border)]",
                )}
              />
            </span>
            <span className={state === "pending" ? "opacity-50" : ""}>{p.label}</span>
            {i < PHASES.length - 1 && (
              <span className="ml-2 opacity-30">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PartialHeader({ state }: { state: StreamingState }) {
  const headline = state.phaseA?.headline;
  const summary = state.phaseA?.oneLineSummary;
  return (
    <header className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="accent" className="font-mono">
          {state.phase === "complete" ? "ready" : "streaming"}
        </Badge>
        {state.queryTags ? (
          <Badge variant="outline" className="font-mono">
            {state.queryTags.triggerType} · {state.queryTags.region}
          </Badge>
        ) : null}
        {!headline && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-muted-foreground)]" />
        )}
      </div>
      {headline ? (
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {headline}
        </h1>
      ) : (
        <Skeleton className="h-9 w-2/3" />
      )}
      {summary ? (
        <p className="text-balance max-w-3xl text-base text-[var(--color-muted-foreground)] leading-relaxed">
          {summary}
        </p>
      ) : (
        <Skeleton className="h-5 w-1/2" />
      )}
    </header>
  );
}

function PartialAnalogues({
  state,
  events,
}: {
  state: StreamingState;
  events: ReadonlyMap<string, HistoricalEvent>;
}) {
  const partials = state.phaseA?.analogues ?? [];
  const slots = [0, 1, 2];
  return (
    <section className="space-y-4">
      <SectionLabel>Three historical analogues</SectionLabel>
      <div className="grid gap-4 md:grid-cols-3">
        {slots.map((i) => {
          const a = partials[i];
          const event = a?.eventId ? events.get(a.eventId) : null;
          return (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-baseline justify-between">
                  <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                    Analogue {i + 1}
                  </span>
                  <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                    {event?.date ?? ""}
                  </span>
                </div>
                {event ? (
                  <h3 className="text-pretty text-base font-semibold leading-snug">
                    {event.title}
                  </h3>
                ) : (
                  <Skeleton className="h-5 w-3/4" />
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {a?.whyAnalogous ? (
                  <p className="text-sm leading-relaxed">{a.whyAnalogous}</p>
                ) : (
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                )}
                {a?.whereThisMightNotFit ? (
                  <div className="rounded-md border border-[var(--color-warning-subtle)]/60 bg-[color-mix(in_oklch,var(--color-warning)_5%,transparent)] p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-warning)]">
                      Where this might not fit
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-foreground)]/85">
                      {a.whereThisMightNotFit}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function PartialPhaseB({ state }: { state: StreamingState }) {
  const { failedTradesPattern, consensusError, caveats } = state.phaseB ?? {};
  if (!failedTradesPattern && !consensusError && !caveats?.length) return null;
  return (
    <section className="space-y-6">
      {failedTradesPattern && (
        <div className="space-y-2">
          <SectionLabel>Trades that looked obvious — and failed</SectionLabel>
          <Card>
            <CardContent className="p-5">
              <p className="text-base leading-relaxed">{failedTradesPattern}</p>
            </CardContent>
          </Card>
        </div>
      )}
      {consensusError && (
        <div className="space-y-2">
          <SectionLabel>Where consensus went wrong</SectionLabel>
          <Card>
            <CardContent className="p-5">
              <p className="text-base leading-relaxed">{consensusError}</p>
            </CardContent>
          </Card>
        </div>
      )}
      {caveats && caveats.length > 0 && (
        <div className="space-y-2">
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
        </div>
      )}
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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded bg-[var(--color-surface-elevated)] shimmer",
        className,
      )}
    />
  );
}

// Helpers exported for tests / other consumers if needed later.
export type { BriefOutput };
