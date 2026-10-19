const { ask, extractJson, configured } = require('./lib/claude');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const SYSTEM = `Du liest eingescannte deutsche Post (Behörden, Finanzamt, Versicherungen, Rechnungen, Verträge) für Privatpersonen und Kleinunternehmer.
Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, ohne Erklärtext. Erfinde nichts: Was nicht im Schreiben steht, ist null.
Datumsangaben immer als YYYY-MM-DD. Beträge als Zahl in EUR.
Schema:
{
  "typ": "steuerbescheid|mahnung|rechnung|vertrag|kuendigung|versicherung|behoerde|bank|sonstiges",
  "absender": string, "absender_adresse": string|null, "betreff": string,
  "datum": "Briefdatum"|null,
  "aktenzeichen": string|null, "kundennummer": string|null, "steuernummer": string|null, "rechnungsnummer": string|null,
  "betrag": number|null, "iban": string|null, "verwendungszweck": string|null,
  "frist_datum": "nur wenn im Schreiben ein konkretes Datum als Frist/Zahlungsziel genannt wird"|null,
  "frist_regel": "einspruch_1m"|"widerspruch_1m"|null,   // einspruch_1m bei Steuerbescheiden mit Rechtsbehelfsbelehrung (Einspruch), widerspruch_1m bei sonstigen Verwaltungsakten (Widerspruch)
  "frist_tage": Zahl|null,                               // nur wenn "innerhalb von X Tagen" ohne Datum
  "zusammenfassung": "1-2 Sätze in einfacher Sprache: Was will der Absender von mir?",
  "aufgaben": [ { "titel": "konkrete Handlung, max. 8 Wörter", "art": "zahlen|antworten|pruefen|unterschreiben|einreichen|aufbewahren" } ],
  "antwort_noetig": boolean,
  "unsicher": [ "Felder, bei denen du dir nicht sicher bist" ]
}`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt.' });
  if (!configured()) return res.status(503).json({ error: 'KI nicht konfiguriert', demo: true });

  const { dateien } = req.body || {};
  if (!Array.isArray(dateien) || dateien.length === 0 || dateien.length > 10) {
    return res.status(400).json({ error: 'Bitte 1–10 Dateien senden.' });
  }
  const content = [];
  for (const d of dateien) {
    if (!d || !ALLOWED.includes(d.mime) || typeof d.base64 !== 'string') {
      return res.status(400).json({ error: 'Nur JPG, PNG, WebP oder PDF.' });
    }
    content.push(d.mime === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: d.mime, data: d.base64 } }
      : { type: 'image', source: { type: 'base64', media_type: d.mime, data: d.base64 } });
  }
  content.push({ type: 'text', text: 'Das sind die Seiten eines einzigen Schreibens. Extrahiere die Daten.' });

  try {
    const text = await ask({ system: SYSTEM, content, maxTokens: 1500 });
    return res.status(200).json({ ergebnis: extractJson(text) });
  } catch (e) {
    console.error('post-analyze', e.message);
    return res.status(502).json({ error: 'Analyse fehlgeschlagen. Bitte erneut versuchen oder manuell erfassen.' });
  }
};
