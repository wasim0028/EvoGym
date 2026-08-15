import { env } from '../config/env';

/* No email provider is wired up yet. Rather than silently dropping the
   message, the reset link is logged to the server console in development so
   the flow is testable end to end.
   To go live, replace the body of sendPasswordResetEmail with a call to your
   provider (SES, Resend, SendGrid…). Nothing else needs to change. */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  if (env.NODE_ENV === 'production') {
    // Deliberately loud: in production a reset that is never delivered is a
    // support ticket, not a silent no-op.
    console.error(
      `[mailer] NO EMAIL PROVIDER CONFIGURED — password reset for ${to} was not sent.`,
    );
    return;
  }

  console.log('\n──────── password reset (development only) ────────');
  console.log(`  to:   ${to}`);
  console.log(`  link: ${resetUrl}`);
  console.log('──────────────────────────────────────────────────\n');
}
