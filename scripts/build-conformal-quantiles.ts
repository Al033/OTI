/**
 * Build the conformal-quantile sidecar used by the brief UI to render
 * calibrated 80% prediction intervals on top of the empirical N=3 bands.
 *
 *   pnpm conformal             # write data/conformal-quantiles.json
 *   pnpm conformal --alpha=0.1 # tighter target (90% coverage)
 *   pnpm conformal --alpha=0.2 # default 80% coverage
 *   pnpm conformal --kNN=5     # use k=5 neighbours instead of 3
 *
 * Run after corpus changes (event added/removed/edited) — the calibration
 * is corpus-version-bound. The brief UI gracefully falls back to empirical
 * N=3 ranges when the sidecar is missing.
 */

import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { EVENTS, CORPUS_VERSION } from "../src/lib/events";
import {
  buildConformalTable,
  ALL_ASSETS,
  ALL_HORIZONS,
} from "../src/lib/conformal";

const ALPHA = Number(
  process.argv.find((a) => a.startsWith("--alpha="))?.slice(8) ?? 0.2,
);
const KNN = Number(
  process.argv.find((a) => a.startsWith("--kNN="))?.slice(6) ?? 3,
);

async function main() {
  console.log(
    `[conformal] calibrating on ${EVENTS.length} corpus events, alpha=${ALPHA}, kNN=${KNN}`,
  );

  const table = buildConformalTable({
    events: EVENTS,
    alpha: ALPHA,
    kNN: KNN,
  });

  // Print a human-readable summary.
  console.log("\nCalibrated quantiles (1-α coverage half-widths):\n");
  console.log(
    "  asset      d1        d5        m1        m3        m6",
  );
  for (const asset of ALL_ASSETS) {
    const row = ALL_HORIZONS.map((h) => {
      const q = table[asset][h];
      if (!q) return "    n/a  ";
      return `±${q.q.toFixed(1).padStart(6)} `;
    }).join("  ");
    console.log(`  ${asset.padEnd(10)} ${row}`);
  }

  const path = join(process.cwd(), "data", "conformal-quantiles.json");
  writeFileSync(
    path,
    JSON.stringify(
      {
        corpusVersion: CORPUS_VERSION,
        alpha: ALPHA,
        kNN: KNN,
        generatedAt: new Date().toISOString(),
        table,
      },
      null,
      2,
    ),
  );
  console.log(`\n[conformal] wrote ${path}`);
}

main().catch((err) => {
  console.error("[conformal] fatal:", err);
  process.exit(1);
});
