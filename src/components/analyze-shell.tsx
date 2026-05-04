"use client";

import * as React from "react";
import { toast } from "sonner";
import { HeroInput } from "@/components/hero-input";
import { ExamplesStrip } from "@/components/examples-strip";
import { Brief } from "@/components/brief";
import { Loading } from "@/components/loading";
import { DEMO_EXAMPLE_LIST } from "@/lib/demo-public";
import type { HistoricalEvent, PipelineResult } from "@/lib/types";

interface AnalyzeShellProps {
  events: ReadonlyArray<HistoricalEvent>;
  initialResult?: PipelineResult | null;
}

export function AnalyzeShell({ events, initialResult }: AnalyzeShellProps) {
  const eventsMap = React.useMemo(
    () => new Map(events.map((e) => [e.id, e])),
    [events],
  );

  const [result, setResult] = React.useState<PipelineResult | null>(
    initialResult ?? null,
  );
  const [isPending, setIsPending] = React.useState(false);
  const briefRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (result && briefRef.current) {
      briefRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function runAnalysis(args: {
    query?: string;
    demoId?: string;
    tagModel?: string;
    synthModel?: string;
  }) {
    setIsPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed", {
          description: data.message,
        });
        setIsPending(false);
        return;
      }
      setResult(data as PipelineResult);
    } catch (err) {
      toast.error("Network error", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-10">
      <HeroInput
        onSubmit={(args) => runAnalysis(args)}
        isPending={isPending}
      />
      {!result && !isPending && (
        <ExamplesStrip
          examples={DEMO_EXAMPLE_LIST}
          onPick={(id) => runAnalysis({ demoId: id })}
          disabled={isPending}
        />
      )}
      <div ref={briefRef}>
        {isPending && <Loading />}
        {result && <Brief result={result} events={eventsMap} />}
      </div>
    </div>
  );
}
