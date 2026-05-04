import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_EXAMPLE_LIST } from "@/lib/demo-public";

export const metadata: Metadata = {
  title: "Examples",
  description:
    "Six precomputed example briefs. Try OTI without an API key.",
};

export default function ExamplesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-16 pb-24 md:pt-24">
        <header className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Examples
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Six precomputed briefs
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
            These are real outputs from the pipeline, cached so the public
            demo works without API keys. Click any to load it on the home
            page.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {DEMO_EXAMPLE_LIST.map((ex) => (
            <Link
              key={ex.id}
              href={{ pathname: "/", query: { demo: ex.id } }}
              className="group"
            >
              <Card className="h-full transition-colors hover:border-[var(--color-accent-subtle)] hover:bg-[var(--color-surface-elevated)]/40">
                <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                  <div className="space-y-2">
                    <Badge variant="outline">{ex.id}</Badge>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {ex.label}
                    </h2>
                    <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                      "{ex.query}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-accent)]">
                    <span>Open brief</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
