import type { NextRequest } from "next/server";

/**
 * Cron-route auth guard. Vercel Cron sends `Authorization: Bearer
 * ${CRON_SECRET}` when the env var is configured on the project. We
 * also allow `?secret=…` as a fallback for manual curl-driven invocation
 * during dev / one-off backfills.
 *
 * If CRON_SECRET is unset entirely, the routes are open — convenient
 * for local dev, dangerous for prod. The deploy README should warn.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const qSecret = req.nextUrl.searchParams.get("secret");
  if (qSecret && qSecret === secret) return true;

  return false;
}
