# OTI Launch Run-of-Show

**v0.6 deployed.** This is the operations playbook for the next 30 days. Every entry below has a clear deliverable + measurable success criterion. Items I (Claude) drafted are in `/docs/launch/`; items you (Alan) execute are flagged **YOU**.

The four anchor days: **Day 4 (Show HN), Day 8 (Substack publish), Day 14 (essay #3), Day 27 (post-mortem)**. The rest is texture.

---

## Day 1 — Saturday, May 10

**Goal**: Get the foundational rails in place (domain, analytics, identity).

| Item | Owner | Done when |
|------|-------|-----------|
| Buy `oti.dev` via Cloudflare Registrar (~$12/yr, free WHOIS privacy) | **YOU** | DNS NS resolves to Cloudflare |
| Add `oti.dev` to Vercel project (Settings → Domains → Add) | **YOU** | SSL certificate provisioned (~3 min after CNAME) |
| Sign up for Plausible — free trial / $9/mo, scope `oti.dev` | **YOU** | Plausible script loaded on `oti.dev` |
| Sign up for PostHog — free tier 1M events/mo | **YOU** | First event captured (any pageview) |
| Create Bluesky account `@oti.dev` (or fallback `@oti-app.bsky.social`); fill bio with permalink | **YOU** | Account live, bio links to `oti.dev` |
| Create X account `@OTI_macro` if available (or `@OTIanalogues`); URL in bio (no posts yet) | **YOU** | Account live |
| Create Substack `oti.substack.com`, basic profile, link from bio | **YOU** | Publication created, no posts yet |

Time budget: ~90 minutes total. Most is account creation.

---

## Day 2 — Sunday, May 11

**Goal**: Draft the narrative essay #2 (the launch artifact).

Already done by Claude — see `/content/research/2026-05-09-treasury-curve-1998.md` (the Citrini-pattern W4 essay). Read it through, edit anything that doesn't sound like you.

If you want a *different* topic for the launch, the alternate essay scaffold is at `/docs/launch/essay-alt-may-2026-credit-disconnect.md` — same Citrini-pattern, different thesis.

| Item | Owner | Done when |
|------|-------|-----------|
| Read the W4 Treasury-curve essay; mark anything that's not in your voice | **YOU** | Markdown file annotated (or accepted as-is) |
| Tweak any factual claim that's stale by Sunday May 11 (curve levels, Fed pricing, oil) | **YOU** | Numbers updated against current FRED prints |

---

## Day 3 — Monday, May 12

**Goal**: Polish + record assets for the Show HN.

| Item | Owner | Done when |
|------|-------|-----------|
| Record 30-90sec demo screencast (script at `/docs/launch/04-loom-script.md`) | **YOU** | Loom URL or MP4 in `/docs/launch/recordings/` |
| Architecture diagram — already in `/README.md` | done | — |
| Final pass on essay; ship to Substack as a draft (not published) | **YOU** | Substack draft saved |

---

## Day 4 — **Tuesday, May 13 — Show HN**

**Goal**: HN front page in the first 6 hours.

| Item | Owner | Done when |
|------|-------|-----------|
| **Submit at exactly 08:30 ET (12:30 UTC)** — peak HN morning window | **YOU** | Post is live |
| Title (verbatim): use what's in `/docs/launch/01-show-hn.md` | **YOU** | — |
| Body: paste verbatim from `/docs/launch/01-show-hn.md` | **YOU** | — |
| First comment by you within 60s of post going live: see template | **YOU** | First comment posted |
| Pre-arrange 2-3 friends to upvote in the first 10 minutes (NOT vote-rings — they comment substantively) | **YOU** | 3 confirmations from friends pre-Tuesday |
| Be at your laptop replying to every comment for the first 4 hours | **YOU** | All comments replied |

Success criterion: 50+ upvotes in 6h, top-30 placement on /show. 100+ stars on the GitHub repo by EOD Wednesday.

---

## Day 5 — Wednesday, May 14

**Goal**: Cross-post HN traffic.

| Item | Owner | Done when |
|------|-------|-----------|
| Bluesky thread (8 posts, no URL — link in bio): `/docs/launch/02-bluesky-thread.md` | **YOU** | Thread live |
| Join 2 Bluesky starter packs: "Investment & Financial Media" + "Macro" | **YOU** | Listed in both |
| X thread (no URL — link in bio): same content as Bluesky, condensed to 280-char posts | **YOU** | Thread live |

---

## Day 6 — Thursday, May 15

**Goal**: MCP directories — claim the macro-analogue lane before someone else does.

| Item | Owner | Done when |
|------|-------|-----------|
| Run `pnpm mcp:submission-pack` (already done in v0.5; output at `/out/mcp-submission/`) | done | — |
| Submit to Glama at https://glama.ai/mcp/servers (auto-indexes from GitHub; verify live) | **YOU** | Listing visible |
| Submit to Smithery: `npx -y @smithery/cli publish` from repo root | **YOU** | Smithery listing visible |
| Submit to mcp.so via the form, use `oti.dev/.well-known/mcp` as the manifest URL | **YOU** | mcp.so listing visible |
| Submit to PulseMCP (auto-indexes; verify) | **YOU** | Listed |
| PR to modelcontextprotocol/servers — add OTI under "Community Servers" | **YOU** | PR open |
| PR to punkpeye/awesome-mcp-servers — requires Glama A-rating; may need to wait 1-2 days | **YOU** | PR open or queued |
| Submit Anthropic Desktop Extension form at anthropic.com/desktop-extensions | **YOU** | Application submitted |

---

## Day 7 — Friday, May 16

**Goal**: 90-second Loom demo of Claude Code calling OTI MCP. Post on X + Bluesky.

| Item | Owner | Done when |
|------|-------|-----------|
| Connect OTI MCP to Claude Desktop locally (claude_desktop_config.json snippet in README) | **YOU** | "OTI" appears in Claude Desktop tools |
| Record 90sec Loom: ask Claude "what does May 2026 macro rhyme with?" — Claude calls OTI's search_analogues tool live | **YOU** | Loom URL ready |
| Post to X (no URL): "Just shipped OTI's MCP server. Watch Claude pull historical analogues live →" + Loom embed | **YOU** | Post live |
| Same on Bluesky | **YOU** | Post live |

---

## Day 8 — Saturday, May 17 — **Substack publish**

**Goal**: First Substack post (the W4 Treasury-curve essay).

| Item | Owner | Done when |
|------|-------|-----------|
| Open `/content/research/2026-05-09-treasury-curve-1998.md`, copy the markdown body (everything below the frontmatter) | **YOU** | Body in clipboard |
| New post on Substack, paste; Substack auto-converts markdown | **YOU** | Draft renders correctly |
| Hit publish | **YOU** | Live URL |
| Update the markdown frontmatter `substackUrl:` field with the new live URL | **YOU** | Repo PR + push |
| Cross-post to /r/SecurityAnalysis (read the rules — link to Substack, not the tool) | **YOU** | Reddit post live |
| Cross-post to /r/macroeconomics with the same framing | **YOU** | Reddit post live |

---

## Days 9-13 — May 18-22 — Substack Recommendations flywheel

The 7-target list (warmest first): **Concoda · Apricitas · fx:macro · Macro Notes · Capital Flows Research · Stay-At-Home Macro · FXMacroGuy**.

The 3-7 rule: 7-10 days of warmup BEFORE any DM.

| Day | Task |
|-----|------|
| Day 9 (Sun May 18) | Restack one piece from each of the 7 with a substantive note (≥30 words). Not "great read" — your specific take. |
| Day 10 (Mon May 19) | Comment substantively on 3 separate posts of each of the 7 (21 comments total). |
| Day 11 (Tue May 20) | Add all 7 to OTI's Substack Recommendations. **No DM yet.** |
| Day 12 (Wed May 21) | DM 3 of 7 (Concoda, Macro Notes, fx:macro — the methodologically-aligned ones). Use the template at `/docs/launch/03-dm-templates.md`. |
| Day 13 (Thu May 22) | DM the other 4. |

Success criterion: 3+ reciprocations within a week.

---

## Day 14 — Friday, May 23 — **Essay #3**

Already drafted by Claude — see `/content/research/2026-05-23-five-things-the-engine-sees.md`. Pre-brief 3 macro newsletter writers 48h before publish (use the briefing template in `/docs/launch/03-dm-templates.md`).

| Item | Owner | Done when |
|------|-------|-----------|
| Pre-brief 3 macro Substack writers Wed May 21 | **YOU** | 3 emails sent |
| Polish essay #3 against May 22 data prints | **YOU** | Numbers current |
| Publish on Substack 09:00 ET Friday May 23 | **YOU** | Live |
| Cross-post Reddit + X + Bluesky | **YOU** | All live |

---

## Days 15-21 — May 24-30

Texture week. Specific moves below.

| Day | Task |
|-----|------|
| Day 15 (Sat May 24) | Build "OTI Public" Bluesky starter pack curating macro analyst handles |
| Day 16 (Sun May 25) | Audit week 1-2 PostHog metrics: which queries actually run? Iterate corpus toward gaps. Spawn corpus-expansion PRs. |
| Day 17 (Mon May 26) | Pitch 3 mid-tier macro Substacks for guest essay slot |
| Day 18 (Tue May 27) | Indie Hackers launch-recap with real numbers |
| Day 19 (Wed May 28) | "OTI in Cursor" 60sec demo + post to r/Cursor |
| Day 20 (Thu May 29) | Reply to every comment from week 1-2; warm cold DMs that didn't convert |
| Day 21 (Fri May 30) | Pitch Forward Guidance / Macro Voices / Odd Lots stringer (template in DMs file) |

---

## Days 22-30 — May 31 to June 8

Final stretch.

| Day | Task |
|-----|------|
| Day 22 (Sat May 31) | Essay #4: corpus expansion thesis. Open the 20-event bounty publicly. |
| Day 23 (Sun Jun 1) | Reddit AMA on /r/quant or /r/algotrading |
| Day 24 (Mon Jun 2) | Follow-up the 3 Recommendations partners who haven't reciprocated; offer co-branded essay |
| Day 25 (Tue Jun 3) | Ship a small visible feature (e.g. `/embed` widget). Tweet it. |
| Day 26 (Wed Jun 4) | Submit OTI to Anthropic awesome-mcp PR; tweet at @AnthropicAI devrel |
| Day 27 (Thu Jun 5) | **30-day post-mortem essay** with real numbers (zero is real). Template at `/docs/launch/05-postmortem-template.md` |
| Day 28 (Fri Jun 6) | Cross-post post-mortem to dev.to, Indie Hackers, HN as Show HN follow-up |
| Day 29 (Sat Jun 7) | Pick the highest-leverage channel from 30-day data; double down for week 5-6 |
| Day 30 (Sun Jun 8) | 30-day metrics report at `oti.dev/stats`. Set 60-day targets. |

---

## Targets

**Day 30 success benchmarks** (median indie macro launch hits ~60% of these):

- 150 GitHub stars
- 100 Substack subscribers
- 50 Bluesky followers
- 1k Vercel uniques (rolling 7-day)
- 20 MCP installs detected via tool-call traces
- 1 podcast pitch in flight
- 3 active Substack Recommendations partners
- 1 tier-1 macro publication citation (Apricitas / Macro Hive / Bloomberg / FT mention)

**Stretch (top-decile launch)**: 2k stars, 1k subs, 1 podcast aired, 1 institutional buyside DM (a real macro fund analyst saying "we use this").

---

## Materials index

```
/docs/launch/
  00-run-of-show.md            — this file
  01-show-hn.md                — title, body, first-comment template, pre-flight checklist
  02-bluesky-thread.md         — 8-post thread script (works for X too)
  03-dm-templates.md           — Substack Recommendations cold-DM, podcast-pitch, pre-brief templates
  04-loom-script.md            — 30-second + 90-second screencast scripts
  05-postmortem-template.md    — Day-27 post-mortem skeleton
  06-essay-3-scaffold.md       — Essay #3 outline ("5 things the engine sees")
```

If anything in the calendar slips, the four anchor days are non-negotiable: **Day 4 Show HN · Day 8 Substack · Day 14 Essay #3 · Day 27 Post-mortem**. Everything else can shift.
