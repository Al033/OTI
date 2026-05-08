/**
 * Compute and store the regime z-vector for every event in the corpus.
 *
 *   pnpm regime:centroids           # populate Postgres if POSTGRES_URL is set
 *   pnpm regime:centroids --json    # also write data/regime-centroids.json sidecar
 *   pnpm regime:centroids --force   # recompute even if already stored
 *
 * Requires FRED_API_KEY for the FRED-backed dims (most of them); Yahoo is
 * used for ^MOVE without a key. Each event date is processed sequentially
 * with a small delay to stay well below FRED's 120 req/min rate limit.
 */

import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../src/lib/db/client";
import { EVENTS } from "../src/lib/events";
import { buildRegimeSnapshot } from "../src/lib/regime/snapshot";
import { REGIME_COMPONENTS } from "../src/lib/regime/vector";

const FORCE = process.argv.includes("--force");
const WRITE_JSON = process.argv.includes("--json");
const SKIP_DB = process.argv.includes("--no-db") || !process.env.POSTGRES_URL;

async function main() {
  console.log(
    `[centroids] processing ${EVENTS.length} events  ` +
      `force=${FORCE} skipDb=${SKIP_DB} writeJson=${WRITE_JSON}`,
  );
  console.log(
    `[centroids] vector dims: ${REGIME_COMPONENTS.map((c) => c.key).join(", ")}`,
  );

  const out: Record<
    string,
    {
      raw: Array<number | null>;
      z: Array<number | null>;
      coverage: number;
    }
  > = {};

  let processed = 0;
  for (const event of EVENTS) {
    processed += 1;
    const tag = `[${processed}/${EVENTS.length}]`;
    try {
      const snap = await buildRegimeSnapshot(event.date);
      const coverage = snap.zVector.filter((v) => v !== null).length;
      out[event.id] = {
        raw: snap.rawVector,
        z: snap.zVector,
        coverage,
      };
      console.log(
        `${tag} ${event.id} (${event.date}): coverage ${coverage}/${snap.zVector.length}`,
      );

      if (!SKIP_DB) {
        const db = getDb();
        if (!FORCE) {
          const existing = await db.query.events.findFirst({
            where: eq(schema.events.id, event.id),
            columns: { regimeZVector: true },
          });
          if (existing?.regimeZVector && existing.regimeZVector.length > 0) {
            console.log(`${tag} ... already stored, skipping (use --force to redo)`);
            continue;
          }
        }
        await db
          .update(schema.events)
          .set({
            regimeRawVector: snap.rawVector,
            regimeZVector: snap.zVector,
          })
          .where(eq(schema.events.id, event.id));
      }
    } catch (err) {
      console.error(`${tag} ${event.id}: failed`, err);
    }

    // Polite spacing between events to stay below FRED's 120 req/min limit
    // even when 8 series each hit it inside buildRegimeSnapshot.
    await delay(200);
  }

  if (WRITE_JSON || SKIP_DB) {
    const path = join(process.cwd(), "data", "regime-centroids.json");
    writeFileSync(
      path,
      JSON.stringify(
        {
          version: "v1",
          dimensions: REGIME_COMPONENTS.map((c) => c.key),
          generatedAt: new Date().toISOString(),
          centroids: out,
        },
        null,
        0,
      ),
    );
    console.log(`[centroids] sidecar written: ${path}`);
  }

  console.log("[centroids] done");
  process.exit(0);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error("[centroids] fatal", err);
  process.exit(1);
});
