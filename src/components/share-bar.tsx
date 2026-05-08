"use client";

import * as React from "react";
import { Check, Link2, Printer, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PipelineResult } from "@/lib/types";

interface ShareBarProps {
  result: PipelineResult;
  briefId: string | null;
}

/**
 * Floating action bar above the brief: copy permalink, post to X, print.
 * The permalink is /b/:id; the brief is persisted server-side at request
 * time so the link works even on a fresh tab without re-running the LLM.
 */
export function ShareBar({ result, briefId }: ShareBarProps) {
  const [copied, setCopied] = React.useState(false);

  const url =
    briefId && typeof window !== "undefined"
      ? `${window.location.origin}/b/${briefId}`
      : null;

  function copyLink() {
    if (!url) return;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        toast.success("Link copied");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.error("Couldn't copy link"));
  }

  function tweet() {
    if (!url) return;
    const headline = result.brief.headline;
    const text = `${headline}\n\nvia OTI — historical macro analogues, no prediction`;
    const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  function print() {
    window.print();
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 print:hidden">
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Brief generated
        </span>
        <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
          {(result.durationMs / 1000).toFixed(1)}s · {result.modelSynth}
        </span>
        {result.retrievalAudit?.rerankUsed ? (
          <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
            · reranked
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={copyLink}
          disabled={!url}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={tweet}
          disabled={!url}
        >
          <Twitter className="h-3.5 w-3.5" />
          Post
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={print}
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </Button>
      </div>
    </div>
  );
}
