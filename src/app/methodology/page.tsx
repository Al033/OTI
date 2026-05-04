import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How OTI works — the data, the retrieval, the prompts, the limits. Intellectual honesty by construction.",
};

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-24">
        <article className="prose-invert space-y-10">
          <header className="space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Methodology
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              How this works, where it doesn't, and why
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-[var(--color-muted-foreground)]">
              OTI is a memory tool. It surfaces structurally similar past events
              from a curated dataset and asks an LLM to write the brief. It
              does not forecast. The five things below are the load-bearing
              decisions that let it do this honestly.
            </p>
          </header>

          <Section
            label="01"
            title="Why N = 30 is a feature, not a bug"
          >
            <p>
              The corpus is 30 hand-curated events. Each entry has structured
              metadata, point-in-time narrative, and asset-move data sourced
              from public records (FRED, central-bank archives, contemporaneous
              reporting).
            </p>
            <p>
              An LLM with internet-scale training data can talk about thousands
              of events. The constraint to 30 is what makes the output{" "}
              <em>auditable</em>: you can read every event we considered. If
              there's a relevant analogue we missed, you can see we missed it
              and submit a PR. The smaller the corpus, the more honest the
              system can be about its own coverage.
            </p>
          </Section>

          <Section
            label="02"
            title="Two-stage hybrid retrieval"
          >
            <p>The pipeline runs in three steps:</p>
            <ol>
              <li>
                <strong>Tag.</strong> A cheap LLM (Claude Haiku 4.5 by default)
                tags the user's query into a structured profile drawn from a
                controlled vocabulary: a single trigger type, 3–7 regime tags,
                a region, a surprise factor 1–5, and a free-form asset focus.
                The vocabulary lives in <Code>src/lib/regime-tags.ts</Code> and
                is the contract between the user query and the corpus.
              </li>
              <li>
                <strong>Retrieve.</strong> For each event in the corpus, we
                compute Jaccard similarity over the tag sets and (when
                embeddings are present) cosine similarity over event
                descriptions. We combine them with a weighted score, plus
                small bonuses for trigger-type and region match. Top-10
                candidates pass through.
              </li>
              <li>
                <strong>Synthesise.</strong> A reasoning model (Claude Sonnet
                4.6 by default; OpenAI / Google / Mistral selectable) sees the
                top-10 candidates and emits a strictly-typed brief via the AI
                SDK's <Code>generateObject</Code>. The brief schema constrains
                the chosen <Code>eventId</Code> values to the corpus IDs at
                build time. The model cannot return events outside the corpus.
              </li>
            </ol>
          </Section>

          <Section
            label="03"
            title="The narrativeAtTime / outcomeInHindsight split"
          >
            <p>
              The single most important schema decision. Every event stores
              two prose fields:
            </p>
            <ul>
              <li>
                <strong>narrativeAtTime</strong> — what the consensus
                actually believed in the days before the event. The synthesis
                prompt is allowed to use this when explaining why an analogue
                fits the user's event.
              </li>
              <li>
                <strong>outcomeInHindsight</strong> — what actually happened.
                The synthesis prompt is restricted to using this only when
                writing the "consensus error" and "failed trades pattern"
                sections.
              </li>
            </ul>
            <p>
              This separation is the structural defence against look-ahead
              bias. When the model reasons about whether 1992 Black Wednesday
              is analogous to a current sterling event, it sees the
              point-in-time consensus that markets believed sterling could be
              defended — not the hindsight that Soros made $1bn.
            </p>
          </Section>

          <Section
            label="04"
            title="Show your work"
          >
            <p>Every brief includes a "show your work" panel that exposes:</p>
            <ul>
              <li>The query interpretation: trigger type, regime tags, surprise factor, the LLM's rationale.</li>
              <li>All 10 retrieved candidates with Jaccard, cosine, and combined scores. The 3 selected analogues are highlighted; the other 7 are visible.</li>
              <li>The model used for tagging and synthesis, and the wall-clock time.</li>
            </ul>
            <p>
              If the system selects a weak analogue, the audit panel lets you
              see why — and which stronger candidate it should have chosen.
              This is the surface that makes intellectual honesty enforceable
              rather than aspirational.
            </p>
          </Section>

          <Section
            label="05"
            title="Where this gets things wrong"
          >
            <p>Specific known failure modes:</p>
            <ul>
              <li>
                <strong>Coverage gaps.</strong> 30 events span 1971–2025 but
                cluster around developed-market crises. EM, Asia, and pre-1971
                events are under-represented. If your event is structurally
                similar to e.g. 1923 Weimar hyperinflation, OTI has nothing to
                offer.
              </li>
              <li>
                <strong>Tag drift.</strong> Two curators may tag the same
                event differently. The controlled vocabulary mitigates this
                but doesn't eliminate it. Retrieval Jaccard scores can shift
                by 0.1+ on tag re-curation.
              </li>
              <li>
                <strong>Asset-move precision.</strong> Returns are sourced
                from public records and intended to convey direction and
                magnitude. They are <em>not</em> tick-accurate. The repo
                includes (TODO) a <Code>pnpm refresh-prices</Code> script to
                pull canonical FRED data into the dataset.
              </li>
              <li>
                <strong>LLM confabulation about quotes.</strong> Failed-trade
                quotes in the corpus are sourced (or paraphrased from
                contemporaneous reporting). The LLM is instructed to
                synthesise patterns, not to invent specific quotes. We have
                not seen quote fabrication, but we cannot prove its absence.
              </li>
              <li>
                <strong>Three-analogue forced fit.</strong> The schema
                requires exactly three analogues. Some queries genuinely
                don't have three good fits in the corpus. The "where this
                might not fit" surface and the disagreement banner are how
                we mitigate; they are imperfect.
              </li>
            </ul>
            <p>
              If you find a concrete failure, please{" "}
              <Link
                href="https://github.com/"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                open an issue
              </Link>
              . The corpus and pipeline are MIT-licensed; better tagging and
              new events are the most useful contributions.
            </p>
          </Section>

          <Section
            label="06"
            title="What this is not"
          >
            <ul>
              <li>Not investment advice.</li>
              <li>Not a forecast.</li>
              <li>Not a backtest.</li>
              <li>
                Not a "find me a trade" tool. It does not generate
                allocations, price targets, or recommendations. It surfaces
                history and asks you to think.
              </li>
            </ul>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              For real research, this should be the first 30 seconds of your
              workflow, not the last.
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-[var(--color-border-subtle)] pt-10">
      <div className="flex items-baseline gap-3">
        <span className="mono text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {label}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4 text-base leading-relaxed text-[var(--color-foreground)]/85 [&>p]:text-pretty [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&_strong]:text-[var(--color-foreground)] [&_em]:italic">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="mono text-[12px] px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
      {children}
    </code>
  );
}
