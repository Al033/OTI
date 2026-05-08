import { renderEmail } from "@/emails/render";
import type { DailyBrief } from "@/lib/regime/brief";
import type { HistoricalEvent } from "@/lib/types";

/**
 * Resend publisher for the OTI Daily email digest. Uses the dynamic
 * import pattern so a missing `resend` dep doesn't break the cron at
 * module-load.
 *
 * The audience id is the Resend "audience" (their term for a list); the
 * cron sends a broadcast to all subscribers.
 */

export interface PublishEmailArgs {
  date: string;
  brief: DailyBrief;
  topAnalogue: HistoricalEvent;
  topSimilarity: number;
  permalinkUrl: string;
  ogImageUrl: string;
}

export interface EmailPublishResult {
  sent: boolean;
  reason?: string;
  broadcastId?: string;
}

export async function publishEmailDigest(args: PublishEmailArgs): Promise<EmailPublishResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !fromAddress || !audienceId) {
    return {
      sent: false,
      reason: "RESEND_API_KEY / RESEND_FROM / RESEND_AUDIENCE_ID not configured",
    };
  }

  let resendModule: typeof import("resend");
  try {
    resendModule = await import("resend");
  } catch (err) {
    return {
      sent: false,
      reason: `resend not installed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const resend = new resendModule.Resend(apiKey);
  const { html, text, subject } = await renderEmail(args);

  // Resend's broadcast API: create + send.
  const created = await resend.broadcasts.create({
    audienceId,
    from: fromAddress,
    subject,
    html,
    text,
  });
  if (created.error) {
    return { sent: false, reason: `broadcast create failed: ${created.error.message}` };
  }
  const broadcastId = created.data?.id;
  if (!broadcastId) {
    return { sent: false, reason: "broadcast create returned no id" };
  }
  const sent = await resend.broadcasts.send(broadcastId);
  if (sent.error) {
    return { sent: false, reason: `broadcast send failed: ${sent.error.message}`, broadcastId };
  }
  return { sent: true, broadcastId };
}
