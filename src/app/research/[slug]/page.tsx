import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getEssayBySlug, getResearchEssays, markdownToHtml } from "@/lib/research";
import { formatDate } from "@/lib/utils";
import { ResearchShareBar } from "@/components/research-share-bar";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  return getResearchEssays().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssayBySlug(slug);
  if (!essay) return { title: "Essay not found" };
  return {
    title: essay.title,
    description: essay.description,
    openGraph: {
      title: essay.title,
      description: essay.description,
      type: "article",
      publishedTime: essay.publishedAt,
      tags: essay.tags,
      images: [
        {
          url: `/api/og/research/${essay.slug}`,
          width: 1200,
          height: 675,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: essay.title,
      description: essay.description,
      images: [`/api/og/research/${essay.slug}`],
    },
  };
}

export default async function ResearchEssayPage({ params }: PageProps) {
  const { slug } = await params;
  const essay = getEssayBySlug(slug);
  if (!essay) notFound();

  const html = markdownToHtml(essay.body);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-12 pb-24 md:pt-16">
        <div className="mb-8">
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            All research
          </Link>
        </div>

        <header className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="font-mono">
              OTI Research
            </Badge>
            <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
              {formatDate(essay.publishedAt)} · {essay.readingMinutes} min read
            </span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            {essay.title}
          </h1>
          <p className="text-pretty max-w-2xl text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
            {essay.description}
          </p>
          {essay.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {essay.tags.map((t) => (
                <Badge key={t} variant="outline" className="font-mono text-[9px]">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <ResearchShareBar slug={essay.slug} title={essay.title} substackUrl={essay.substackUrl} />

        <article
          className="prose-research"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {essay.substackUrl && (
          <div className="mt-12 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Cross-posted
            </p>
            <a
              href={essay.substackUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Read on Substack
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
