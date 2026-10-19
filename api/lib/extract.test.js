const assert = require('assert');
const { extrahiere, ibanGueltig } = require('./extract');

const BRIEFE = {
  finanzamt: `Finanzamt Musterstadt · Amtsstr. 1 · 12345 Musterstadt
Max Mustermann
Beispielweg 12
12345 Musterstadt
14.10.2026
Einkommensteuerbescheid 2024
Steuernummer: 123/456/78901
Festgesetzte Einkommensteuer 14.820,00 €
Bereits geleistete Vorauszahlungen 13.535,50 €
Nachzahlung 1.284,50 €
Der Betrag ist bis zum 28.10.2026 auf das Konto des Finanzamts zu überweisen. Verwendungszweck: 123/456/78901 ESt 2024. IBAN: DE02 1203 0000 0000 2020 51.
Rechtsbehelfsbelehrung: Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Einspruch eingelegt werden.`,
  stadtwerke: `Stadtwerke Beispielhausen GmbH · Energieweg 5 · 54321 Beispielhausen
Max Mustermann
17.10.2026
Zahlungserinnerung – Stromrechnung
Kundennummer: K-88231
Rechnungsnummer: R-2026-0412
Sehr geehrter Herr Mustermann, wir konnten für die oben genannte Rechnung leider keinen Zahlungseingang feststellen. Offener Betrag: 96,80 €.
Bitte überweisen Sie den Betrag bis zum 24.10.2026 auf folgendes Konto: DE89 3704 0044 0532 0130 00, Verwendungszweck K-88231 R-2026-0412.
Andernfalls müssen wir Mahngebühren erheben.`,
  versicherung: `Beispiel Versicherung AG · Versicherungsallee 3 · 80331 München
11.10.2026
Anpassung Ihres Beitrags – Privathaftpflicht
Versicherungsnummer: V-5521-77
zum nächsten Fälligkeitstermin erhöht sich Ihr Jahresbeitrag von 62,40 € auf 74,90 €. Sie haben das Recht, den Vertrag innerhalb von 30 Tagen nach Zugang dieses Schreibens, spätestens bis zum 18.11.2026, in Textform zu kündigen.`,
  rechnung: `Büro & Mehr Großhandel KG · Industriestr. 44 · 70173 Stuttgart
15.10.2026
Rechnung Nr. 2026-10471
Kundennummer: KD-30417
Büromaterial, Lieferung vom 13.10.2026 412,00 €
Umsatzsteuer 19 % 78,28 €
Gesamtbetrag 490,28 €
Zahlbar innerhalb von 14 Tagen ohne Abzug. IBAN: DE44 5001 0517 5407 3249 31. Verwendungszweck: RE 2026-10471.`,
};

assert.ok(ibanGueltig('DE02 1203 0000 0000 2020 51') && !ibanGueltig('DE02 1203 0000 0000 2020 52'));

let r = extrahiere(BRIEFE.finanzamt);
assert.strictEqual(r.ergebnis.typ, 'steuerbescheid');
assert.strictEqual(r.ergebnis.absender, 'Finanzamt Musterstadt');
assert.strictEqual(r.ergebnis.datum, '2026-10-14');
assert.strictEqual(r.ergebnis.betrag, 1284.5);
assert.strictEqual(r.ergebnis.iban, 'DE02120300000000202051');
assert.strictEqual(r.ergebnis.steuernummer, '123/456/78901');
assert.strictEqual(r.ergebnis.frist_datum, '2026-10-28');
assert.strictEqual(r.ergebnis.verwendungszweck, '123/456/78901 ESt 2024');
assert.strictEqual(r.braucht_ki, false, r.gruende.join());
assert.ok(r.ergebnis.aufgaben.some((a) => a.art === 'zahlen'));

r = extrahiere(BRIEFE.stadtwerke);
assert.strictEqual(r.ergebnis.typ, 'mahnung');
assert.strictEqual(r.ergebnis.betrag, 96.8);
assert.strictEqual(r.ergebnis.kundennummer, 'K-88231');
assert.strictEqual(r.ergebnis.rechnungsnummer, 'R-2026-0412');
assert.strictEqual(r.ergebnis.frist_datum, '2026-10-24');
assert.strictEqual(r.ergebnis.iban, 'DE89370400440532013000');
assert.strictEqual(r.braucht_ki, false, r.gruende.join());

r = extrahiere(BRIEFE.versicherung);
assert.strictEqual(r.ergebnis.typ, 'versicherung');
assert.strictEqual(r.ergebnis.frist_datum, '2026-11-18');
assert.strictEqual(r.ergebnis.kundennummer, 'V-5521-77');
assert.strictEqual(r.ergebnis.absender, 'Beispiel Versicherung AG');
assert.strictEqual(r.ergebnis.betrag, null);

r = extrahiere(BRIEFE.rechnung);
assert.strictEqual(r.ergebnis.typ, 'rechnung');
assert.strictEqual(r.ergebnis.betrag, 490.28);
assert.strictEqual(r.ergebnis.frist_tage, 14);
assert.strictEqual(r.ergebnis.rechnungsnummer, '2026-10471');
assert.strictEqual(r.ergebnis.iban, 'DE44500105175407324931');
assert.strictEqual(r.braucht_ki, false, r.gruende.join());

// Unlesbarer Müll → KI-Rückfall
r = extrahiere('hallo welt lorem');
assert.strictEqual(r.braucht_ki, true);
assert.strictEqual(r.ergebnis.typ, 'sonstiges');
assert.ok(r.gruende.includes('Absender nicht erkannt'));
console.log('extract: ok');
