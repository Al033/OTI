import { test } from "node:test";
import assert from "node:assert/strict";
import { GOLD_CASES } from "./gold";
import { retrieveSync } from "@/lib/retrieval";

/**
 * Retrieval-quality eval. Pinned thresholds:
 *
 *   - recall@3 across the gold set ≥ 0.80  (mustContain hits)
 *   - precision@1 across the gold set     ≥ 0.50  (top-1 is in mustContain ∪ niceToHave)
 *
 * Adjust the thresholds DOWNWARD only with a comment explaining why.
 * Adjust UPWARD freely as the corpus and retrieval improve.
 *
 * To regenerate per-case scores for inspection:
 *   pnpm tsx tests/eval/retrieval.test.ts --report
 */

const RECALL_AT_3_FLOOR = 0.8;
const PRECISION_AT_1_FLOOR = 0.5;

test("retrieval gold set: recall@3 ≥ 0.80 across must-contain events", () => {
  const perCase: Array<{ id: string; recall3: number; expected: number; got: number }> = [];

  for (const c of GOLD_CASES) {
    const top3 = retrieveSync(c.queryTags, { topK: 3 });
    const top3Ids = new Set(top3.map((r) => r.eventId));
    const hits = c.mustContain.filter((id) => top3Ids.has(id)).length;
    const expected = c.mustContain.length;
    perCase.push({
      id: c.id,
      recall3: expected === 0 ? 1 : hits / expected,
      expected,
      got: hits,
    });
  }

  const macroRecall =
    perCase.reduce((acc, c) => acc + c.recall3, 0) / perCase.length;

  if (process.argv.includes("--report") || macroRecall < RECALL_AT_3_FLOOR) {
    console.log("\n[eval] per-case recall@3:");
    for (const c of perCase) {
      console.log(
        `  ${c.recall3.toFixed(2)}  ${c.id.padEnd(28)} (${c.got}/${c.expected})`,
      );
    }
    console.log(`[eval] macro recall@3: ${macroRecall.toFixed(3)}`);
  }

  assert.ok(
    macroRecall >= RECALL_AT_3_FLOOR,
    `recall@3 = ${macroRecall.toFixed(3)} below floor ${RECALL_AT_3_FLOOR}`,
  );
});

test("retrieval gold set: precision@1 ≥ 0.50 across must-contain ∪ nice-to-have", () => {
  let p1Hits = 0;
  for (const c of GOLD_CASES) {
    const top = retrieveSync(c.queryTags, { topK: 1 });
    if (top.length === 0) continue;
    const acceptable = new Set([...c.mustContain, ...c.niceToHave]);
    if (acceptable.has(top[0].eventId)) p1Hits++;
  }
  const p1 = p1Hits / GOLD_CASES.length;
  assert.ok(
    p1 >= PRECISION_AT_1_FLOOR,
    `precision@1 = ${p1.toFixed(3)} below floor ${PRECISION_AT_1_FLOOR}`,
  );
});

test("retrieval gold set: every gold eventId exists in the corpus", async () => {
  const { EVENT_BY_ID } = await import("@/lib/events");
  for (const c of GOLD_CASES) {
    for (const id of [...c.mustContain, ...c.niceToHave]) {
      assert.ok(
        EVENT_BY_ID.has(id),
        `gold case ${c.id} references unknown event ${id}`,
      );
    }
  }
});
