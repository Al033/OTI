import { Card, CardContent, CardHeader } from "@/components/ui/card";

const STEPS = [
  "Tagging your event",
  "Computing Jaccard scores across 30 events",
  "Selecting top candidates",
  "Synthesising the brief",
];

export function Loading() {
  return (
    <div className="space-y-12 fade-up">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    animationDelay: `${i * 200}ms`,
                  }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div className="h-9 w-2/3 rounded-md bg-[var(--color-surface-elevated)] shimmer" />
        <div className="h-5 w-1/2 rounded-md bg-[var(--color-surface-elevated)] shimmer" />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="h-3 w-16 rounded bg-[var(--color-surface-elevated)] shimmer" />
              <div className="h-5 w-3/4 rounded bg-[var(--color-surface-elevated)] shimmer" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-12 rounded bg-[var(--color-surface-elevated)] shimmer" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-[var(--color-surface-elevated)] shimmer" />
                <div className="h-3 w-4/5 rounded bg-[var(--color-surface-elevated)] shimmer" />
                <div className="h-3 w-2/3 rounded bg-[var(--color-surface-elevated)] shimmer" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
