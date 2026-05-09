# Loom screencast scripts

Two versions: 30-second (for X / Bluesky social posts) and 90-second (for the MCP-in-Claude demo on Day 7).

---

## 30-second version — what OTI does

**Setting**: Browser at https://oti.dev. Speaker on camera (small inset, optional). Whisper-clean audio.

**Script** (read out loud, ~85 words = 28 seconds):

> "OTI is an open-source historical-macro-analogue engine for retail
> macro. You type a market event in plain English — say, the May 2026
> Treasury curve. It returns three historical regimes that rhyme with
> it, plus one negative analogue that *looked* similar but went the
> other way. With calibrated 80% intervals on the asset-return bands.
> No price targets. No predictions. Just memory and pattern-recognition.
> It's MIT, it's deployed at oti.dev, and the MCP server is listed
> in the directories so Claude Desktop and Cursor can call it directly."

**Visuals** (track to the spoken cues):

| Time | What's on screen |
|------|------------------|
| 0-3s | OTI home page, logo + tagline |
| 3-7s | Type "May 2026 Treasury curve steepening" into the input box |
| 7-10s | Press Analyse, streaming UI shows headline first |
| 10-15s | Three positive analogue cards stream in (1998 LTCM, 2013 taper, 1994 Greenspan) |
| 15-19s | Negative analogue card appears with the warning-coloured panel |
| 19-23s | Asset-moves table renders with @1m calibrated band column |
| 23-27s | Hover the band, tooltip shows the calibration explanation |
| 27-30s | URL bar pans up to show oti.dev |

**Recording specs**:
- 1080p minimum, 60fps if possible
- Use OBS or Screen Studio if you want the polished zoom-on-cursor effect
- Wireframe / clean desktop in the background — no notification banners
- Audio: external mic. Even a Yeti Nano on USB beats AirPods.

---

## 90-second version — Claude Desktop calling OTI MCP

**When**: Day 7 (Fri May 16), the day after MCP-directory submissions.

**Setup**:
1. Add OTI MCP to your `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "oti": {
      "url": "https://oti.dev/api/mcp",
      "type": "http"
    }
  }
}
```

2. Restart Claude Desktop. Verify "OTI" appears in the tools sidebar.

3. Pre-rehearse: ask Claude "What does the May 2026 macro setup rhyme with?" once before recording so the LLM has its first-call latency out of the way.

**Script** (~250 words = 90 seconds):

> "I'm going to show you OTI's MCP server in Claude Desktop. The OTI
> MCP exposes three tools — search_analogues, get_event, list_events —
> plus a corpus.json Resource that Claude can pin into its working
> context.
>
> [Type:] 'Using the OTI MCP, what does the May 2026 macro setup rhyme
> with? Use the negative-analogue tool to surface the case that almost
> matched but went the other way.'
>
> [Claude responds — wait for the tool calls to appear.]
>
> Watch what happens. Claude calls search_analogues with my framing.
> The OTI server runs the full retrieval pipeline server-side — voyage-
> finance-2 embeddings fused with today's macro state vector, multi-
> query expansion via Haiku, Voyage rerank-2.5 cross-encoder. Comes
> back with three regimes plus one inverted near-miss.
>
> [Claude finishes responding.]
>
> The thing that matters here — Claude is reasoning over a *curated,
> dated, citable* corpus, not its own training data. There's no
> hallucinated 1973 crisis. No invented Lehman moment. The synthesis
> schema constrains eventId at the Zod level — Claude literally cannot
> return events outside the corpus.
>
> This works the same way in Cursor, in any agent built on the
> official MCP SDK, and via the Resources API which lets you pin
> oti://corpus/manifest.json into a session for token-cheap context.
>
> Repo's at github.com/Al033/OTI, MCP manifest at oti.dev/.well-known/mcp,
> open source, MIT. The 39-event corpus is the moat — there's a
> contributor bounty for the next 20 events."

**Visuals**:

| Time | What's on screen |
|------|------------------|
| 0-5s | claude_desktop_config.json showing the OTI entry |
| 5-10s | Claude Desktop tools sidebar, "OTI" listed |
| 10-15s | Type the prompt |
| 15-50s | Claude's reasoning + tool calls streaming in (this is the "wow" moment — the chunky structured response coming back, no fakery) |
| 50-65s | Result rendered — 3 analogues + negative |
| 65-75s | Briefly show the github.com/Al033/OTI repo + README |
| 75-90s | oti.dev/api/mcp self-description in browser |

**Recording specs**: same as above, plus enough screen real estate for both Claude Desktop AND a small browser overlay.

---

## Embedding the demo

Both versions:
- Upload to Loom (free), generate a public link
- Or upload to YouTube (set unlisted) for the lower-friction X embed
- Add to README under "What OTI does" section
- Pin to your Bluesky / X profile so first-time visitors see it

The 30-sec version is the one you embed in the Day 5 Bluesky thread (Post #1). The 90-sec MCP demo is the one you post on Day 7 + reference forever in the README.

---

## What NOT to do

- No music, no titles, no fade-ins. The audience for OTI is engineers + analysts; production polish is *negative* signal here. The credibility is in the screen-real demo, not the cinematography.
- Don't overdub or re-record audio. Live narration over a live demo is the believable thing. If you fluff a word, fluff it — leave it in.
- Don't add captions burned into the video. YouTube/Loom auto-captioning is good enough.
- Don't use a face cam unless you're comfortable on camera. Voice-over with hands-on-keyboard is fine.
