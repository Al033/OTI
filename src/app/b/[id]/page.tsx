import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyzeShell } from "@/components/analyze-shell";
import { EVENTS } from "@/lib/events";
import { getBrief } from "@/lib/brief-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const brief = await getBrief(id);
  if (!brief) {
    return {
      title: "Brief not found",
      description: "This brief has expired or never existed.",
    };
  }
  const title = brief.brief.headline;
  const description = brief.brief.oneLineSummary;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BriefPage({ params }: PageProps) {
  const { id } = await params;
  const brief = await getBrief(id);
  if (!brief) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 md:pt-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-1 text-[11px] text-[var(--color-muted-foreground)]">
          <span>Shared brief — type a new event above to start fresh.</span>
        </div>
        <AnalyzeShell events={EVENTS} initialResult={brief} initialBriefId={id} />
      </main>
      <Footer />
    </>
  );
}
