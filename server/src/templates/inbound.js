import { escapeHtml } from '../lib/format.js';

export function renderInbound({ leadRef, receivedAt, userReceivedAt, intentLabel, name, email, phone, message, waHref }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message);

  return {
    subject: `New contact message from ${name}`,
    text: `NEW CONTACT MESSAGE
Lead Reference: ${leadRef}
Submitted: ${receivedAt}
${userReceivedAt ? `Customer Time: ${userReceivedAt}\n` : ''}Intent: ${intentLabel}

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

RESPONSE SLA: Reply to this customer within 1 business day.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
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
              <p style="margin:14px 0 14px;font-size:12px;font-weight:600;color:#8AA0BD;letter-spacing:0.08em;text-transform:uppercase;">New Contact Message</p>
              <div style="display:inline-block;background:rgba(56,189,248,0.15);color:#38BDF8;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 14px;border-radius:999px;border:1px solid rgba(56,189,248,0.25);">New Inquiry</div>
            </td>
          </tr>

          <!-- Brand Accent -->
          <tr>
            <td style="background-color:#0055E5;height:4px;font-size:4px;line-height:4px;" height="4">&nbsp;</td>
          </tr>

          <!-- Lead Reference -->
          <tr>
            <td style="padding:28px 40px 4px;border-bottom:1px solid #E2E8F0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#8AA0BD;">Lead Reference</td>
                  <td style="text-align:right;font-size:13px;font-weight:700;color:#0B1D35;">${leadRef}</td>
                </tr>
                <tr>
                  <td style="padding-top:6px;font-size:12px;color:#8AA0BD;">Submitted</td>
                  <td style="padding-top:6px;text-align:right;font-size:13px;color:#4A6080;">${receivedAt}</td>
                </tr>
                ${userReceivedAt
                  ? `<tr>
                      <td style="padding-top:6px;font-size:12px;color:#8AA0BD;">Customer Time</td>
                      <td style="padding-top:6px;text-align:right;font-size:12px;color:#8AA0BD;">${userReceivedAt}</td>
                    </tr>`
                  : ''}
              </table>
            </td>
          </tr>

          <!-- SLA Banner -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,85,229,0.06);border:1px solid rgba(0,85,229,0.20);border-radius:10px;">
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#0055E5;font-weight:600;line-height:1.5;">
                    Response SLA: Reply to this customer within <strong>1 business day</strong>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding:28px 40px 8px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8AA0BD;">Customer Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;width:90px;vertical-align:top;">Name</td>
                        <td style="padding:6px 0;font-size:15px;font-weight:600;color:#0B1D35;">${safeName}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Email</td>
                        <td style="padding:6px 0;font-size:14px;color:#0055E5;font-weight:600;">
                          <a href="mailto:${safeEmail}" style="color:#0055E5;text-decoration:none;">${safeEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Phone</td>
                        <td style="padding:6px 0;font-size:14px;color:#0B1D35;font-weight:600;">${safePhone}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#8AA0BD;vertical-align:top;">Intent</td>
                        <td style="padding:6px 0;font-size:14px;color:#0B1D35;font-weight:600;">${intentLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:12px 40px 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8AA0BD;">Message</p>
              <p style="margin:0;padding:16px 18px;font-size:15px;color:#4A6080;line-height:1.7;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;white-space:pre-wrap;">${safeMessage}</p>
            </td>
          </tr>

          <!-- WhatsApp Action -->
          <tr>
            <td style="padding:0 40px 28px;">
              <a href="${waHref}" target="_blank" rel="noopener" style="display:block;background:#0055E5;color:#FFFFFF;font-size:14px;font-weight:700;text-align:center;text-decoration:none;padding:13px 20px;border-radius:9px;">
                Open WhatsApp Chat &rarr;
              </a>
              <p style="margin:10px 0 0;text-align:center;font-size:12px;color:#8AA0BD;">Engage this customer directly on WhatsApp (${safePhone}).</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0B1D35;">Allverze Corporation</p>
              <p style="margin:0 0 12px;font-size:12px;color:#8AA0BD;">Connecting Possibilities</p>
              <p style="margin:0;font-size:11px;color:#8AA0BD;">New inquiry via <a href="https://allverze.com" style="color:#0055E5;text-decoration:none;font-weight:600;">allverze.com</a></p>
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