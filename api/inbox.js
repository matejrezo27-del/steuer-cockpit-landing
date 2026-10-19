/* Die App holt hier neue Post ab (und leert damit den Eingangskorb). GET /api/inbox, Authorization: Bearer <POSTPILOT_TOKEN> */
const store = require('./lib/store');
const { gleich, bearer } = require('./lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt.' });
  if (!process.env.POSTPILOT_TOKEN || !gleich(bearer(req), process.env.POSTPILOT_TOKEN)) return res.status(401).json({ error: 'Nicht berechtigt.' });
  if (!store.configured()) return res.status(503).json({ error: 'Eingangskorb nicht konfiguriert.', demo: true });
  try {
    return res.status(200).json({ items: await store.pull(50) });
  } catch (e) {
    console.error('inbox', e.message);
    return res.status(502).json({ error: 'Abruf fehlgeschlagen.' });
  }
};
