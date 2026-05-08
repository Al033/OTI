import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShareBar } from "@/components/share-bar";
import { TodayBrief } from "@/components/today-brief";
import { Card, CardContent } from "@/components/ui/card";
import {
  getMatches,
  getRecentBriefs,
  getSnapshot,
} from "@/lib/regime/store";
import { EVENTS, CORPUS_VERSION } from "@/lib/events";
import type { PipelineResult } from "@/lib/types";

export const dynamic = "force-dynamic"; // We always render the latest persisted brief.

export async function generateMetadata(): Promise<Metadata> {
  const recent = await getRecentBriefs(1);
  if (recent.length === 0) {
    return {
      title: "OTI Daily — Today's Regime",
      description:
        "OTI Daily — the macro regime today resembles, distilled from 30 historical events. Memory, not prediction.",
    };
  }
  const r = recent[0];
  return {
    title: r.brief.headline,
    description: r.brief.regimeSummary,
    openGraph: {
      title: r.brief.headline,
      description: r.brief.regimeSummary,
      type: "article",
      images: [
        {
          url: `/api/og/today/${r.date}`,
          width: 1200,
          height: 675,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: r.brief.headline,
      description: r.brief.regimeSummary,
      images: [`/api/og/today/${r.date}`],
    },
  };
}

export default async function TodayPage() {
  const recent = await getRecentBriefs(7);
  if (recent.length === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-24">
          <NotYetGenerated />
        </main>
        <Footer />
      </>
    );
  }

  const latest = recent[0];
  const snap = await getSnapshot(latest.date);
  const matches = await getMatches(latest.date);

  if (!snap || !matches) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-24">
          <NotYetGenerated />
        </main>
        <Footer />
      </>
    );
  }

  const eventsMap = new Map(EVENTS.map((e) => [e.id, e]));
  const positiveSimilarities = matches.positives.map((p) => p.similarity);
  const negativeSimilarity = matches.negative
    ? matches.negative.similarity
    : null;

  // Wrap as a PipelineResult-shaped object so ShareBar can reuse its
  // share-link UX without a special-case path. The shareable URL points
  // at /today/<date> not /b/<id>.
  const shareResult: PipelineResult = {
    query: `Today's regime — ${latest.date}`,
    queryTags: {
      triggerType: "structural_event",
      regimeTags: ["risk_off", "vol_spiking"],
      region: "GLOBAL",
      surpriseFactor: 3,
      assetFocus: [],
      dateHint: latest.date,
      rationale: "daily-regime synthetic",
    },
    candidates: [],
    brief: {
      headline: latest.brief.headline,
      oneLineSummary: latest.brief.regimeSummary,
      analogues: [],
      disagreementNote: null,
      failedTradesPattern: "n/a",
      consensusError: "n/a",
      caveats: latest.brief.caveats,
    } as PipelineResult["brief"],
    modelTag: "n/a",
    modelSynth: latest.modelSynth,
    durationMs: 0,
    generatedAt: latest.createdAt.toISOString(),
    isDemo: false,
    corpusVersion: latest.corpusVersion,
    retrievalAudit: {
      embeddingsSource: "db",
      rerankUsed: false,
      topKBeforeRerank: 0,
      topKAfterRerank: 0,
      embeddingModel: "n/a (regime k-NN)",
      rerankModel: null,
    },
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 md:pt-20">
        <ShareBar
          result={shareResult}
          briefId={`today/${latest.date}`}
          pathPrefix="/"
        />
        <TodayBrief
          date={latest.date}
          brief={latest.brief}
          zVector={snap.zVector}
          events={eventsMap}
          similarities={{
            positives: positiveSimilarities,
            negative: negativeSimilarity,
          }}
        />
        {recent.length > 1 && <ArchiveStrip recent={recent.slice(1)} />}
        <CorpusVersionFootnote
          version={latest.corpusVersion}
          shipped={CORPUS_VERSION}
        />
      </main>
      <Footer />
    </>
  );
}

function NotYetGenerated() {
  return (
    <Card className="mt-12">
      <CardContent className="space-y-3 p-6">
        <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
          OTI Daily
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Today's regime hasn't been generated yet.
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          The daily regime brief is produced by a Vercel Cron at 21:05 UTC
          (after US close). To generate one in dev, set{" "}
          <code className="mono text-xs">FRED_API_KEY</code> +{" "}
          <code className="mono text-xs">POSTGRES_URL</code> +{" "}
          <code className="mono text-xs">AI_GATEWAY_API_KEY</code> and run{" "}
          <code className="mono text-xs">pnpm regime:centroids</code> followed by{" "}
          <code className="mono text-xs">curl -X POST localhost:3000/api/cron/regime-snapshot</code>
          .
        </p>
        <p>
          <Link
            href="/"
            className="text-sm text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            ← Back to OTI home
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function ArchiveStrip({ recent }: { recent: Awaited<ReturnType<typeof getRecentBriefs>> }) {
  return (
    <section className="mt-16 space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        Recent days
      </p>
      <ul className="grid gap-2 md:grid-cols-2">
        {recent.map((r) => (
          <li key={r.date}>
            <Link
              href={`/today/${r.date}`}
              className="block rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-xs hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                {r.date}
              </span>
              <span className="ml-3">{r.brief.headline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CorpusVersionFootnote({
  version,
  shipped,
}: {
  version: string;
  shipped: string;
}) {
  if (version === shipped) return null;
  return (
    <p className="mt-12 text-[11px] text-[var(--color-muted-foreground)]">
      This brief was generated against corpus version{" "}
      <code className="mono text-[10px]">{version}</code>; the live corpus
      is now <code className="mono text-[10px]">{shipped}</code>. Some event
      ids may have changed; rerun the daily cron to refresh.
    </p>
  );
}
