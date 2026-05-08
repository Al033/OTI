import { ImageResponse } from "next/og";
import { getDailyBrief, getMatches } from "@/lib/regime/store";
import { EVENT_BY_ID } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ date: string }>;
}

const WIDTH = 1200;
const HEIGHT = 675;

const BG = "#0a0a0a";
const FG = "#fafafa";
const MUTED = "#999999";
const ACCENT = "#5a8dff"; // klein-ish, matches the in-app accent OKLCH(0.74 0.16 263)

/**
 * Server-rendered Open Graph card per daily brief. Pure SVG/HTML rendered
 * via Next.js's edge-compatible <ImageResponse>. 1200×675 — the
 * X-optimised aspect — with the OTI register: black bg, single accent,
 * no decorative chrome.
 *
 * The card is the "billboard" — what shows up when the URL is shared on
 * X / Bluesky / Substack / Slack.
 */
export async function GET(_req: Request, ctx: RouteParams) {
  const { date } = await ctx.params;
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const brief = isValid ? await getDailyBrief(date) : null;
  const matches = isValid ? await getMatches(date) : null;
  const top = matches?.positives[0];
  const topEvent = top ? EVENT_BY_ID.get(top.eventId) : null;

  if (!brief || !top || !topEvent) {
    return new ImageResponse(
      (
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: BG,
            color: FG,
            fontFamily: "Inter, system-ui, sans-serif",
            padding: 80,
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: MUTED,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            OTI Daily
          </span>
          <h1
            style={{
              fontSize: 80,
              fontWeight: 600,
              marginTop: 40,
              textAlign: "center",
            }}
          >
            Today's regime not yet available
          </h1>
        </div>
      ),
      { width: WIDTH, height: HEIGHT },
    );
  }

  const similarityPct = (top.similarity * 100).toFixed(0);

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: FG,
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 64,
        }}
      >
        {/* Top band: brand + date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: MUTED,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo />
            <span>OTI Daily</span>
          </div>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>{date}</span>
        </div>

        {/* Center: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 32,
            paddingBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: MUTED,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            Today rhymes with
          </span>
          <h1
            style={{
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              margin: 0,
              maxWidth: 1000,
            }}
          >
            {topEvent.title}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: FG,
              opacity: 0.7,
              marginTop: 32,
              maxWidth: 1000,
              lineHeight: 1.3,
              fontWeight: 400,
            }}
          >
            {truncate(brief.brief.regimeSummary, 180)}
          </p>
        </div>

        {/* Bottom band: similarity meter + tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
              maxWidth: 700,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "baseline",
                fontSize: 22,
                color: MUTED,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              <span>Similarity</span>
              <span
                style={{
                  fontFamily: "ui-monospace, monospace",
                  color: FG,
                  fontSize: 28,
                  letterSpacing: 0,
                }}
              >
                {similarityPct}%
              </span>
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 12,
                background: "#1f1f1f",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${similarityPct}%`,
                  background: ACCENT,
                  display: "flex",
                  height: "100%",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
              color: MUTED,
              fontSize: 18,
            }}
          >
            <span>Memory, not prediction.</span>
            <span style={{ fontSize: 16 }}>oti.app/today</span>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="none">
      <circle cx="12" cy="12" r="10" stroke={FG} strokeWidth="1.6" />
      <path
        d="M4 12 Q 8 6, 12 12 T 20 12"
        stroke={ACCENT}
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}
