// Project configuration. See https://vercel.com/docs/project-configuration/vercel-ts
// We export a plain object instead of typing through @vercel/config so this
// file works even if that package is not installed locally.
const config = {
  buildCommand: "next build",
  framework: "nextjs",
  installCommand: "pnpm install",
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
