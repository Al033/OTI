import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyzeShell } from "@/components/analyze-shell";
import { EVENTS } from "@/lib/events";
import { DEMO_RESULTS } from "@/lib/demo-cache";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ demo?: string | string[] }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const demoId = Array.isArray(params.demo) ? params.demo[0] : params.demo;
  const initialResult = demoId ? DEMO_RESULTS.get(demoId) : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-16 pb-24 md:pt-24">
        <Hero />
        <div className="mt-12">
          <AnalyzeShell events={EVENTS} initialResult={initialResult ?? null} />
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
