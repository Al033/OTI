import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { DEFAULT_TAG_MODEL } from "./llm";
import { sanitiseUserQuery } from "./prompts";

/**
 * Multi-query expansion. Generates 2-3 paraphrases of a user's event
 * description that emphasise different facets (trigger, regime, asset
 * implication) so retrieval can be RRF-fused across the parallel
 * result lists.
 *
 * Standard +3-5 NDCG-point lift on small expert corpora (the May 2026
 * retrieval-research brief). Cheap: one Haiku call (~50ms, fractions
 * of a cent) plus 2-3 extra embeddings (~$0.0001 total).
 *
 * The original query is always retained as the primary; paraphrases
 * are subordinate signals.
 */

export const ExpansionSchema = z.object({
  paraphrases: z
    .array(z.string().min(8).max(400))
    .min(2)
    .max(3)
    .describe(
      "2-3 paraphrases of the user's event. Each must (a) preserve the structural meaning, (b) emphasise a different facet (e.g. trigger vs regime vs asset implication), (c) be self-contained — no pronouns referring back to the original.",
    ),
});

export type Expansion = z.infer<typeof ExpansionSchema>;

const SYSTEM = `You rewrite a user's market-event description into 2-3 paraphrases that emphasise different facets so a retrieval system can fuse results across them.

Each paraphrase MUST:
  1. Preserve the structural meaning of the original.
  2. Emphasise a different facet — pick from: trigger mechanism, regime context, asset-class implication, time-horizon framing, geopolitical lens.
  3. Be self-contained: no "this", "the above", "as before".
  4. Stay under 400 chars and use macro-market vocabulary precisely.
  5. NOT introduce specific dates, prices, percentages, or named events not in the original — paraphrase, don't extrapolate.

Output exactly 2-3 paraphrases via the schema. No commentary.`;

export async function expandQuery(args: {
  query: string;
  model?: string;
}): Promise<string[]> {
  const cleaned = sanitiseUserQuery(args.query);
  if (cleaned.length < 8) return [];

  const model = args.model ?? DEFAULT_TAG_MODEL;
  try {
    const result = await generateObject({
      model: gateway(model),
      schema: ExpansionSchema,
      system: SYSTEM,
      prompt: `Original event:\n"""\n${cleaned}\n"""\n\nReturn 2-3 paraphrases per the schema.`,
      temperature: 0.5,
    });
    return result.object.paraphrases;
  } catch (err) {
    console.warn("[multi-query] expansion failed, using original only:", err);
    return [];
  }
}

/**
 * Reciprocal-rank fuse multiple ranked lists into a single ordering.
 *
 * RRF (Cormack et al. 2009) is the de facto standard for combining
 * heterogeneous rankings — robust to score-scale drift, parameter-free
 * apart from k.
 *
 *   rrf_score(d) = Σ_l 1 / (k + rank_l(d))
 *
 * with k=60 the canonical default. Items missing from a list contribute
 * 0 from that list — the union of all items across lists is the
 * candidate pool.
 */
export interface RankedList<T> {
  items: T[];
  /** Stable id for each item — RRF aggregates by id, not by reference. */
  idOf: (item: T) => string;
}

export function reciprocalRankFusion<T>(
  lists: RankedList<T>[],
  options: { k?: number; topK?: number } = {},
): T[] {
  const k = options.k ?? 60;
  const scores = new Map<string, { score: number; item: T }>();
  for (const list of lists) {
    for (let rank = 0; rank < list.items.length; rank++) {
      const item = list.items[rank];
      const id = list.idOf(item);
      const inc = 1 / (k + rank + 1);
      const cur = scores.get(id);
      if (cur) cur.score += inc;
      else scores.set(id, { score: inc, item });
    }
  }
  const ranked = [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);
  return options.topK ? ranked.slice(0, options.topK) : ranked;
}
