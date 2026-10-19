const { configured } = require('./lib/claude');
const { analysiereMitKi } = require('./lib/analyse');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt.' });
  if (!configured()) return res.status(503).json({ error: 'KI nicht konfiguriert', demo: true });

  const { dateien } = req.body || {};
  if (!Array.isArray(dateien) || dateien.length === 0 || dateien.length > 10) {
    return res.status(400).json({ error: 'Bitte 1–10 Dateien senden.' });
  }
  for (const d of dateien) {
    if (!d || !ALLOWED.includes(d.mime) || typeof d.base64 !== 'string') {
      return res.status(400).json({ error: 'Nur JPG, PNG, WebP oder PDF.' });
    }
  }

  try {
    return res.status(200).json({ ergebnis: await analysiereMitKi(dateien) });
  } catch (e) {
    console.error('post-analyze', e.message);
    return res.status(502).json({ error: 'Analyse fehlgeschlagen. Bitte erneut versuchen oder manuell erfassen.' });
  }
};
