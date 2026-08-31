import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM;

if (!RESEND_API_KEY || !MAIL_FROM) {
  console.warn('RESEND_API_KEY or MAIL_FROM not set — outbound emails will be skipped, not sent');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Best-effort transactional email. Deliberately never throws and never hangs
 * the caller: a notification failing (missing config, Resend outage, an
 * unverified domain rejecting the recipient) should never block or fail the
 * action that triggered it — e.g. an admin confirming a crypto payment must
 * still succeed even if the "you've been paid" email can't go out.
 *
 * (This mirrors a real incident in this codebase: an image upload dependency
 * silently hung forever on bad config instead of failing fast. Email is
 * lower-stakes than that, but the same discipline — fail loud in the logs,
 * never fail silently into a hang, never take the caller down — applies.)
 */
export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend || !MAIL_FROM) {
    console.warn(`[mailer] Skipped "${opts.subject}" to ${opts.to} — RESEND_API_KEY/MAIL_FROM not configured`);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error('[mailer] Resend rejected the email:', error);
    }
  } catch (err: unknown) {
    console.error('[mailer] Failed to send email:', err);
  }
}
