import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { getResearchEssays } from "@/lib/research";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Research",
  description:
    "OTI's research notes — methodology essays, regime-rhyme thought experiments, and the open archive of every reverse-Show-HN piece. Memory, not prediction.",
};

export const revalidate = 3600; // hourly — content lives in /content/research as markdown

export default function ResearchIndex() {
  const essays = getResearchEssays();
  const featured = essays.find((e) => e.featured);
  const rest = essays.filter((e) => e !== featured);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-16 pb-24 md:pt-24">
        <header className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Research
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Memory at length.
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
            Long-form essays where the OTI engine is the supporting evidence,
            not the headline. Every post lives at a stable URL here and is
            cross-published on{" "}
            <a
              href="https://oti.substack.com"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              oti.substack.com
            </a>{" "}
            for distribution. Markdown source is in{" "}
            <Link href="https://github.com/Al033/OTI/tree/main/content/research" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              /content/research
            </Link>{" "}
            — diff-able, citable, contributable.
          </p>
        </header>

        {featured && <FeaturedCard essay={featured} />}

        {rest.length > 0 && (
          <section className="mt-16 space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Archive
            </p>
            <ul className="space-y-3">
              {rest.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/research/${e.slug}`}
                    className="block rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-elevated)]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="font-semibold tracking-tight">{e.title}</span>
                      <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                        {formatDate(e.publishedAt)} · {e.readingMinutes} min
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                      {e.description}
                    </p>
                    {e.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {e.tags.map((t) => (
                          <Badge key={t} variant="outline" className="font-mono text-[9px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function FeaturedCard({
  essay,
}: {
  essay: ReturnType<typeof getResearchEssays>[number];
}) {
  return (
    <section className="mt-12">
      <Link href={`/research/${essay.slug}`} className="group block">
        <Card className="border-[var(--color-accent-subtle)]/60 transition-colors hover:bg-[var(--color-surface-elevated)]/40">
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="font-mono">
                Featured
              </Badge>
              <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                {formatDate(essay.publishedAt)} · {essay.readingMinutes} min read
              </span>
            </div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              {essay.title}
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-[var(--color-muted-foreground)] md:text-base">
              {essay.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--color-accent)]">
              Read the essay
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </section>
  );
}
