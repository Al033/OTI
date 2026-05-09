import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyzeShell } from "@/components/analyze-shell";
import { EVENTS } from "@/lib/events";
import { DEMO_RESULTS } from "@/lib/demo-cache";
import { getRecentBriefs } from "@/lib/regime/store";
import { readEdgeConfig } from "@/lib/edge-config";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ demo?: string | string[] }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const demoId = Array.isArray(params.demo) ? params.demo[0] : params.demo;
  const initialResult = demoId ? DEMO_RESULTS.get(demoId) : null;

  // Edge Config first (sub-5ms global read). Falls back to Postgres
  // when EDGE_CONFIG isn't set or has no value yet.
  const edge = await readEdgeConfig();
  let stripData: { date: string; headline: string } | null = edge.today
    ? { date: edge.today.date, headline: edge.today.headline }
    : null;
  if (!stripData) {
    const recent = await getRecentBriefs(1);
    if (recent[0]) {
      stripData = {
        date: recent[0].date,
        headline: recent[0].brief.headline,
      };
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 md:pt-20">
        {stripData && <TodayStrip date={stripData.date} headline={stripData.headline} />}
        <div className="mt-8">
          <Hero />
        </div>
        <div className="mt-12">
          <AnalyzeShell events={EVENTS} initialResult={initialResult ?? null} />
        </div>
        <Pillars />
      </main>
      <Footer />
    </>
  );
}

function TodayStrip({ date, headline }: { date: string; headline: string }) {
  return (
    <Link
      href="/today"
      className="group flex items-center gap-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 transition-colors hover:bg-[var(--color-surface-elevated)]"
    >
      <span className="relative inline-flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)] shrink-0">
        OTI Daily · {formatDate(date)}
      </span>
      <span className="truncate text-sm font-medium">{headline}</span>
      <ArrowRight className="ml-auto h-3.5 w-3.5 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5" />
    </Link>
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
        <Link href="/methodology" className="hover:text-[var(--color-foreground)] transition-colors">
          Read the methodology
        </Link>
      </div>
      <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
        Markets don't predict.
        <br />
        <span className="text-[var(--color-muted-foreground)]">They remember.</span>
      </h1>
      <p className="max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
        Type a market event in plain English. OTI returns three historical
        analogues, asset behaviour over the next month, flow patterns, trades
        that looked obvious but failed, and where consensus went wrong. From a
        curated corpus of 30 macro events, 1971–2025.
      </p>
    </div>
  );
}

function Pillars() {
  const items = [
    {
      label: "Two-stage retrieval",
      body: "Jaccard over a controlled vocabulary of regime tags + cosine over event embeddings. Both scores published.",
    },
    {
      label: "Corpus-constrained",
      body: "The synthesis schema constrains eventId to the 30 corpus IDs. The model literally cannot hallucinate events outside the dataset.",
    },
    {
      label: "Point-in-time framing",
      body: "Each event records narrative-at-time separately from outcome-in-hindsight to keep look-ahead bias out of the analogousness reasoning.",
    },
    {
      label: "Show your work",
      body: "Every brief reveals all 10 retrieved candidates with scores, the LLM's tag rationale, and the prompts. Auditable end-to-end.",
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
