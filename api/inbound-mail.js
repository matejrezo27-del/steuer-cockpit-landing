/* Webhook für eingehende E-Mails (Postmark-Inbound-Format; Mailgun/Cloudflare lassen sich auf dasselbe Format abbilden).
 * Caya leitet Scans an die App-Adresse weiter, hier werden sie ausgelesen und in den Eingangskorb gelegt.
 * Aufruf: POST /api/inbound-mail?key=<INBOUND_SECRET> */
const crypto = require('crypto');
const { analysiere } = require('./lib/analyse');
const store = require('./lib/store');
const { gleich } = require('./lib/auth');

const MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const alsText = (b) => String(b.TextBody || b['body-plain'] || (b.HtmlBody || '').replace(/<[^>]+>/g, ' ') || '').slice(0, 20000);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt.' });
  if (!process.env.INBOUND_SECRET || !gleich(req.query?.key, process.env.INBOUND_SECRET)) return res.status(401).json({ error: 'Nicht berechtigt.' });
  if (!store.configured()) return res.status(503).json({ error: 'Eingangskorb nicht konfiguriert (KV_REST_API_URL/_TOKEN).' });

  const b = req.body || {};
  const dateien = (b.Attachments || [])
    .filter((a) => MIME.includes(a.ContentType) && a.Content && a.Content.length < 6e6)
    .slice(0, 5)
    .map((a) => ({ mime: a.ContentType, base64: a.Content }));

  try {
    const a = await analysiere({ text: `${b.Subject || ''}\n${alsText(b)}`, dateien });
    await store.push({
      id: crypto.randomUUID(), empfangen: new Date().toISOString(), quelle: 'mail',
      von: String(b.From || b.from || '').slice(0, 200), betreff_mail: String(b.Subject || b.subject || '').slice(0, 200),
      via: a.via, gesamt: a.gesamt, gruende: a.gruende, ergebnis: a.ergebnis,
    });
    return res.status(200).json({ ok: true, via: a.via });
  } catch (e) {
    console.error('inbound-mail', e.message);
    return res.status(502).json({ error: 'Verarbeitung fehlgeschlagen.' });
  }
};
