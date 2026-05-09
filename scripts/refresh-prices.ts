/**
 * Programmatic asset-move refresh.
 *
 *   pnpm refresh-prices                # update data/asset-moves.json
 *   pnpm refresh-prices --event=2008-lehman   # refresh only one event
 *   pnpm refresh-prices --dry-run      # print but don't write
 *
 * Reads each event's date, pulls the corresponding price/yield/spread
 * windows from FRED (primary) or Stooq (fallback for equities), and
 * computes returns at the 1d/5d/1m/3m/6m horizons.
 *
 * Writes a sidecar JSON at data/asset-moves.json that lib/events.ts
 * merges over the hand-curated approximate values at module load time.
 * data/events.ts itself is left untouched — keeps the editorial source
 * of truth in TypeScript while making the canonical numbers verifiable.
 *
 * Provenance is tracked per (event, asset): "fred-canonical" | "stooq-
 * verified" | "approximate" (the original hand-curated value). The UI
 * surfaces this via a small badge on each asset row.
 */

import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { EVENTS } from "../src/lib/events";
import { computeAssetMovesForEvent } from "../src/lib/refresh/compute";
import { ASSET_SOURCES } from "../src/lib/refresh/sources";

const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_EVENT = process.argv
  .find((a) => a.startsWith("--event="))
  ?.slice("--event=".length);

interface EventOverride {
  // eventDate captured for audit; not strictly needed for merge.
  date: string;
  asOf: Record<string, string | null>;
  source: Record<string, "fred" | "stooq" | "missing">;
  series: Record<string, Partial<Record<"d1" | "d5" | "m1" | "m3" | "m6", number | null>>>;
}

interface SidecarShape {
  generatedAt: string;
  generatorVersion: string;
  events: Record<string, EventOverride>;
}

async function main() {
  if (!process.env.FRED_API_KEY) {
    console.warn(
      "[refresh-prices] FRED_API_KEY not set — only Stooq-backed assets will refresh.",
    );
  }

  const events = ONLY_EVENT
    ? EVENTS.filter((e) => e.id === ONLY_EVENT)
    : EVENTS;

  if (events.length === 0) {
    console.error(`[refresh-prices] no events matched (--event=${ONLY_EVENT})`);
    process.exit(1);
  }

  console.log(`[refresh-prices] processing ${events.length} events  dryRun=${DRY_RUN}`);
  console.log(
    `[refresh-prices] sources: ${ASSET_SOURCES.map((s) => s.asset + "=" + (s.fred ?? s.stooq)).join(", ")}`,
  );

  const out: Record<string, EventOverride> = {};
  let processed = 0;
  for (const event of events) {
    processed += 1;
    const tag = `[${processed}/${events.length}]`;
    try {
      const computed = await computeAssetMovesForEvent({ eventDate: event.date });
      const eventOverride: EventOverride = {
        date: event.date,
        asOf: {},
        source: {},
        series: {},
      };
      let totalPoints = 0;
      for (const c of computed) {
        eventOverride.source[c.asset] = c.source;
        eventOverride.asOf[c.asset] = c.asOf;
        eventOverride.series[c.asset] = c.series;
        totalPoints += c.populatedHorizons;
      }
      out[event.id] = eventOverride;
      console.log(
        `${tag} ${event.id} (${event.date}): ${totalPoints} horizon points populated`,
      );
    } catch (err) {
      console.error(`${tag} ${event.id} failed`, err);
    }

    // Polite spacing — FRED is 120 req/min and we use up to 5 series per
    // event; pace at ~250ms per event to stay well below.
    await delay(250);
  }

  if (DRY_RUN) {
    console.log("[refresh-prices] dry-run — not writing sidecar");
    process.exit(0);
  }

  // Merge with existing sidecar so a partial refresh (single event) doesn't
  // wipe other events' entries.
  let existing: SidecarShape | null = null;
  try {
    const path = join(process.cwd(), "data", "asset-moves.json");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = await import("node:fs");
    if (fs.existsSync(path)) {
      existing = JSON.parse(fs.readFileSync(path, "utf8")) as SidecarShape;
    }
  } catch (err) {
    console.warn("[refresh-prices] couldn't read existing sidecar:", err);
  }

  const merged: SidecarShape = {
    generatedAt: new Date().toISOString(),
    generatorVersion: "v0.4",
    events: {
      ...(existing?.events ?? {}),
      ...out,
    },
  };

  const path = join(process.cwd(), "data", "asset-moves.json");
  writeFileSync(path, JSON.stringify(merged, null, 0));
  console.log(`[refresh-prices] wrote ${path}`);
  process.exit(0);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error("[refresh-prices] fatal", err);
  process.exit(1);
});
