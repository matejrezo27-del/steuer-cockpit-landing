const { getGmail } = require('./google');

function buildNotificationEmail(data) {
  const { name, kanzlei, email, telefon, mandanten, datev, herausforderung, termin } = data;
  const subject = `Neuer Demo-Termin — ${kanzlei}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #2563eb; margin-bottom: 24px;">Neuer Demo-Termin</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Kanzlei</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${kanzlei}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Name</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${name}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">E-Mail</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Telefon</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${telefon}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Mandanten</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${mandanten}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">DATEV</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${datev}</td></tr>
        <tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Herausforderung</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${herausforderung}</td></tr>
        <tr style="background: #f0f9ff;"><td style="padding: 12px; color: #2563eb; font-weight: 600;">Termin</td><td style="padding: 12px; font-weight: 600; color: #2563eb;">${termin.datum}, ${termin.uhrzeit} (30 Min)</td></tr>
      </table>
    </div>
  `;
  return { subject, html };
}

function buildConfirmationEmail(data) {
  const { name, kanzlei, email, telefon, termin } = data;
  const firstName = name.split(' ')[0];
  const subject = `Ihr Steuerbase Demo-Termin am ${termin.datum}`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2563eb; font-size: 24px; margin: 0;">Steuerbase</h1>
      </div>
      <h2 style="color: #0f172a; margin-bottom: 8px;">Termin bestätigt!</h2>
      <p style="color: #475569; line-height: 1.6;">
        Hallo ${firstName},<br><br>
        Ihr Demo-Termin für <strong>${kanzlei}</strong> ist bestätigt.
      </p>
      <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #bfdbfe;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">TERMIN</p>
        <p style="margin: 0; font-size: 20px; font-weight: 600; color: #0f172a;">${termin.datum}</p>
        <p style="margin: 4px 0 0; font-size: 18px; color: #2563eb;">${termin.uhrzeit} — 30 Minuten</p>
      </div>
      <p style="color: #475569; line-height: 1.6;">
        Matej Rezo wird Sie unter <strong>${telefon}</strong> anrufen.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      <p style="color: #94a3b8; font-size: 13px; text-align: center;">
        Fragen? <a href="mailto:info@steuerbase.de" style="color: #2563eb;">info@steuerbase.de</a> · +49 151 70857052
      </p>
    </div>
  `;
  return { subject, html };
}

function encodeEmail({ from, to, subject, html }) {
  const message = [
    `From: Steuerbase <${from}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');
  return Buffer.from(message).toString('base64url');
}

async function sendEmail({ to, subject, html }) {
  const gmail = getGmail();
  const from = process.env.GOOGLE_CALENDAR_ID || 'info@steuerbase.de';
  const raw = encodeEmail({ from, to, subject, html });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
}

module.exports = { buildNotificationEmail, buildConfirmationEmail, sendEmail };
