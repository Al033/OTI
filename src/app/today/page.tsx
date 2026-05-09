import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShareBar } from "@/components/share-bar";
import { TodayBrief } from "@/components/today-brief";
import {
  getMatches,
  getRecentBriefs,
  getSnapshot,
} from "@/lib/regime/store";
import { getSyntheticTodayPreview } from "@/lib/regime/synthetic-today";
import { EVENTS, CORPUS_VERSION } from "@/lib/events";
import type { PipelineResult } from "@/lib/types";

export const dynamic = "force-dynamic"; // We always render the latest persisted brief.

export async function generateMetadata(): Promise<Metadata> {
  const recent = await getRecentBriefs(1);
  if (recent.length === 0) {
    const preview = getSyntheticTodayPreview();
    return {
      title: preview.brief.headline,
      description: preview.brief.regimeSummary,
      openGraph: {
        title: preview.brief.headline,
        description: preview.brief.regimeSummary,
        type: "article",
        images: [
          {
            url: `/api/og/today/${preview.date}`,
            width: 1200,
            height: 675,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: preview.brief.headline,
        description: preview.brief.regimeSummary,
        images: [`/api/og/today/${preview.date}`],
      },
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
    return <SyntheticPreviewPage />;
  }

  const latest = recent[0];
  const snap = await getSnapshot(latest.date);
  const matches = await getMatches(latest.date);

  if (!snap || !matches) {
    return <SyntheticPreviewPage />;
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

function SyntheticPreviewPage() {
  const preview = getSyntheticTodayPreview();
  const eventsMap = new Map(EVENTS.map((e) => [e.id, e]));

  const shareResult: PipelineResult = {
    query: `OTI Daily — ${preview.date} (preview)`,
    queryTags: {
      triggerType: "structural_event",
      regimeTags: ["risk_off", "vol_compressed"],
      region: "GLOBAL",
      surpriseFactor: 3,
      assetFocus: [],
      dateHint: preview.date,
      rationale: "synthetic-preview",
    },
    candidates: [],
    brief: {
      headline: preview.brief.headline,
      oneLineSummary: preview.brief.regimeSummary,
      analogues: [],
      disagreementNote: null,
      failedTradesPattern: "n/a",
      consensusError: "n/a",
      caveats: preview.brief.caveats,
    } as PipelineResult["brief"],
    modelTag: "n/a",
    modelSynth: "synthetic-preview",
    durationMs: 0,
    generatedAt: new Date().toISOString(),
    isDemo: false,
    corpusVersion: CORPUS_VERSION,
    retrievalAudit: {
      embeddingsSource: "none",
      rerankUsed: false,
      topKBeforeRerank: 0,
      topKAfterRerank: 0,
      embeddingModel: "n/a (synthetic preview)",
      rerankModel: null,
    },
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 md:pt-20">
        <PreviewBanner />
        <ShareBar
          result={shareResult}
          briefId={`today/${preview.date}`}
          pathPrefix="/"
        />
        <TodayBrief
          date={preview.date}
          brief={preview.brief}
          zVector={preview.zVector}
          events={eventsMap}
          similarities={preview.similarities}
        />
      </main>
      <Footer />
    </>
  );
}

/**
 * Visible "this is a preview" affordance — sits above the brief so a
 * reader sharing the URL on launch day knows the page is synthetic.
 * Bypassed automatically once the live cron persists a real brief.
 */
function PreviewBanner() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-[var(--color-warning-subtle)] bg-[color-mix(in_oklch,var(--color-warning)_5%,transparent)] px-4 py-3 text-xs">
      <span className="rounded-sm bg-[var(--color-warning-subtle)] px-2 py-0.5 mono text-[10px] uppercase tracking-wider text-[var(--color-warning)]">
        Preview
      </span>
      <span className="text-[var(--color-muted-foreground)] leading-relaxed">
        This is a hand-curated preview of the OTI Daily flywheel — same
        shape, same UI, hand-picked analogues. The live cron flow (FRED
        snapshot → Mahalanobis k-NN → LLM-synthesised brief) replaces this
        page automatically once <code className="mono text-[10px]">FRED_API_KEY</code>{" "}
        +{" "}
        <code className="mono text-[10px]">POSTGRES_URL</code>{" "}
        are set.{" "}
        <Link
          href="/dataset"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Browse the corpus →
        </Link>
      </span>
    </div>
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
