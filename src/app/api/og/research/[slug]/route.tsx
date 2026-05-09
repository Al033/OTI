import { ImageResponse } from "next/og";
import { getEssayBySlug } from "@/lib/research";

export const runtime = "nodejs";
export const dynamic = "force-static";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const W = 1200;
const H = 675;
const BG = "#0a0a0a";
const FG = "#fafafa";
const MUTED = "#999999";
const ACCENT = "#5a8dff";

/**
 * Open Graph card for a research essay. 1200×675 — the X-optimised
 * aspect, also the Bluesky / Substack default. Black background, single
 * accent stripe, big serif-leaning typography (Inter at 600), the
 * "OTI Research" wordmark in the corner.
 *
 * Cached at the edge for 7 days; essays are immutable once published.
 */
export async function GET(_req: Request, ctx: RouteParams) {
  const { slug } = await ctx.params;
  const essay = getEssayBySlug(slug);
  if (!essay) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: FG,
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 64,
        }}
      >
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
            <span>OTI Research</span>
          </div>
          <span style={{ fontFamily: "ui-monospace, monospace" }}>
            {essay.publishedAt}
          </span>
        </div>

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
          <h1
            style={{
              fontSize: 60,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: -1,
              margin: 0,
              maxWidth: 1080,
            }}
          >
            {essay.title}
          </h1>
          {essay.description && (
            <p
              style={{
                fontSize: 24,
                color: FG,
                opacity: 0.65,
                marginTop: 28,
                maxWidth: 1000,
                lineHeight: 1.4,
                fontWeight: 400,
              }}
            >
              {truncate(essay.description, 200)}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: 12, color: MUTED, fontSize: 18 }}>
            {essay.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                style={{
                  border: `1px solid ${MUTED}40`,
                  padding: "6px 12px",
                  borderRadius: 4,
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
              >
                {t}
              </span>
            ))}
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
            <span style={{ fontSize: 16 }}>
              oti.app/research/{essay.slug}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        "Cache-Control":
          "public, s-maxage=604800, stale-while-revalidate=2592000",
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
