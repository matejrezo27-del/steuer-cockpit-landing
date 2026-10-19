/* Minimaler PDF-Writer für Geschäftsbriefe (A4, DIN 5008 Form B), ohne Abhängigkeiten.
 * Nur Standardschrift Helvetica (WinAnsi), daher keine Schriftdatei nötig. */

const MM = 72 / 25.4;
const SEITE = { b: 595.28, h: 841.89 };

// Helvetica-Zeichenbreiten (AFM) für ASCII 32–126, in 1/1000 em
const W = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const SONDER = { 'ä': 556, 'ö': 556, 'ü': 556, 'Ä': 667, 'Ö': 778, 'Ü': 722, 'ß': 611, '€': 556, '–': 556, '—': 1000, '„': 333, '“': 333, '”': 333, '‚': 222, '’': 222, '•': 350, '·': 278, '§': 556, '°': 400 };
const WINANSI = { '€': 0x80, '‚': 0x82, '„': 0x84, '–': 0x96, '—': 0x97, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95 };

function breite(text, größe) {
  let sum = 0;
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    sum += SONDER[ch] ?? (c >= 32 && c <= 126 ? W[c - 32] : 556);
  }
  return (sum * größe) / 1000;
}

function kodiere(text) {
  const bytes = [];
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    const b = WINANSI[ch] ?? (c < 256 ? c : 0x3f);
    bytes.push(b);
  }
  return '(' + bytes.map((b) => (b === 0x28 || b === 0x29 || b === 0x5c ? '\\' + String.fromCharCode(b) : b < 32 || b > 126 ? '\\' + b.toString(8).padStart(3, '0') : String.fromCharCode(b))).join('') + ')';
}

function umbrechen(text, größe, maxBreite) {
  const zeilen = [];
  for (const absatz of String(text).replace(/\r/g, '').split('\n')) {
    if (!absatz.trim()) { zeilen.push(''); continue; }
    let zeile = '';
    for (const wort of absatz.split(/\s+/)) {
      const test = zeile ? zeile + ' ' + wort : wort;
      if (breite(test, größe) <= maxBreite) zeile = test;
      else { if (zeile) zeilen.push(zeile); zeile = wort; }
    }
    zeilen.push(zeile);
  }
  return zeilen;
}

/**
 * @param {{absender:string[], empfaenger:string[], datum:string, ort?:string, betreff:string, bezug?:string[], text:string, gruss?:string, unterschrift?:string}} brief
 * @returns {{pdf: Buffer, seiten: number}}
 */
function erzeugeBriefPdf(brief) {
  const links = 25 * MM, rechts = SEITE.b - 20 * MM, textBreite = rechts - links;
  const gr = 10.5, zh = 13.5;
  const seiten = [];
  let ops = [], y;
  const neueSeite = (erste) => {
    if (ops.length) seiten.push(ops.join('\n'));
    ops = []; y = SEITE.h - (erste ? 98.5 * MM : 25 * MM);
    return y;
  };
  const text = (s, x, yy, g = gr, fett = false) => ops.push(`BT /${fett ? 'F2' : 'F1'} ${g} Tf ${x.toFixed(2)} ${yy.toFixed(2)} Td ${kodiere(s)} Tj ET`);

  // Absenderzeile (klein, über dem Fenster) und Anschriftenfeld: Fenster beginnt 45 mm von oben
  ops = [];
  const absZeile = brief.absender.filter(Boolean).join(' · ');
  text(absZeile, links, SEITE.h - 45 * MM - 2, 7);
  ops.push(`0.5 w ${links} ${SEITE.h - 46.5 * MM} m ${links + 85 * MM} ${SEITE.h - 46.5 * MM} l S`);
  brief.empfaenger.filter(Boolean).slice(0, 6).forEach((z, i) => text(z, links, SEITE.h - 52 * MM - i * 12, gr));

  // Absenderblock rechts
  brief.absender.filter(Boolean).slice(0, 5).forEach((z, i) => text(z, SEITE.b - 80 * MM, SEITE.h - 50 * MM - i * 12, 9));
  const dat = `${brief.ort ? brief.ort + ', ' : ''}${brief.datum}`;
  text(dat, rechts - breite(dat, gr), SEITE.h - 88 * MM, gr);

  y = SEITE.h - 98.5 * MM;
  const zeile = (s, fett = false, g = gr) => {
    if (y < 25 * MM) { neueSeite(false); }
    if (s) text(s, links, y, g, fett);
    y -= zh;
  };
  if (brief.bezug?.length) brief.bezug.filter(Boolean).forEach((z) => zeile(z, false, 9));
  if (brief.bezug?.length) y -= 4;
  umbrechen(brief.betreff, gr, textBreite).forEach((z) => zeile(z, true));
  y -= zh;
  umbrechen(brief.text, gr, textBreite).forEach((z) => zeile(z));
  y -= zh;
  zeile(brief.gruss || 'Mit freundlichen Grüßen');
  y -= zh * 2;
  zeile(brief.unterschrift || '');
  seiten.push(ops.join('\n'));

  // PDF-Objekte
  const objs = [];
  const add = (s) => { objs.push(s); return objs.length; };
  add('<< /Type /Catalog /Pages 2 0 R >>');
  add(`<< /Type /Pages /Kids [${seiten.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${seiten.length} >>`);
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  seiten.forEach((inhalt, i) => {
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${SEITE.b} ${SEITE.h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
    add(`<< /Length ${Buffer.byteLength(inhalt, 'latin1')} >>\nstream\n${inhalt}\nendstream`);
  });
  let out = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(out, 'latin1')); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return { pdf: Buffer.from(out, 'latin1'), seiten: seiten.length };
}

module.exports = { erzeugeBriefPdf, umbrechen, breite };
