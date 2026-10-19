/* Erzeugt aus dem Antworttext ein druckfertiges Brief-PDF (A4, DIN 5008) und übergibt es dem Versender.
 * Standard ist der Trockenlauf: nichts wird verschickt. POST /api/post-letter */
const { erzeugeBriefPdf } = require('./lib/letter-pdf');
const { waehle } = require('./lib/versender');

const zeilen = (v, max) => (Array.isArray(v) ? v : String(v || '').split('\n')).map((s) => String(s).trim()).filter(Boolean).slice(0, max);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt.' });
  const b = req.body || {};
  const text = String(b.text || '');
  if (!text.trim() || text.length > 20000) return res.status(400).json({ error: 'Brieftext fehlt oder ist zu lang.' });
  if (!zeilen(b.empfaenger, 6).length) return res.status(400).json({ error: 'Empfänger fehlt.' });
  try {
    const { pdf, seiten } = erzeugeBriefPdf({
      absender: zeilen(b.absender, 5), empfaenger: zeilen(b.empfaenger, 6), datum: String(b.datum || new Date().toLocaleDateString('de-DE')),
      ort: b.ort ? String(b.ort).slice(0, 60) : undefined, betreff: String(b.betreff || 'Ihr Schreiben').slice(0, 200), bezug: zeilen(b.bezug, 4),
      text, unterschrift: b.unterschrift ? String(b.unterschrift).slice(0, 80) : undefined,
    });
    const versand = await waehle(process.env.POSTPILOT_VERSENDER).senden({ pdf, optionen: { einschreiben: !!b.einschreiben } });
    return res.status(200).json({ seiten, versand, pdf_base64: pdf.toString('base64') });
  } catch (e) {
    console.error('post-letter', e.message);
    return res.status(500).json({ error: 'Brief konnte nicht erzeugt werden.' });
  }
};
