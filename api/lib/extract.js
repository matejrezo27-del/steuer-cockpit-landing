/* Regelbasierte Erkennung deutscher Post. Kein KI-Aufruf, keine Abhängigkeiten.
 * Liefert dasselbe Schema wie api/post-analyze.js plus Sicherheitswerte je Feld. */

const pad = (n) => String(n).padStart(2, '0');

function isoDatum(tt, mm, jjjj) {
  const j = jjjj.length === 2 ? 2000 + +jjjj : +jjjj;
  const d = new Date(j, +mm - 1, +tt);
  if (d.getFullYear() !== j || d.getMonth() !== +mm - 1 || d.getDate() !== +tt) return null;
  return `${j}-${pad(+mm)}-${pad(+tt)}`;
}

function ibanGueltig(roh) {
  const s = roh.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  const umgestellt = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => c.charCodeAt(0) - 55);
  let rest = 0;
  for (const ch of umgestellt) rest = (rest * 10 + +ch) % 97;
  return rest === 1;
}

function parseBetrag(s) {
  const n = s.replace(/\./g, '').replace(',', '.');
  const v = parseFloat(n);
  return Number.isFinite(v) ? v : null;
}

const BETRAG = '(\\d{1,3}(?:\\.\\d{3})*,\\d{2}|\\d+,\\d{2})\\s*(?:€|EUR|Euro)';
const BETRAG_SCHLUESSEL = /(nachzahlung|gesamtbetrag|offener betrag|rechnungsbetrag|zu zahlen|zahlbetrag|forderung|endbetrag|summe|betrag)/i;

function findeBetrag(text) {
  const zeilen = text.split(/\n/);
  let bester = null;
  for (const z of zeilen) {
    const m = new RegExp(BETRAG, 'i').exec(z);
    if (!m) continue;
    const wert = parseBetrag(m[1]);
    if (wert == null) continue;
    const mitSchluessel = BETRAG_SCHLUESSEL.test(z);
    const kand = { wert, konf: mitSchluessel ? 0.9 : 0.45 };
    // Schlüsselwort-Treffer schlagen alle anderen; bei Gleichstand gewinnt der spätere (Summenzeile)
    if (!bester || kand.konf >= bester.konf) bester = kand;
  }
  // Betrag im Fließtext hinter "Offener Betrag:" etc., auch wenn die Zeile mehrere Zahlen enthält
  const fließ = new RegExp(`(?:offener betrag|gesamtbetrag|nachzahlung|zu zahlen)[^\\d]{0,20}${BETRAG}`, 'i').exec(text);
  if (fließ) return { wert: parseBetrag(fließ[1]), konf: 0.92 };
  return bester;
}

function findeIban(text) {
  const kandidaten = text.match(/\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{2,4}){3,8}\b/g) || [];
  for (const k of kandidaten) if (ibanGueltig(k)) return k.replace(/\s+/g, '').toUpperCase();
  return null;
}

function findeDaten(text) {
  const alle = [];
  const re = /(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4}|\d{2})\b/g;
  let m;
  while ((m = re.exec(text))) {
    const iso = isoDatum(m[1], m[2], m[3]);
    if (iso) alle.push({ iso, pos: m.index, roh: m[0] });
  }
  return alle;
}

const FRIST_KONTEXT = /(bis(?:\s+zum|\s+spätestens)?|spätestens(?:\s+bis(?:\s+zum)?)?|fällig(?:\s+am)?|zahlbar\s+bis|zahlungsziel|frist(?:\s+bis)?|innerhalb\s+bis)\s*[:\-]?\s*$/i;

function findeFristDatum(text, daten, briefdatum) {
  for (const d of daten) {
    const davor = text.slice(Math.max(0, d.pos - 40), d.pos);
    if (FRIST_KONTEXT.test(davor) && d.iso !== briefdatum) return d.iso;
  }
  return null;
}

function findeBriefdatum(text, daten) {
  const kopf = daten.filter((d) => d.pos < 900);
  const explizit = /(datum|vom)\s*[:\s]*$/i;
  for (const d of kopf) if (explizit.test(text.slice(Math.max(0, d.pos - 12), d.pos))) return d.iso;
  // erstes Datum im Briefkopf, das nicht in einem Fristkontext steht
  for (const d of kopf) if (!FRIST_KONTEXT.test(text.slice(Math.max(0, d.pos - 40), d.pos))) return d.iso;
  return null;
}

const TYPEN = [
  ['steuerbescheid', /(einkommensteuer|umsatzsteuer|gewerbesteuer|körperschaftsteuer|steuerbescheid|festsetzung|finanzamt)/i, 3],
  ['mahnung', /(mahnung|zahlungserinnerung|mahngebühr|säumnis|inkasso|vollstreckung)/i, 3],
  ['kuendigung', /(kündigung|kündigen|sonderkündigungsrecht)/i, 2],
  ['versicherung', /(versicherung|versicherungsnummer|police|beitragsanpassung|schaden)/i, 2],
  ['rechnung', /(rechnung|rechnungsnummer|rechnungsbetrag|umsatzsteuer 19|zahlbar innerhalb)/i, 2],
  ['bank', /(kontoauszug|kreditkarte|darlehen|bank|sparkasse)/i, 1],
  ['vertrag', /(vertrag|vertragsnummer|laufzeit|angebot)/i, 1],
  ['behoerde', /(amt|behörde|bescheid|anhörung|aktenzeichen|widerspruch|rechtsbehelf)/i, 1],
];

function findeTyp(text) {
  const punkte = {};
  for (const [typ, re, gewicht] of TYPEN) {
    const treffer = (text.match(new RegExp(re.source, 'gi')) || []).length;
    if (treffer) punkte[typ] = treffer * gewicht;
  }
  const sortiert = Object.entries(punkte).sort((a, b) => b[1] - a[1]);
  if (!sortiert.length) return { typ: 'sonstiges', konf: 0.2 };
  const [typ, p] = sortiert[0];
  const zweiter = sortiert[1]?.[1] || 0;
  return { typ, konf: p >= 4 && p > zweiter * 1.5 ? 0.9 : 0.6 };
}

const ORG = /(GmbH|AG|KG|UG|e\.V\.|Finanzamt|Stadtwerke|Versicherung|Krankenkasse|Sparkasse|Bank|Amt|Behörde|Gemeinde|Stadt|Kreis|Großhandel|Verlag|Telekom|Vodafone)/;

function findeAbsender(text) {
  const kopf = text.split(/\n/).map((z) => z.trim()).filter(Boolean).slice(0, 8);
  for (const z of kopf) {
    if (z.length > 100) continue;
    if (ORG.test(z)) {
      const name = z.split(/\s[·|•]\s|\s{2,}/)[0].replace(/[,;:]$/, '').trim();
      if (name.length >= 4) return { wert: name, konf: 0.85, adresse: z.split(/\s[·|•]\s/).slice(1).join(', ') || null };
    }
  }
  return { wert: null, konf: 0, adresse: null };
}

function findeBetreff(text) {
  const m = /(?:^|\n)\s*(?:betreff|betr\.?)\s*[:\-]\s*(.+)/i.exec(text);
  if (m) return { wert: m[1].trim().slice(0, 140), konf: 0.9 };
  const zeilen = text.split(/\n/).map((z) => z.trim()).filter(Boolean);
  const kand = zeilen.slice(0, 20).find((z) => z.length < 90 && /(bescheid|rechnung|erinnerung|mahnung|kündigung|anpassung|beitrag|abrechnung|schreiben|anhörung)/i.test(z));
  return kand ? { wert: kand, konf: 0.6 } : { wert: null, konf: 0 };
}

function feld(text, re) {
  const m = re.exec(text);
  return m ? m[1].trim().replace(/[.,;]$/, '') : null;
}

const AUFGABEN = {
  steuerbescheid: (e) => [
    { titel: 'Bescheid mit Steuererklärung abgleichen', art: 'pruefen' },
    ...(e.betrag != null ? [{ titel: `${eur(e.betrag)} überweisen`, art: 'zahlen' }] : []),
    { titel: 'Ggf. Einspruch einlegen', art: 'antworten' },
  ],
  mahnung: (e) => [
    { titel: 'Prüfen, ob schon bezahlt', art: 'pruefen' },
    ...(e.betrag != null ? [{ titel: `${eur(e.betrag)} überweisen`, art: 'zahlen' }] : []),
  ],
  rechnung: (e) => [
    { titel: 'Leistung auf Richtigkeit prüfen', art: 'pruefen' },
    ...(e.betrag != null ? [{ titel: `${eur(e.betrag)} überweisen`, art: 'zahlen' }] : []),
    { titel: 'Beleg für Buchhaltung ablegen', art: 'aufbewahren' },
  ],
  versicherung: () => [
    { titel: 'Änderung prüfen', art: 'pruefen' },
    { titel: 'Ggf. Sonderkündigung senden', art: 'antworten' },
  ],
  kuendigung: () => [{ titel: 'Kündigung prüfen und bestätigen', art: 'pruefen' }],
  behoerde: () => [{ titel: 'Schreiben lesen und Handlung klären', art: 'pruefen' }],
  bank: () => [{ titel: 'Mitteilung prüfen', art: 'pruefen' }],
  vertrag: () => [{ titel: 'Vertrag prüfen', art: 'pruefen' }],
  sonstiges: () => [{ titel: 'Schreiben prüfen', art: 'pruefen' }],
};
const eur = (n) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

/** @returns {{ergebnis: object, konfidenz: object, gesamt: number, braucht_ki: boolean, gruende: string[]}} */
function extrahiere(text) {
  const t = String(text || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ');
  const typ = findeTyp(t);
  const absender = findeAbsender(t);
  const betreff = findeBetreff(t);
  const daten = findeDaten(t);
  const brief = findeBriefdatum(t, daten);
  const fristDatum = findeFristDatum(t, daten, brief);
  const betrag = findeBetrag(t);
  const iban = findeIban(t);
  const tage = /innerhalb\s+von\s+(\d{1,3})\s+(?:Kalender)?tagen/i.exec(t);
  const hatEinspruch = /rechtsbehelf|einspruch/i.test(t) && /monat/i.test(t);
  const hatWiderspruch = /widerspruch/i.test(t) && /monat/i.test(t);
  const regel = fristDatum ? null : typ.typ === 'steuerbescheid' && hatEinspruch ? 'einspruch_1m' : hatWiderspruch ? 'widerspruch_1m' : null;
  const fristTage = fristDatum || regel ? null : tage ? +tage[1] : null;

  const e = {
    typ: typ.typ,
    absender: absender.wert,
    absender_adresse: absender.adresse,
    betreff: betreff.wert,
    datum: brief,
    aktenzeichen: feld(t, /(?:aktenzeichen|geschäftszeichen|\baz\.?)\s*[:\s]\s*([A-Z0-9][\w/.\-]{3,})/i) || feld(t, /steuernummer\s*[:\s]\s*([\d/ ]{8,})/i),
    kundennummer: feld(t, /(?:kundennummer|kunden-nr\.?|versicherungsnummer|vertragsnummer|mitgliedsnummer)\s*[:\s]\s*([A-Z0-9][\w\-/]{2,})/i),
    steuernummer: feld(t, /steuernummer\s*[:\s]\s*([\d/ ]{8,})/i),
    rechnungsnummer: feld(t, /(?:rechnungsnummer|rechnungs-nr\.?|rechnung\s+nr\.?)\s*[:\s]\s*([A-Z0-9][\w\-/]{2,})/i),
    // Schwache Betragstreffer nur bei Zahlungsdokumenten übernehmen (sonst z. B. alter Beitrag statt Forderung)
    betrag: betrag && (betrag.konf >= 0.9 || ['rechnung', 'mahnung', 'steuerbescheid'].includes(typ.typ)) ? betrag.wert : null,
    iban,
    verwendungszweck: feld(t, /verwendungszweck\s*[:\s]\s*([^\n.]+?)(?:\.|\n|$)/i),
    frist_datum: fristDatum,
    frist_regel: regel,
    frist_tage: fristTage,
    zusammenfassung: null,
    aufgaben: [],
    antwort_noetig: ['versicherung', 'kuendigung', 'steuerbescheid'].includes(typ.typ),
    unsicher: [],
  };
  e.aufgaben = (AUFGABEN[e.typ] || AUFGABEN.sonstiges)(e);

  const konf = {
    typ: typ.konf, absender: absender.konf, betreff: betreff.konf, datum: brief ? 0.85 : 0,
    betrag: betrag && (betrag.konf >= 0.9 || ['rechnung', 'mahnung', 'steuerbescheid'].includes(typ.typ)) ? betrag.konf : 0, iban: iban ? 0.98 : 0,
    frist: fristDatum ? 0.85 : regel ? 0.8 : fristTage ? 0.7 : 0,
  };

  const gruende = [];
  if (!e.absender) gruende.push('Absender nicht erkannt');
  if (e.typ === 'sonstiges') gruende.push('Dokumenttyp unklar');
  if (['mahnung', 'rechnung', 'steuerbescheid'].includes(e.typ) && !konf.frist) gruende.push('Keine Frist erkannt');
  if (['mahnung', 'rechnung', 'steuerbescheid'].includes(e.typ) && e.betrag == null) gruende.push('Kein Betrag erkannt');
  if (!e.datum) gruende.push('Briefdatum fehlt');
  e.unsicher = gruende.slice();

  const werte = Object.values(konf).filter((v) => v > 0);
  const gesamt = werte.length ? +(werte.reduce((a, b) => a + b, 0) / werte.length).toFixed(2) : 0;
  return { ergebnis: e, konfidenz: konf, gesamt, braucht_ki: gruende.length > 0, gruende };
}

module.exports = { extrahiere, ibanGueltig, findeIban, parseBetrag };
