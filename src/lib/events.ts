/**
 * Re-export the curated events corpus, validate it against the Zod schema
 * at module load time, and expose helper accessors used throughout the app.
 *
 * Validation runs once on import. If a curator adds a malformed event, the
 * server fails fast in dev and the build breaks in CI — preferable to
 * silent corruption of retrieval results.
 */

import { EVENTS as RAW_EVENTS } from "../../data/events";
import { TRAJECTORIES } from "../../data/trajectories";
import { HistoricalEventSchema, type HistoricalEvent } from "./types";
import {
  applyAssetMovesSidecar,
  type AssetMoveProvenance,
} from "./asset-moves-sidecar";
import type { Asset } from "./refresh/sources";

const EventArraySchema = HistoricalEventSchema.array().min(1);

const parsed = EventArraySchema.safeParse(RAW_EVENTS);
if (!parsed.success) {
  // Surface the first error verbosely; events.ts is hand-curated and a typo
  // here is the most likely cause of pipeline weirdness, so make it loud.
  const issue = parsed.error.issues[0];
  const path = issue?.path.join(".");
  throw new Error(
    `[OTI] Events corpus failed validation at ${path}: ${issue?.message}\n` +
      `Fix data/events.ts and reload.`,
  );
}

// Apply asset-moves sidecar (FRED/Stooq-canonical numbers from
// `pnpm refresh-prices`) AND the analyticalTrajectory sidecar (ARISE
// pattern from data/trajectories.ts). When sidecars are missing, the
// hand-curated approximate values stay in place and the trajectory
// field is undefined.
const merged = parsed.data.map((e) => {
  const { assetMoves, provenance, asOf } = applyAssetMovesSidecar(
    e as unknown as { id: string; assetMoves: Record<Asset, Record<string, number | null>> },
  );
  const trajectory = TRAJECTORIES[e.id];
  return Object.assign({}, e, {
    assetMoves: assetMoves as HistoricalEvent["assetMoves"],
    assetMovesProvenance: provenance,
    assetMovesAsOf: asOf,
    ...(trajectory ? { analyticalTrajectory: trajectory } : {}),
  });
});

export const EVENTS = merged as Array<
  HistoricalEvent & {
    assetMovesProvenance: Record<Asset, AssetMoveProvenance>;
    assetMovesAsOf: Record<Asset, string | null>;
  }
>;

export const EVENT_BY_ID: ReadonlyMap<string, HistoricalEvent> = new Map(
  EVENTS.map((e) => [e.id, e]),
);

export const EVENT_IDS = EVENTS.map((e) => e.id) as readonly string[];

/**
 * Stable hash of the corpus identity (count + concatenated ids + earliest/latest
 * dates). Bumps any time the corpus changes; used as a cache-key component
 * for shareable brief permalinks.
 */
export const CORPUS_VERSION: string = (() => {
  const sorted = [...EVENTS].sort((a, b) => (a.id < b.id ? -1 : 1));
  const seed = `${sorted.length}|${sorted.map((e) => e.id).join(",")}|${
    sorted[0]?.date ?? ""
  }|${sorted[sorted.length - 1]?.date ?? ""}`;
  // FNV-1a 32-bit, hex.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `v1.${(h >>> 0).toString(16)}`;
})();

export function getEvent(id: string): HistoricalEvent | undefined {
  return EVENT_BY_ID.get(id);
}

export function getEventOrThrow(id: string): HistoricalEvent {
  const event = EVENT_BY_ID.get(id);
  if (!event) throw new Error(`Unknown event id: ${id}`);
  return event;
}
