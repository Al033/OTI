/**
 * Compute and store event embeddings.
 *
 *   pnpm embeddings           # populate Postgres if POSTGRES_URL is set
 *   pnpm embeddings --json    # also write a sidecar data/embeddings.json
 *                             # so retrieval can run without Postgres
 *   pnpm embeddings --force   # recompute all events even if already stored
 *
 * Requires AI_GATEWAY_API_KEY (routes to voyage-3-large at 1024d). The
 * embedded text deliberately excludes outcomeInHindsight to keep the
 * retrieval space free of look-ahead leakage at the cosine-similarity step.
 */

import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { embedMany } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../src/lib/db/client";
import { EVENTS } from "../src/lib/events";

const FORCE = process.argv.includes("--force");
const WRITE_JSON = process.argv.includes("--json");
const SKIP_DB = process.argv.includes("--no-db") || !process.env.POSTGRES_URL;
const MODEL = process.env.OTI_EMBEDDING_MODEL ?? "voyage/voyage-4-large";
const DIMENSIONS = Number(process.env.OTI_EMBEDDING_DIMENSIONS ?? 1024);

// IMPORTANT: voyage-4-large produces embeddings in a NEW vector space vs
// voyage-3-large. If you're upgrading from v0.3, you MUST re-embed every
// event with `pnpm embeddings --force`. Within Voyage 4 (large/medium/lite)
// the space is shared, so you can mix tiers without re-embedding.

function buildEmbedText(e: (typeof EVENTS)[number]): string {
  return [
    `Event: ${e.title}`,
    `Date: ${e.date}  Region: ${e.region}  Trigger: ${e.triggerType}`,
    `Tags: ${e.regimeTags.join(", ")}`,
    "",
    `Description: ${e.description}`,
    `Catalyst: ${e.catalyst}`,
    `Narrative at time: ${e.narrativeAtTime}`,
    `Flow patterns: ${e.flowPatterns}`,
    `Lessons: ${e.lessons.join(" ")}`,
  ].join("\n");
}

async function main() {
  console.log(
    `[embed] model=${MODEL} dims=${DIMENSIONS} force=${FORCE} skipDb=${SKIP_DB} writeJson=${WRITE_JSON}`,
  );

  const texts = EVENTS.map(buildEmbedText);
  const ids = EVENTS.map((e) => e.id);

  console.log(`[embed] computing ${EVENTS.length} embeddings in one batch...`);
  const { embeddings } = await embedMany({
    model: gateway.textEmbeddingModel(MODEL),
    values: texts,
    providerOptions: {
      // voyage-specific dims at the Matryoshka 1024 tier
      voyage: { outputDimension: DIMENSIONS },
    },
  });

  if (embeddings.length !== EVENTS.length) {
    throw new Error(
      `[embed] expected ${EVENTS.length} embeddings, got ${embeddings.length}`,
    );
  }
  for (const e of embeddings) {
    if (e.length !== DIMENSIONS) {
      throw new Error(
        `[embed] embedding length ${e.length} != expected ${DIMENSIONS} — ` +
          `check OTI_EMBEDDING_DIMENSIONS and the model's outputDimension support`,
      );
    }
  }

  if (!SKIP_DB) {
    const db = getDb();
    console.log(`[embed] writing to Postgres...`);
    for (let i = 0; i < EVENTS.length; i++) {
      const id = ids[i];
      if (!FORCE) {
        const existing = await db.query.events.findFirst({
          where: eq(schema.events.id, id),
          columns: { embedding: true },
        });
        if (existing?.embedding && existing.embedding.length === DIMENSIONS) {
          console.log(`[embed] skip ${id} (already embedded at ${DIMENSIONS}d)`);
          continue;
        }
      }
      await db
        .update(schema.events)
        .set({ embedding: embeddings[i] })
        .where(eq(schema.events.id, id));
    }
  }

  if (WRITE_JSON || SKIP_DB) {
    const sidecar = {
      model: MODEL,
      dimensions: DIMENSIONS,
      generatedAt: new Date().toISOString(),
      embeddings: Object.fromEntries(ids.map((id, i) => [id, embeddings[i]])),
    };
    const path = join(process.cwd(), "data", "embeddings.json");
    writeFileSync(path, JSON.stringify(sidecar));
    console.log(`[embed] wrote sidecar ${path} (${(JSON.stringify(sidecar).length / 1024).toFixed(0)} KB)`);
  }

  console.log("[embed] done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[embed] failed:", err);
  process.exit(1);
});
