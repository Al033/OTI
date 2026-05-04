/**
 * Compute and store event embeddings.
 *
 *   pnpm embeddings
 *
 * Requires AI_GATEWAY_API_KEY (or OPENAI_API_KEY for direct provider) and
 * POSTGRES_URL. Run `pnpm seed` first. Skips events that already have an
 * embedding stored unless --force is passed.
 *
 * The embedded text deliberately excludes outcomeInHindsight to keep the
 * retrieval space free of look-ahead leakage at the cosine-similarity step.
 */

import "dotenv/config";
import { embed } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../src/lib/db/client";
import { EVENTS } from "../src/lib/events";

const FORCE = process.argv.includes("--force");
const MODEL = process.env.OTI_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";

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
  const db = getDb();
  console.log(`[embed] using model: ${MODEL}  force=${FORCE}`);

  for (const e of EVENTS) {
    if (!FORCE) {
      const existing = await db.query.events.findFirst({
        where: eq(schema.events.id, e.id),
        columns: { embedding: true },
      });
      if (existing?.embedding) {
        console.log(`[embed] skip ${e.id} (already embedded)`);
        continue;
      }
    }

    const text = buildEmbedText(e);
    console.log(`[embed] ${e.id}  (${text.length} chars)`);
    const { embedding } = await embed({
      model: gateway.textEmbeddingModel(MODEL),
      value: text,
    });
    await db
      .update(schema.events)
      .set({ embedding })
      .where(eq(schema.events.id, e.id));
  }

  console.log("[embed] done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[embed] failed:", err);
  process.exit(1);
});
