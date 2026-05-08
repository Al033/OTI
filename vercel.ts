// Project configuration. See https://vercel.com/docs/project-configuration/vercel-ts
// We export a plain object instead of typing through @vercel/config so this
// file works even if that package is not installed locally.
const config = {
  buildCommand: "next build",
  framework: "nextjs",
  installCommand: "pnpm install",
  // OTI Daily cron jobs.
  //   regime-snapshot — 21:05 UTC Mon-Fri (5:05pm ET, after US close).
  //                     Pulls macro-state vector, runs k-NN, writes
  //                     today's brief.
  //   publish-digest  — 10:00 UTC Tue-Sat (6am ET next day). Reads
  //                     yesterday's brief, posts to Bluesky, sends
  //                     Resend digest.
  // Both gated by CRON_SECRET — Vercel sets the Authorization header
  // automatically when the env var is present on the project.
  crons: [
    { path: "/api/cron/regime-snapshot", schedule: "5 21 * * 1-5" },
    { path: "/api/cron/publish-digest", schedule: "0 10 * * 2-6" },
  ],
  headers: [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
  redirects: [
    { source: "/docs", destination: "/methodology", permanent: false },
  ],
} as const;

export default config;
