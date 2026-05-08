import { formatDate } from "@/lib/utils";
import type { DailyBrief } from "@/lib/regime/brief";
import type { HistoricalEvent } from "@/lib/types";

/**
 * Hand-rolled email template for OTI Daily. Plain-string HTML so we
 * don't pull in `react-email` for what is essentially a one-screen
 * digest — keeps the dep surface tight. Per the 2026 Moosend numbers
 * (HTML vs plain-text 42–51% click-through), founder-voice plain text
 * with one inline image card actually beats heavy HTML on engagement;
 * we ship both views and let the client pick.
 */

export interface RenderEmailArgs {
  date: string;
  brief: DailyBrief;
  topAnalogue: HistoricalEvent;
  topSimilarity: number;
  permalinkUrl: string;
  ogImageUrl: string;
}

export async function renderEmail(args: RenderEmailArgs): Promise<{
  subject: string;
  html: string;
  text: string;
}> {
  const subject = `${args.brief.headline} — OTI Daily ${args.date}`;
  const sim = (args.topSimilarity * 100).toFixed(0);
  const html = renderHtml(args, sim);
  const text = renderText(args, sim);
  return { subject, html, text };
}

function renderHtml(args: RenderEmailArgs, sim: string): string {
  const safeSummary = escapeHtml(args.brief.regimeSummary);
  const safeHeadline = escapeHtml(args.brief.headline);
  const safeAnalogue = escapeHtml(args.topAnalogue.title);
  const formatted = formatDate(args.date);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeHeadline}</title>
  </head>
  <body style="margin:0; padding:24px; background:#f7f4ee; color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; line-height:1.5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto;">
      <tr>
        <td style="padding-bottom:16px; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#6b6b6b;">
          OTI Daily &middot; ${formatted}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:24px;">
          <a href="${args.permalinkUrl}" style="text-decoration:none; color:#0a0a0a;">
            <img src="${args.ogImageUrl}" alt="OTI Daily ${args.date}" width="560" style="display:block; width:100%; height:auto; border-radius:6px;">
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <h1 style="font-size:28px; line-height:1.15; font-weight:600; margin:0 0 12px;">
            ${safeHeadline}
          </h1>
          <p style="font-size:14px; line-height:1.6; color:#3b3b3b; margin:0;">
            ${safeSummary}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:24px; font-size:13px; color:#3b3b3b;">
          Top analogue: <strong>${safeAnalogue}</strong> — similarity ${sim}%.
        </td>
      </tr>
      <tr>
        <td style="padding:16px 0; border-top:1px solid #d8d2c4; border-bottom:1px solid #d8d2c4;">
          <a href="${args.permalinkUrl}" style="display:inline-block; padding:10px 16px; background:#0a0a0a; color:#fff; text-decoration:none; border-radius:4px; font-size:13px; font-weight:500;">
            Read the full brief →
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-top:16px; font-size:11px; color:#6b6b6b;">
          OTI is for educational and research purposes only. Memory, not prediction.
          <br>
          You're receiving this because you subscribed at oti.app.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(args: RenderEmailArgs, sim: string): string {
  return [
    `OTI Daily — ${formatDate(args.date)}`,
    "",
    args.brief.headline,
    "",
    args.brief.regimeSummary,
    "",
    `Top analogue: ${args.topAnalogue.title} (similarity ${sim}%)`,
    "",
    `Read the full brief: ${args.permalinkUrl}`,
    "",
    "Memory, not prediction.",
    "OTI is for educational and research purposes only.",
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
