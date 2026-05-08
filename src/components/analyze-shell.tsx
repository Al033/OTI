"use client";

import * as React from "react";
import { toast } from "sonner";
import { HeroInput } from "@/components/hero-input";
import { ExamplesStrip } from "@/components/examples-strip";
import { Brief } from "@/components/brief";
import { ShareBar } from "@/components/share-bar";
import {
  StreamingBrief,
  type StreamingState,
} from "@/components/streaming-brief";
import { DEMO_EXAMPLE_LIST } from "@/lib/demo-public";
import { readNdjsonStream } from "@/lib/stream-client";
import type { HistoricalEvent, PipelineResult } from "@/lib/types";

interface AnalyzeShellProps {
  events: ReadonlyArray<HistoricalEvent>;
  initialResult?: PipelineResult | null;
  /** Provided when rendered inside /b/:id (read-only deep-link page). */
  initialBriefId?: string | null;
}

export function AnalyzeShell({
  events,
  initialResult,
  initialBriefId,
}: AnalyzeShellProps) {
  const eventsMap = React.useMemo(
    () => new Map(events.map((e) => [e.id, e])),
    [events],
  );

  const [state, setState] = React.useState<StreamingState>(
    initialResult
      ? { phase: "complete", result: initialResult, briefId: initialBriefId ?? undefined }
      : { phase: "idle" },
  );
  const briefRef = React.useRef<HTMLDivElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if ((state.phase === "complete" || state.phase !== "idle") && briefRef.current) {
      briefRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.phase]);

  async function runStream(args: { query: string; tagModel?: string; synthModel?: string }) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState({ phase: "started" });
    try {
      const res = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: ac.signal,
      });
      if (!res.ok && res.headers.get("content-type")?.includes("application/x-ndjson")) {
        // The error body itself is NDJSON — fall through to the parser.
      } else if (!res.ok) {
        const text = await res.text();
        toast.error("Analysis failed", { description: text.slice(0, 200) });
        setState({ phase: "error", errorCode: "http_error" });
        return;
      }

      let phase: StreamingState["phase"] = "tagging";
      const next: StreamingState = { phase };

      for await (const ev of readNdjsonStream(res, ac.signal)) {
        switch (ev.kind) {
          case "started": {
            next.phase = phase = "tagging";
            setState({ ...next });
            break;
          }
          case "queryTags": {
            next.queryTags = ev.queryTags as StreamingState["queryTags"];
            next.phase = phase = "retrieving";
            setState({ ...next });
            break;
          }
          case "candidates": {
            next.candidates = ev.candidates as StreamingState["candidates"];
            next.retrievalAudit = ev.retrievalAudit as StreamingState["retrievalAudit"];
            next.phase = phase = "synthesisA";
            setState({ ...next });
            break;
          }
          case "phaseA": {
            next.phaseA = ev.partial as StreamingState["phaseA"];
            setState({ ...next });
            break;
          }
          case "phaseAFinal": {
            next.phaseA = ev.data as StreamingState["phaseA"];
            next.phase = phase = "synthesisB";
            setState({ ...next });
            break;
          }
          case "phaseB": {
            next.phaseB = ev.partial as StreamingState["phaseB"];
            setState({ ...next });
            break;
          }
          case "phaseBFinal": {
            next.phaseB = ev.data as StreamingState["phaseB"];
            setState({ ...next });
            break;
          }
          case "complete": {
            next.result = ev.result as PipelineResult;
            next.briefId = ev.briefId as string;
            next.phase = phase = "complete";
            setState({ ...next });
            break;
          }
          case "error": {
            next.errorCode = ev.code as string;
            next.phase = phase = "error";
            setState({ ...next });
            const code = (ev.code as string) ?? "unknown";
            toast.error(humanError(code), {
              description: ev.resetSeconds
                ? `Try again in ${ev.resetSeconds}s.`
                : undefined,
            });
            break;
          }
        }
      }
    } catch (err) {
      if (ac.signal.aborted) return;
      console.error(err);
      toast.error("Network error", {
        description: err instanceof Error ? err.message : String(err),
      });
      setState({ phase: "error", errorCode: "network_error" });
    }
  }

  async function runDemo(demoId: string) {
    abortRef.current?.abort();
    setState({ phase: "started" });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Demo load failed", { description: data.hint ?? data.error });
        setState({ phase: "error", errorCode: data.error });
        return;
      }
      setState({ phase: "complete", result: data as PipelineResult });
    } catch (err) {
      toast.error("Network error", {
        description: err instanceof Error ? err.message : String(err),
      });
      setState({ phase: "error", errorCode: "network_error" });
    }
  }

  return (
    <div className="space-y-10">
      <HeroInput
        onSubmit={(args) => runStream(args)}
        isPending={state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error"}
      />
      {state.phase === "idle" && (
        <ExamplesStrip
          examples={DEMO_EXAMPLE_LIST}
          onPick={(id) => runDemo(id)}
          disabled={false}
        />
      )}
      <div ref={briefRef}>
        {state.phase !== "idle" && state.phase !== "complete" ? (
          <StreamingBrief state={state} events={eventsMap} />
        ) : null}
        {state.phase === "complete" && state.result ? (
          <>
            <ShareBar result={state.result} briefId={state.briefId ?? null} />
            <Brief result={state.result} events={eventsMap} />
          </>
        ) : null}
      </div>
    </div>
  );
}

function humanError(code: string): string {
  switch (code) {
    case "rate_limited":
      return "You're going a little fast — slow down for a moment.";
    case "bot_detected":
      return "This client looks automated — use /api/events for programmatic access.";
    case "no_provider_configured":
      return "No AI provider configured on the server.";
    case "too_few_candidates":
      return "Not enough analogues for this region/tags. Try GLOBAL or different terms.";
    case "tag_model_not_allowed":
    case "synth_model_not_allowed":
      return "That model isn't on the allowlist.";
    case "query_too_short_after_sanitisation":
      return "Query was reduced to too few characters after sanitisation.";
    default:
      return "Analysis failed.";
  }
}
