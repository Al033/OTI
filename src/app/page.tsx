import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyzeShell } from "@/components/analyze-shell";
import { TodayPreviewCard } from "@/components/today-preview-card";
import { EVENTS, EVENT_BY_ID } from "@/lib/events";
import { DEMO_RESULTS } from "@/lib/demo-cache";
import { getMatches, getRecentBriefs } from "@/lib/regime/store";
import {
  SYNTHETIC_BRIEF,
  SYNTHETIC_DATE,
  SYNTHETIC_SIMILARITIES,
} from "@/lib/regime/synthetic-today";
import type { HistoricalEvent } from "@/lib/types";
import type { DailyBrief } from "@/lib/regime/brief";

interface PageProps {
  searchParams: Promise<{ demo?: string | string[] }>;
}

interface ResolvedTodayPreview {
  date: string;
  brief: DailyBrief;
  similarities: number[];
  positiveEvents: ReadonlyArray<HistoricalEvent | undefined>;
  isPreview: boolean;
}

async function resolveTodayPreview(): Promise<ResolvedTodayPreview> {
  // Live cron path takes precedence whenever a recent brief is persisted.
  const recent = await getRecentBriefs(1);
  if (recent[0]) {
    const r = recent[0];
    const matches = await getMatches(r.date);
    if (matches) {
      return {
        date: r.date,
        brief: r.brief,
        similarities: matches.positives.map((p) => p.similarity),
        positiveEvents: matches.positives.map((p) =>
          EVENT_BY_ID.get(p.eventId),
        ),
        isPreview: false,
      };
    }
  }

  // Synthetic-preview fallback — keyed to the project clock date so the
  // launch-day URL renders a real-shaped page from minute one.
  return {
    date: SYNTHETIC_DATE,
    brief: SYNTHETIC_BRIEF,
    similarities: SYNTHETIC_SIMILARITIES.positives,
    positiveEvents: SYNTHETIC_BRIEF.positives.map((p) =>
      EVENT_BY_ID.get(p.eventId),
    ),
    isPreview: true,
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const demoId = Array.isArray(params.demo) ? params.demo[0] : params.demo;
  const initialResult = demoId ? DEMO_RESULTS.get(demoId) : null;

  const today = await resolveTodayPreview();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 md:pt-20">
        <Hero />
        <div className="mt-10">
          <TodayPreviewCard
            date={today.date}
            brief={today.brief}
            similarities={today.similarities}
            positiveEvents={today.positiveEvents}
            isPreview={today.isPreview}
          />
        </div>
        <div className="mt-16">
          <AnalyseSection
            initialResult={initialResult ?? null}
            events={EVENTS}
          />
        </div>
        <Pillars />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-1 text-[11px] text-[var(--color-muted-foreground)]">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        </span>
        <span>Memory, not prediction.</span>
        <span className="text-[var(--color-foreground)]/60">·</span>
        <a
          href="/methodology"
          className="hover:text-[var(--color-foreground)] transition-colors"
        >
          Read the methodology
        </a>
      </div>
      <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
        Markets don&apos;t predict.
        <br />
        <span className="text-[var(--color-muted-foreground)]">
          They remember.
        </span>
      </h1>
      <p className="max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
        Type a market event. OTI returns three historical analogues, asset
        behaviour over the next month, flow patterns, trades that looked
        obvious but failed, and where consensus went wrong. From a curated
        corpus of 39 macro events, 1929–2025.
      </p>
    </div>
  );
}

function AnalyseSection({
  events,
  initialResult,
}: {
  events: ReadonlyArray<HistoricalEvent>;
  initialResult: ReturnType<typeof DEMO_RESULTS.get> | null;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Analyse your own event
        </p>
        <p className="hidden text-[10px] text-[var(--color-muted-foreground)] md:block">
          Tag → retrieve → synthesise · ~6s end-to-end
        </p>
      </div>
      <AnalyzeShell events={events} initialResult={initialResult ?? null} />
    </section>
  );
}

function Pillars() {
  const items = [
    {
      label: "Two-stage retrieval",
      body: "Jaccard over a controlled vocabulary of regime tags + voyage-finance-2 cosine over event embeddings, RRF-fused. Both scores published.",
    },
    {
      label: "Corpus-of-reasoning",
      body: "Each event optionally carries an analyticalTrajectory (ARISE pattern, arXiv:2605.03242) — prior beliefs, marginal data points, decision points, dominant bias. Phase A reasons through how the regime was actually thought through, not just what happened.",
    },
    {
      label: "Point-in-time framing",
      body: "Each event records narrative-at-time separately from outcome-in-hindsight. Phase A of synthesis sees only point-in-time prose + the t=0 reaction; Phase B sees the resolution. Look-ahead defence is structural, not aspirational.",
    },
    {
      label: "Show your work",
      body: "Every brief reveals the candidates with scores, the LLM's tag rationale, the calibrated 80% interval (LofreeCP), the verifier's 7-check audit, and the prompts. Auditable end-to-end.",
    },
  ];
  return (
    <section className="mt-32 space-y-6">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
        How it works
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="space-y-2 border-l border-[var(--color-border-subtle)] pl-5"
          >
            <p className="text-sm font-medium">{it.label}</p>
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
