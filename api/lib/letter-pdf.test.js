const assert = require('assert');
const fs = require('fs');
const { erzeugeBriefPdf, umbrechen } = require('./letter-pdf');
const lang = Array.from({ length: 60 }, (_, i) => `Absatz ${i + 1}: Ich bitte um Prüfung und Rückmeldung, Größe, Straße, 96,80 € – „Test“.`).join('\n\n');
const { pdf, seiten } = erzeugeBriefPdf({
  absender: ['Max Mustermann', 'Beispielweg 12', '12345 Musterstadt'],
  empfaenger: ['Finanzamt Musterstadt', 'Amtsstr. 1', '12345 Musterstadt'],
  datum: '19.10.2026', ort: 'Musterstadt', betreff: 'Einspruch gegen den Einkommensteuerbescheid 2024',
  bezug: ['Steuernummer: 123/456/78901', 'Bescheid vom 14.10.2026'],
  text: 'Sehr geehrte Damen und Herren,\n\nhiermit lege ich Einspruch ein. Ä Ö Ü ä ö ü ß € (Klammer) \\ Backslash.\n' + lang, unterschrift: 'Max Mustermann',
});
assert.ok(pdf.slice(0, 8).toString().startsWith('%PDF-1.4'));
assert.ok(pdf.toString('latin1').trimEnd().endsWith('%%EOF'));
assert.ok(seiten >= 2, 'Seitenumbruch');
assert.ok(umbrechen('wort '.repeat(200), 10.5, 400).every((z) => z.length < 120));
fs.writeFileSync(process.argv[2] || '/tmp/brief-test.pdf', pdf);
console.log('letter-pdf: ok, Seiten:', seiten, 'Bytes:', pdf.length);
