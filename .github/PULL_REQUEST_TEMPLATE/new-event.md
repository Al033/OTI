<!-- Thanks for contributing a new event to the OTI corpus. Replace the
TODOs below before submitting. The first 20 high-quality regime cards
merged get a permanent contributor cite + lifetime API access. -->

## Event being added

- **id**: TODO `YYYY-short-slug` (kebab-case, unique)
- **title**: TODO
- **date**: TODO `YYYY-MM-DD`

## Why this event

<!-- 1-2 sentences on what regime archetype this fills. Reference the
existing corpus — what does it sit between or alongside? -->

TODO

## Provenance checklist

- [ ] **Schema validates.** I ran `pnpm validate-event` locally and it
      reports no errors against `schema/historical-event.schema.json`.
- [ ] **`narrativeAtTime` is point-in-time.** No phrases like "as it
      turned out", "in retrospect", "the eventual outcome was". Read it
      out loud as if you don't know what happens next.
- [ ] **`outcomeInHindsight` is dated.** What actually happened — the
      part the LLM is allowed to use ONLY for `consensusError` and
      `failedTradesPattern`.
- [ ] **`assetMoves`** are sourced. Either:
  - [ ] from FRED / Stooq via `pnpm refresh-prices --event=<my-id>`
        (preferred — leaves a "fred" / "stooq" provenance chip on the
        brief), OR
  - [ ] hand-curated from public records, with each non-null number
        sanity-checked against a primary source. (Will display as
        "approx" in the brief; can be upgraded later.)
- [ ] **`failedTrades`** quotes have:
  - [ ] `attribution` — author/publication/date
  - [ ] `sourceUrl` — original publication URL (preferred), OR
  - [ ] `provenance: "paraphrase_no_source"` — explicit acknowledgment
        when the original URL is unrecoverable
- [ ] **`sources`** has at least one verifiable URL.
- [ ] **`regimeTags`** are drawn from the controlled vocabulary in
      `src/lib/regime-tags.ts`. To propose a new tag, open a separate
      PR before this one; tag changes affect all events.
- [ ] **`/research`** essays don't directly cite this event yet, OR I've
      flagged in the description above which essays would benefit from
      a citation update.

## Walk-forward note

- [ ] If this event was added because the gold-set test
      (`tests/eval/gold.ts`) references its id, I have NOT relaxed any
      gold-set thresholds in this PR. The corpus expansion is the fix;
      moving the goalposts isn't.

## How I picked the asset moves

<!-- Either "ran pnpm refresh-prices on date X, FRED-canonical numbers"
or "hand-curated from <source>, sanity-checked vs <other source>".
Asset-move accuracy is the single biggest credibility lever — be
specific. -->

TODO

---

*The OTI corpus is the moat. Thanks for adding to it.*
