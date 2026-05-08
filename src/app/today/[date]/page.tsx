import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShareBar } from "@/components/share-bar";
import { TodayBrief } from "@/components/today-brief";
import {
  getDailyBrief,
  getMatches,
  getSnapshot,
} from "@/lib/regime/store";
import { EVENTS } from "@/lib/events";
import type { PipelineResult } from "@/lib/types";

interface PageProps {
  params: Promise<{ date: string }>;
}

export const dynamic = "force-static";
export const revalidate = 86400; // re-render daily; brief content is immutable per date

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  if (!isIsoDate(date)) return { title: "Brief not found" };
  const brief = await getDailyBrief(date);
  if (!brief) return { title: "Brief not found" };
  return {
    title: brief.brief.headline,
    description: brief.brief.regimeSummary,
    openGraph: {
      title: brief.brief.headline,
      description: brief.brief.regimeSummary,
      type: "article",
      images: [{ url: `/api/og/today/${date}`, width: 1200, height: 675 }],
    },
    twitter: {
      card: "summary_large_image",
      title: brief.brief.headline,
      description: brief.brief.regimeSummary,
      images: [`/api/og/today/${date}`],
    },
  };
}

export default async function TodayDatePage({ params }: PageProps) {
  const { date } = await params;
  if (!isIsoDate(date)) notFound();

  const brief = await getDailyBrief(date);
  if (!brief) notFound();

  const snap = await getSnapshot(date);
  const matches = await getMatches(date);
  if (!snap || !matches) notFound();

  const eventsMap = new Map(EVENTS.map((e) => [e.id, e]));

  const shareResult: PipelineResult = {
    query: `OTI Daily — ${date}`,
    queryTags: {
      triggerType: "structural_event",
      regimeTags: ["risk_off", "vol_spiking"],
      region: "GLOBAL",
      surpriseFactor: 3,
      assetFocus: [],
      dateHint: date,
      rationale: "daily-regime archived",
    },
    candidates: [],
    brief: {
      headline: brief.brief.headline,
      oneLineSummary: brief.brief.regimeSummary,
      analogues: [],
      disagreementNote: null,
      failedTradesPattern: "n/a",
      consensusError: "n/a",
      caveats: brief.brief.caveats,
    } as PipelineResult["brief"],
    modelTag: "n/a",
    modelSynth: brief.modelSynth,
    durationMs: 0,
    generatedAt: brief.createdAt.toISOString(),
    isDemo: false,
    corpusVersion: brief.corpusVersion,
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
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-1 text-[11px] text-[var(--color-muted-foreground)]">
          <span>Archived OTI Daily</span>
          <span className="text-[var(--color-foreground)]/60">·</span>
          <Link
            href="/today"
            className="hover:text-[var(--color-foreground)] transition-colors"
          >
            Today's regime →
          </Link>
        </div>
        <ShareBar
          result={shareResult}
          briefId={`today/${date}`}
          pathPrefix="/"
        />
        <TodayBrief
          date={date}
          brief={brief.brief}
          zVector={snap.zVector}
          events={eventsMap}
          similarities={{
            positives: matches.positives.map((p) => p.similarity),
            negative: matches.negative ? matches.negative.similarity : null,
          }}
        />
      </main>
      <Footer />
    </>
  );
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
