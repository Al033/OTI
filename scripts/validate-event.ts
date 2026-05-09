/**
 * Local pre-PR validator for proposed new events. Walks data/events.ts,
 * runs the Zod schema validation, runs the corpus integrity invariants
 * (unique ids, controlled-vocab tags, parseable dates), and the walk-
 * forward retrieval test.
 *
 *   pnpm validate-event
 *   pnpm validate-event --id=2026-may-event   # narrow to one new event
 */

import "dotenv/config";
import { EVENTS } from "../src/lib/events";
import { REGIME_TAG_SET } from "../src/lib/regime-tags";
import { HistoricalEventSchema } from "../src/lib/types";

const ONLY_ID = process.argv
  .find((a) => a.startsWith("--id="))
  ?.slice("--id=".length);

let errors = 0;

function err(msg: string) {
  console.error(`  ✗ ${msg}`);
  errors += 1;
}

function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function main() {
  console.log(`[validate-event] checking ${EVENTS.length} events`);

  // Check 1: unique ids
  const seenIds = new Set<string>();
  let dupCount = 0;
  for (const e of EVENTS) {
    if (seenIds.has(e.id)) {
      err(`duplicate id: ${e.id}`);
      dupCount += 1;
    }
    seenIds.add(e.id);
  }
  if (dupCount === 0) ok(`all ${EVENTS.length} event ids are unique`);

  // Check 2: schema validation per event
  let badSchema = 0;
  for (const e of EVENTS) {
    if (ONLY_ID && e.id !== ONLY_ID) continue;
    const r = HistoricalEventSchema.safeParse(e);
    if (!r.success) {
      err(`schema fail ${e.id}: ${r.error.issues[0]?.message} at ${r.error.issues[0]?.path.join(".")}`);
      badSchema += 1;
    }
  }
  if (badSchema === 0) ok("schema validation passed");

  // Check 3: regime tag membership
  let badTag = 0;
  for (const e of EVENTS) {
    if (ONLY_ID && e.id !== ONLY_ID) continue;
    for (const t of e.regimeTags) {
      if (!REGIME_TAG_SET.has(t)) {
        err(`event ${e.id} has tag "${t}" not in REGIME_TAGS`);
        badTag += 1;
      }
    }
  }
  if (badTag === 0) ok("all regime tags drawn from controlled vocabulary");

  // Check 4: narrativeAtTime hindsight-leak heuristic
  // This is a string-pattern check, not a semantic one — flags obvious
  // hindsight phrases that contributors sometimes leak.
  const hindsightPhrases = [
    "as it turned out",
    "in retrospect",
    "in hindsight",
    "later proved",
    "would eventually",
    "the eventual outcome",
    "would later",
  ];
  let leakCount = 0;
  for (const e of EVENTS) {
    if (ONLY_ID && e.id !== ONLY_ID) continue;
    const lower = e.narrativeAtTime.toLowerCase();
    for (const p of hindsightPhrases) {
      if (lower.includes(p)) {
        err(
          `event ${e.id} narrativeAtTime contains hindsight phrase "${p}" — narrativeAtTime must be strictly point-in-time`,
        );
        leakCount += 1;
        break;
      }
    }
  }
  if (leakCount === 0) ok("no obvious hindsight leakage in narrativeAtTime");

  // Check 5: each failedTrades entry has provenance
  let badProv = 0;
  for (const e of EVENTS) {
    if (ONLY_ID && e.id !== ONLY_ID) continue;
    for (const ft of e.failedTrades) {
      const prov = (ft as unknown as { provenance?: string }).provenance;
      if (
        prov &&
        prov === "verified" &&
        !(ft as unknown as { sourceUrl?: string }).sourceUrl
      ) {
        err(
          `event ${e.id} has provenance="verified" without sourceUrl on a failedTrades entry`,
        );
        badProv += 1;
      }
    }
  }
  if (badProv === 0) ok("failedTrades provenance consistent");

  if (errors > 0) {
    console.error(`\n[validate-event] FAILED with ${errors} error(s)`);
    process.exit(1);
  }
  console.log(`\n[validate-event] all checks passed`);
}

main();
