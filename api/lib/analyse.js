const { ask, extractJson, configured } = require('./claude');
const { extrahiere } = require('./extract');

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

const blockFuer = (d) => (d.mime === 'application/pdf'
  ? { type: 'document', source: { type: 'base64', media_type: d.mime, data: d.base64 } }
  : { type: 'image', source: { type: 'base64', media_type: d.mime, data: d.base64 } });

async function analysiereMitKi(dateien) {
  const content = [...dateien.map(blockFuer), { type: 'text', text: 'Das sind die Seiten eines einzigen Schreibens. Extrahiere die Daten.' }];
  return extractJson(await ask({ system: SYSTEM, content, maxTokens: 1500 }));
}

/**
 * Regeln zuerst; KI nur, wenn die Regeln unsicher sind und Dateien + API-Key vorliegen.
 * @returns {{ergebnis: object, via: 'regeln'|'ki'|'regeln-unsicher', gesamt: number, gruende: string[]}}
 */
async function analysiere({ text = '', dateien = [] }) {
  const r = extrahiere(text);
  if (!r.braucht_ki) return { ergebnis: r.ergebnis, via: 'regeln', gesamt: r.gesamt, gruende: [] };
  if (configured() && dateien.length) {
    try { return { ergebnis: await analysiereMitKi(dateien), via: 'ki', gesamt: 0.8, gruende: r.gruende }; }
    catch (e) { console.error('analyse-ki', e.message); }
  }
  return { ergebnis: r.ergebnis, via: 'regeln-unsicher', gesamt: r.gesamt, gruende: r.gruende };
}

module.exports = { analysiere, analysiereMitKi, SYSTEM };
