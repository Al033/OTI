"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoExampleListItem } from "@/lib/demo-public";

interface ExamplesStripProps {
  examples: ReadonlyArray<DemoExampleListItem>;
  onPick: (id: string) => void;
  disabled?: boolean;
}

export function ExamplesStrip({ examples, onPick, disabled }: ExamplesStripProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
        <Sparkles className="h-3 w-3" />
        <span>Try a precomputed example (no API key required)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex.id}
            onClick={() => !disabled && onPick(ex.id)}
            disabled={disabled}
            className={cn(
              "group relative rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-foreground)] transition-all",
              "hover:border-[var(--color-accent-subtle)] hover:bg-[var(--color-surface-elevated)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
