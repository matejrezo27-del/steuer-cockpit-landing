const { ask, configured } = require('./lib/claude');

const SYSTEM = `Du formulierst höfliche, sachliche deutsche Geschäftsbriefe im Namen des Nutzers an Behörden, Firmen und Versicherungen.
Regeln: Nur Fakten aus den gelieferten Daten verwenden, keine erfundenen Rechtsnormen oder Zahlen. Bezug (Aktenzeichen, Kundennummer, Datum des Schreibens) in die Betreffzeile.
Wenn etwas fehlt, setze einen klaren Platzhalter in [eckigen Klammern]. Kein Markdown. Ausgabe: nur der fertige Brieftext inkl. Anrede und Grußformel.
Hinweis: Du gibst keine Rechts- oder Steuerberatung; bei Fristsachen formulierst du neutral und knapp.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt.' });
  if (!configured()) return res.status(503).json({ error: 'KI nicht konfiguriert', demo: true });

  const { dokument, anliegen, absender } = req.body || {};
  if (!dokument || typeof anliegen !== 'string' || !anliegen.trim() || anliegen.length > 2000) {
    return res.status(400).json({ error: 'Dokument und Anliegen (max. 2000 Zeichen) nötig.' });
  }
  const prompt = `Schreiben, auf das geantwortet wird:\n${JSON.stringify(dokument)}\n\nAbsender der Antwort (Nutzer):\n${JSON.stringify(absender || {})}\n\nDas will der Nutzer erreichen:\n${anliegen}\n\nHeutiges Datum: ${new Date().toISOString().slice(0, 10)}`;
  try {
    const text = await ask({ system: SYSTEM, content: [{ type: 'text', text: prompt }], maxTokens: 1200 });
    return res.status(200).json({ brief: text.trim() });
  } catch (e) {
    console.error('post-reply', e.message);
    return res.status(502).json({ error: 'Entwurf fehlgeschlagen. Bitte erneut versuchen.' });
  }
};
