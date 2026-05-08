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
              does not forecast. The decisions below are the load-bearing
              choices that let it do this honestly.
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
            title="Two-stage hybrid retrieval, RRF-fused, region-filtered, reranked"
          >
            <p>The pipeline runs in five steps:</p>
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
                <strong>Embed.</strong> The query is embedded with{" "}
                <Code>voyage-3-large</Code> at 1024d via the Vercel AI Gateway,
                in parallel with tagging. The same model populates the corpus
                at build time via <Code>pnpm embeddings</Code>.
              </li>
              <li>
                <strong>Retrieve.</strong> For every event in the region-filtered
                corpus we compute Jaccard over the regime-tag sets and cosine
                over the embeddings. The two rankings are fused via reciprocal
                rank fusion (k=60, weights J=1.0, C=0.7). Region is a hard
                filter, not a score bonus — uncalibrated bonuses inflate the
                combined score when one signal is missing. Top-15 candidates
                pass through.
              </li>
              <li>
                <strong>Rerank.</strong> A Voyage <Code>rerank-2.5</Code>{" "}
                cross-encoder reranks the top-15 against the user's free-text
                query. Top-10 candidates pass to synthesis. Skipped when{" "}
                <Code>VOYAGE_API_KEY</Code> is absent — retrieval still works,
                quality just drops.
              </li>
              <li>
                <strong>Synthesise (two phases).</strong> Phase A picks the
                three best-fit analogues using the point-in-time view only.
                Phase B writes the cross-event consensus error and failed-trade
                pattern with the full hindsight payload. See section 03.
              </li>
            </ol>
          </Section>

          <Section
            label="03"
            title="Two-phase synthesis enforces look-ahead defence"
          >
            <p>
              Every event stores two prose fields:
            </p>
            <ul>
              <li>
                <strong>narrativeAtTime</strong> — what consensus actually
                believed in the days before the event.
              </li>
              <li>
                <strong>outcomeInHindsight</strong> — what actually happened.
              </li>
            </ul>
            <p>
              Phase A of synthesis sees only <Code>narrativeAtTime</Code> + the
              t=0 (1-day) market reaction for each candidate. It cannot see{" "}
              <Code>outcomeInHindsight</Code>, longer-horizon asset moves,{" "}
              <Code>failedTrades</Code>, or per-event{" "}
              <Code>consensusError</Code>. It emits the analogue picks with
              their <em>whyAnalogous</em> reasoning grounded purely in
              point-in-time prose.
            </p>
            <p>
              Phase B fires only after the three picks are locked. It sees the
              full hindsight payload for those three events, and emits the
              cross-analogue <Code>failedTradesPattern</Code>,{" "}
              <Code>consensusError</Code>, and <Code>caveats</Code>. It cannot
              regenerate the analogue list, the headline, or the summary.
            </p>
            <p>
              The <em>structural</em> defence against look-ahead bias is the
              prompt context — what the model is allowed to see — not a verbal
              instruction it could ignore. Embeddings are computed only over
              the point-in-time text, so the cosine-similarity step also
              cannot leak hindsight.
            </p>
          </Section>

          <Section
            label="04"
            title="Numeric paraphrase guard"
          >
            <p>
              Every prose field in the brief is post-processed: digit-runs that
              don't match a tiny whitelist (4-digit years, "S&P 500", "60/40",
              "9/11", "N=…") are scrubbed and replaced with{" "}
              <Code>[…]</Code>. The asset-move table is rendered deterministically
              from the corpus; the LLM never invents percentages, basis points,
              or index levels in narrative text.
            </p>
            <p>
              This closes the failure mode where the model would paraphrase the
              candidate's asset moves into prose ("the S&P fell 18% over six
              weeks") and create stats that don't match the rendered table.
              The guard logs every redaction so we can audit prompt drift.
            </p>
          </Section>

          <Section
            label="05"
            title="Show your work"
          >
            <p>Every brief includes a "show your work" panel that exposes:</p>
            <ul>
              <li>The query interpretation: trigger type, regime tags, surprise factor, the LLM's rationale.</li>
              <li>All retrieved candidates with Jaccard, cosine, RRF combined, and rerank scores. The 3 selected analogues are highlighted.</li>
              <li>The model used for tagging and synthesis, the embedding source (Postgres / sidecar / none), whether rerank ran, and the wall-clock time.</li>
            </ul>
            <p>
              If the system selects a weak analogue, the audit panel lets you
              see why — and which stronger candidate it should have chosen.
              This is the surface that makes intellectual honesty enforceable
              rather than aspirational.
            </p>
          </Section>

          <Section
            label="06"
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
                magnitude. They are <em>not</em> tick-accurate.
              </li>
              <li>
                <strong>Quote provenance.</strong> Most v0.1 failed-trade
                quotes are paraphrases of contemporaneous reporting without
                stable source URLs. We render a "paraphrase" badge next to
                each unverified quote. Going forward, new quotes added to the
                corpus require a <Code>sourceUrl</Code> and ideally a Wayback
                snapshot.
              </li>
              <li>
                <strong>Three-analogue forced fit.</strong> The schema
                requires exactly three analogues. Some queries genuinely
                don't have three good fits in the corpus. The "where this
                might not fit" surface and the disagreement banner are how
                we mitigate; they are imperfect.
              </li>
              <li>
                <strong>Walk-forward integrity.</strong> A unit test asserts
                that retrieval doesn't surface strictly-future events for a
                tag-only query. The synthesis layer also avoids hindsight
                leakage structurally (see section 03), but the retrieval-side
                temporal filter is intentionally informational only — until
                we add a <Code>maxDate</Code> query option, retrieval ignores
                event ordering.
              </li>
            </ul>
            <p>
              If you find a concrete failure, please{" "}
              <a
                href="https://github.com/Al033/OTI/issues"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                open an issue
              </a>
              . The corpus and pipeline are MIT-licensed; better tagging and
              new events are the most useful contributions.
            </p>
          </Section>

          <Section
            label="07"
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

          <Section label="08" title="Verifying the claims">
            <p>
              Every claim above is testable from the repo:
            </p>
            <ul>
              <li>
                <Code>tests/walk-forward.test.ts</Code> — corpus integrity +
                retrieval temporal property.
              </li>
              <li>
                <Code>tests/eval/retrieval.test.ts</Code> + 20-case gold set —
                pinned recall@3 ≥ 0.80 and precision@1 ≥ 0.50.
              </li>
              <li>
                <Code>src/lib/llm.ts</Code> <Code>applyNumericGuard</Code> —
                the digit-run scrubber.
              </li>
              <li>
                <Code>src/lib/prompts.ts</Code> <Code>sanitiseUserQuery</Code>{" "}
                — the prompt-injection input guard.
              </li>
              <li>
                <Code>src/app/api/analyze/stream/route.ts</Code> — the two-
                phase synthesis orchestration with explicit context boundaries.
              </li>
            </ul>
            <p>
              Run <Code>pnpm test</Code> locally, or watch the GitHub Actions
              CI badge in the{" "}
              <Link
                href="https://github.com/Al033/OTI"
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                repo
              </Link>
              .
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
