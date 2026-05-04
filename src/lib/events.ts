/**
 * Re-export the curated events corpus, validate it against the Zod schema
 * at module load time, and expose helper accessors used throughout the app.
 *
 * Validation runs once on import. If a curator adds a malformed event, the
 * server fails fast in dev and the build breaks in CI — preferable to
 * silent corruption of retrieval results.
 */

import { EVENTS as RAW_EVENTS } from "../../data/events";
import { HistoricalEventSchema, type HistoricalEvent } from "./types";

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

export const EVENTS: HistoricalEvent[] = parsed.data;

export const EVENT_BY_ID: ReadonlyMap<string, HistoricalEvent> = new Map(
  EVENTS.map((e) => [e.id, e]),
);

export const EVENT_IDS = EVENTS.map((e) => e.id) as readonly string[];

export function getEvent(id: string): HistoricalEvent | undefined {
  return EVENT_BY_ID.get(id);
}

export function getEventOrThrow(id: string): HistoricalEvent {
  const event = EVENT_BY_ID.get(id);
  if (!event) throw new Error(`Unknown event id: ${id}`);
  return event;
}
