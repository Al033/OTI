"use client";

import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProviderSelect } from "@/components/provider-select";
import { cn } from "@/lib/utils";

interface HeroInputProps {
  onSubmit: (args: { query: string; tagModel?: string; synthModel?: string }) => void;
  isPending: boolean;
  defaultValue?: string;
  className?: string;
}

const PLACEHOLDER_LINES = [
  'e.g. "Trump announces 25% tariffs on EU autos"',
  'e.g. "Fed surprises with a 50bp emergency cut"',
  'e.g. "10y UST yields spike to 5%"',
  'e.g. "China devalues the yuan by 3%"',
  'e.g. "BoJ ends YCC and hikes 25bps"',
];

export function HeroInput({ onSubmit, isPending, defaultValue, className }: HeroInputProps) {
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [synthModel, setSynthModel] = React.useState<string>(
    "anthropic/claude-sonnet-4-6",
  );
  const [tagModel] = React.useState<string>("anthropic/claude-haiku-4-5");
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0);

  React.useEffect(() => {
    if (value || isPending) return;
    const t = setInterval(
      () => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_LINES.length),
      3500,
    );
    return () => clearInterval(t);
  }, [value, isPending]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed.length < 8 || isPending) return;
    onSubmit({ query: trimmed, tagModel, synthModel });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-elevation)] transition-all",
          "focus-within:border-[var(--color-accent-subtle)] focus-within:ring-1 focus-within:ring-[var(--color-accent-subtle)]",
        )}
      >
        <div className="flex items-start gap-2 px-4 pt-4">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_LINES[placeholderIdx]}
            disabled={isPending}
            rows={3}
            className="text-xl leading-snug font-medium tracking-tight"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-3 py-2">
          <div className="flex items-center gap-2">
            <ProviderSelect value={synthModel} onChange={setSynthModel} disabled={isPending} />
            <span className="text-[10px] text-[var(--color-muted-foreground)] hidden sm:inline">
              Press <kbd className="mono px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">↵</kbd> to analyse
            </span>
          </div>
          <Button
            variant="accent"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || value.trim().length < 8}
            className="gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analysing
              </>
            ) : (
              <>
                Analyse <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
