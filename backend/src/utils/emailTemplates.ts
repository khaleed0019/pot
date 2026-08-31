const NETWORK_LABELS: Record<string, string> = { BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana' };

/** Shared inline-styled shell — email clients ignore <style> tags and external CSS, so everything here is inline. */
function shell(bodyHtml: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f9fafb; padding:32px 16px;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #f0f0f0;">
      <div style="background:#0f172a; padding:24px 32px;">
        <span style="color:#ffffff; font-size:18px; font-weight:800;">Property On Set</span>
      </div>
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px; border-top:1px solid #f0f0f0;">
        <p style="color:#9ca3af; font-size:12px; margin:0;">
          This is an automated message about a crypto payment you submitted on Property On Set.
        </p>
      </div>
    </div>
  </div>`;
}

type PaymentEmailInput = {
  network: string;
  address: string;
  amountUsd: number | null;
  propertyTitle: string | null;
  reviewNote: string | null;
};

export function cryptoPaymentConfirmedEmail(p: PaymentEmailInput): { subject: string; html: string } {
  const label = NETWORK_LABELS[p.network] || p.network;
  const subject = `Payment confirmed — ${label}${p.propertyTitle ? ` for ${p.propertyTitle}` : ''}`;
  const html = shell(`
    <div style="width:48px; height:48px; border-radius:14px; background:#dcfce7; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
      <span style="font-size:24px;">&#10003;</span>
    </div>
    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 12px;">Your payment was confirmed</h1>
    <p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0 0 20px;">
      We've verified your ${label} payment${p.propertyTitle ? ` for <strong>${p.propertyTitle}</strong>` : ''}
      ${p.amountUsd ? ` (approximately <strong>$${p.amountUsd.toLocaleString()}</strong>)` : ''} sent to
      <span style="font-family:monospace; background:#f3f4f6; padding:1px 4px; border-radius:4px;">${p.address}</span>.
    </p>
    ${p.reviewNote ? `<p style="font-size:14px; color:#6b7280; background:#f9fafb; border-radius:12px; padding:12px 16px; margin:0 0 8px;">Note from our team: ${p.reviewNote}</p>` : ''}
    <p style="font-size:14px; color:#9ca3af; margin:20px 0 0;">
      A member of our team will follow up with next steps shortly.
    </p>
  `);
  return { subject, html };
}

export function cryptoPaymentRejectedEmail(p: PaymentEmailInput): { subject: string; html: string } {
  const label = NETWORK_LABELS[p.network] || p.network;
  const subject = `Payment could not be verified — ${label}${p.propertyTitle ? ` for ${p.propertyTitle}` : ''}`;
  const html = shell(`
    <div style="width:48px; height:48px; border-radius:14px; background:#fee2e2; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
      <span style="font-size:24px;">&#10005;</span>
    </div>
    <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 12px;">We couldn't confirm this payment</h1>
    <p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0 0 20px;">
      Your submitted ${label} payment${p.propertyTitle ? ` for <strong>${p.propertyTitle}</strong>` : ''} sent to
      <span style="font-family:monospace; background:#f3f4f6; padding:1px 4px; border-radius:4px;">${p.address}</span>
      could not be verified.
    </p>
    ${p.reviewNote ? `<p style="font-size:14px; color:#6b7280; background:#f9fafb; border-radius:12px; padding:12px 16px; margin:0 0 8px;">Reason: ${p.reviewNote}</p>` : ''}
    <p style="font-size:14px; color:#9ca3af; margin:20px 0 0;">
      If you believe this is a mistake, please reach out to us with your transaction details.
    </p>
  `);
  return { subject, html };
}
