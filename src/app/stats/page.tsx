import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isDbConfigured, getDb } from "@/lib/db/client";
import { EVENTS, CORPUS_VERSION, EVENT_BY_ID } from "@/lib/events";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stats",
  description:
    "OTI usage metrics — brief volume, top retrieved events, daily-regime archive count.",
};

// Re-render hourly. The numbers are aggregates, not real-time.
export const revalidate = 3600;

interface AggregateStats {
  totalBriefs: number;
  totalDailyBriefs: number;
  earliestBrief: string | null;
  latestBrief: string | null;
  topRetrievedEventIds: Array<{ id: string; count: number }>;
  totalRegimeSnapshots: number;
  earliestSnapshot: string | null;
  latestSnapshot: string | null;
}

async function loadStats(): Promise<AggregateStats | null> {
  if (!isDbConfigured()) return null;
  try {
    const db = getDb();

    const [briefsCount] = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM briefs`,
    );
    const [briefsRange] = await db.execute<{ earliest: string | null; latest: string | null }>(
      sql`SELECT MIN(created_at)::text AS earliest, MAX(created_at)::text AS latest FROM briefs`,
    );
    const [dailyBriefsCount] = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM daily_briefs`,
    );
    const [snapshotsCount] = await db.execute<{ count: number }>(
      sql`SELECT COUNT(*)::int AS count FROM regime_snapshots`,
    );
    const [snapshotsRange] = await db.execute<{ earliest: string | null; latest: string | null }>(
      sql`SELECT MIN(date) AS earliest, MAX(date) AS latest FROM regime_snapshots`,
    );

    // Aggregate eventId frequencies across the JSON candidate arrays in
    // the briefs.payload column. Postgres' jsonb_array_elements pulls
    // individual candidate objects so we can count.
    const topEvents = await db.execute<{ id: string; count: number }>(
      sql`
        SELECT id, COUNT(*)::int AS count
        FROM (
          SELECT jsonb_array_elements(payload->'candidates')->>'eventId' AS id
          FROM briefs
        ) AS expanded
        WHERE id IS NOT NULL
        GROUP BY id
        ORDER BY count DESC
        LIMIT 10
      `,
    );

    return {
      totalBriefs: Number(briefsCount?.count ?? 0),
      totalDailyBriefs: Number(dailyBriefsCount?.count ?? 0),
      earliestBrief: briefsRange?.earliest ?? null,
      latestBrief: briefsRange?.latest ?? null,
      topRetrievedEventIds: [...topEvents].map((r) => ({
        id: r.id,
        count: Number(r.count),
      })),
      totalRegimeSnapshots: Number(snapshotsCount?.count ?? 0),
      earliestSnapshot: snapshotsRange?.earliest ?? null,
      latestSnapshot: snapshotsRange?.latest ?? null,
    };
  } catch (err) {
    console.warn("[stats] DB load failed:", err);
    return null;
  }
}

export default async function StatsPage() {
  const stats = await loadStats();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 md:pt-24">
        <header className="space-y-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Stats
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            What OTI has done so far
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted-foreground)] md:text-lg">
            Aggregate metrics across briefs the LLM has generated and daily-
            regime snapshots the cron has produced. Updated hourly. Per-call
            traces (Langfuse) are private — this is the public summary.
          </p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Corpus"
            primary={`${EVENTS.length}`}
            secondary={`v${CORPUS_VERSION.replace(/^v/, "")}`}
            link="/dataset"
          />
          <StatCard
            label="User briefs"
            primary={stats ? formatNum(stats.totalBriefs) : "—"}
            secondary={
              stats?.earliestBrief && stats?.latestBrief
                ? `${stats.earliestBrief.slice(0, 10)} → ${stats.latestBrief.slice(0, 10)}`
                : "no DB configured"
            }
          />
          <StatCard
            label="Daily briefs"
            primary={stats ? formatNum(stats.totalDailyBriefs) : "—"}
            secondary={`${stats?.totalRegimeSnapshots ?? 0} snapshots`}
            link="/today"
          />
        </section>

        {stats && stats.topRetrievedEventIds.length > 0 && (
          <section className="mt-12 space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Most retrieved events
            </p>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-[var(--color-border-subtle)]">
                  {stats.topRetrievedEventIds.map((row, i) => {
                    const ev = EVENT_BY_ID.get(row.id);
                    return (
                      <li key={row.id} className="flex items-baseline gap-3 px-4 py-3">
                        <span className="mono text-[10px] text-[var(--color-muted-foreground)] w-6">
                          #{i + 1}
                        </span>
                        <Link
                          href={`/dataset#${row.id}`}
                          className="flex-1 text-sm font-medium hover:text-[var(--color-accent)] transition-colors"
                        >
                          {ev?.title ?? row.id}
                        </Link>
                        {ev && (
                          <span className="mono text-[10px] text-[var(--color-muted-foreground)]">
                            {formatDate(ev.date)}
                          </span>
                        )}
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {formatNum(row.count)}×
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mt-12 space-y-3 text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
          <p>
            Trace-level observability is via Langfuse Cloud (when{" "}
            <code className="mono text-[10px]">LANGFUSE_PUBLIC_KEY</code> is set on
            the deployment). Every <code className="mono text-[10px]">generateObject</code>,{" "}
            <code className="mono text-[10px]">streamObject</code>, and{" "}
            <code className="mono text-[10px]">embed</code> call carries a span
            tagged with the pipeline phase (tag-query, synthesis-phase-a,
            stream-synthesis-phase-b, etc.) for filtering in the Langfuse UI.
          </p>
          <p>
            User briefs are deduplicated by the deterministic hash of (query,
            tagModel, synthModel, corpusVersion) — same input gives the same
            permalink. Daily briefs are keyed by date.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

function StatCard({
  label,
  primary,
  secondary,
  link,
}: {
  label: string;
  primary: string;
  secondary?: string;
  link?: string;
}) {
  const inner = (
    <Card className="h-full transition-colors hover:bg-[var(--color-surface-elevated)]/40">
      <CardContent className="p-5 space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {label}
        </p>
        <p className="text-3xl font-semibold tracking-tight">{primary}</p>
        {secondary && (
          <p className="mono text-[11px] text-[var(--color-muted-foreground)]">
            {secondary}
          </p>
        )}
      </CardContent>
    </Card>
  );
  // Cast: stats-card links are dynamic strings (e.g. anchors / hashes)
  // that aren't enumerable as static routes — typed-routes can't verify
  // them at build time.
  return link ? <Link href={link as unknown as never}>{inner}</Link> : inner;
}

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
