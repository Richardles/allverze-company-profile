import { escapeHtml } from '../lib/format.js';

export function renderConfirmation({
  leadRef,
  receivedAt,
  userReceivedAt,
  intentLabel,
  name,
  phone,
  message,
  publicEmail,
  whatsappDisplay,
  waCompanyHref,
}) {
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeMessage = `${escapeHtml(message.slice(0, 300))}${message.length > 300 ? '...' : ''}`;

  const mailtoSubject = encodeURIComponent(`Inquiry ${leadRef} — Allverze`);
  const mailtoBody = encodeURIComponent(`Hi Allverze team,\n\nThank you for confirming my inquiry (Reference: ${leadRef}).\n\nI have a quick question, or a few more details I'd like to add:\n\n\n\nBest regards,\n${name}`);
  const mailtoHref = `mailto:${publicEmail}?subject=${mailtoSubject}&amp;body=${mailtoBody}`;

  return {
    subject: `We've received your message — Allverze`,
    text: `Hi ${name},

Thank you for reaching out to Allverze. We've received your message — a real person on our team will get back to you within one business day.

Reference: ${leadRef}
Submitted: ${userReceivedAt ?? receivedAt}
${userReceivedAt ? `Allverze Time: ${receivedAt}\n` : ''}Intent: ${intentLabel}
Phone: ${phone}

Prefer to talk directly? We're one message away:
- Email: ${publicEmail}
- WhatsApp: ${whatsappDisplay}

Best regards,
The Allverze Team`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Message Received</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0B1D35;padding:36px 40px 28px;text-align:center;">
              <span style="font-size:24px;font-weight:800;color:#FFFFFF;letter-spacing:0.03em;">Allverze</span>
              <p style="margin:14px 0 0;font-size:12px;font-weight:600;color:#8AA0BD;letter-spacing:0.08em;text-transform:uppercase;">Allverze Corporation</p>
            </td>
          </tr>

          <!-- Brand Accent -->
          <tr>
            <td style="background-color:#0055E5;height:4px;font-size:4px;line-height:4px;" height="4">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0B1D35;">Hi ${safeName},</h2>
              <p style="margin:0 0 20px;font-size:15px;color:#4A6080;line-height:1.7;">
                Thank you for reaching out to us. We've received your message — a real person on our team will get back to you within <strong style="color:#0B1D35;">one business day</strong>.
              </p>

              <!-- Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8AA0BD;">Inquiry Summary</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;width:80px;vertical-align:top;">Reference</td>
                        <td style="padding:6px 0;font-size:14px;font-weight:700;color:#0055E5;">${leadRef}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Submitted</td>
                        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0B1D35;">${userReceivedAt ?? receivedAt}</td>
                      </tr>
                      ${userReceivedAt
                        ? `<tr>
                            <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Allverze Time</td>
                            <td style="padding:6px 0;font-size:13px;color:#8AA0BD;">${receivedAt}</td>
                          </tr>`
                        : ''}
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Intent</td>
                        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0B1D35;">${intentLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Phone</td>
                        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0B1D35;">${safePhone}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Message</td>
                        <td style="padding:6px 0;font-size:14px;color:#4A6080;line-height:1.6;">${safeMessage}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Contact Section -->
              <p style="margin:0 0 14px;font-size:15px;color:#4A6080;line-height:1.7;">Prefer to talk directly? We're one message away:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:0 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:16px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8AA0BD;width:120px;vertical-align:middle;">Email</td>
                        <td style="padding:16px 0;font-size:15px;font-weight:700;text-align:right;">
                          <a href="${mailtoHref}" style="color:#0055E5;text-decoration:none;">${publicEmail}</a>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E2E8F0;">
                      <tr>
                        <td style="padding:16px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8AA0BD;width:120px;vertical-align:middle;">WhatsApp</td>
                        <td style="padding:16px 0;font-size:15px;font-weight:600;text-align:right;color:#0B1D35;">${whatsappDisplay}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td align="center">
                    <a href="${waCompanyHref}" target="_blank" rel="noopener" style="display:inline-block;background:#0055E5;color:#FFFFFF;font-size:15px;font-weight:700;text-align:center;text-decoration:none;padding:14px 36px;border-radius:9px;">
                      Chat with us on WhatsApp &nbsp;&rarr;
                    </a>
                    <p style="margin:10px 0 0;font-size:12px;color:#8AA0BD;">Priority access &middot; Typically responds within minutes</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0B1D35;">Allverze Corporation</p>
              <p style="margin:0 0 12px;font-size:12px;color:#8AA0BD;">Connecting Possibilities</p>
              <p style="margin:0;font-size:11px;color:#8AA0BD;">You reached out through <a href="https://allverze.com" style="color:#0055E5;text-decoration:none;font-weight:600;">allverze.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}