const assert = require('assert');
const mockRes = () => { const r = { code: 200, body: null, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } }; return r; };

(async () => {
  // --- Store-Mock (Redis-Befehle über fetch) ---
  const liste = [];
  global.fetch = async (url, opt) => {
    const [c, , v] = JSON.parse(opt.body);
    if (c === 'RPUSH') { liste.push(v); return { ok: true, json: async () => ({ result: liste.length }) }; }
    if (c === 'LPOP') { const n = +JSON.parse(opt.body)[2]; return { ok: true, json: async () => ({ result: liste.splice(0, n) }) }; }
    return { ok: false };
  };
  process.env.KV_REST_API_URL = 'https://kv.example'; process.env.KV_REST_API_TOKEN = 't';
  process.env.INBOUND_SECRET = 'geheim'; process.env.POSTPILOT_TOKEN = 'tok';
  delete process.env.ANTHROPIC_API_KEY;

  const inbound = require('../inbound-mail'), inbox = require('../inbox'), letter = require('../post-letter');
  const text = `Stadtwerke Beispielhausen GmbH · Energieweg 5\n17.10.2026\nZahlungserinnerung – Stromrechnung\nKundennummer: K-88231\nOffener Betrag: 96,80 €.\nBitte überweisen Sie den Betrag bis zum 24.10.2026 auf DE89 3704 0044 0532 0130 00.`;

  let r = mockRes(); await inbound({ method: 'POST', query: { key: 'falsch' }, body: {} }, r); assert.strictEqual(r.code, 401);
  r = mockRes(); await inbound({ method: 'POST', query: { key: 'geheim' }, body: { From: 'caya@example.com', Subject: 'Neue Post', TextBody: text } }, r);
  assert.strictEqual(r.code, 200); assert.strictEqual(r.body.via, 'regeln');

  r = mockRes(); await inbox({ method: 'GET', headers: {} }, r); assert.strictEqual(r.code, 401);
  r = mockRes(); await inbox({ method: 'GET', headers: { authorization: 'Bearer tok' } }, r);
  assert.strictEqual(r.body.items.length, 1);
  assert.strictEqual(r.body.items[0].ergebnis.betrag, 96.8);
  assert.strictEqual(r.body.items[0].ergebnis.frist_datum, '2026-10-24');
  r = mockRes(); await inbox({ method: 'GET', headers: { authorization: 'Bearer tok' } }, r);
  assert.strictEqual(r.body.items.length, 0, 'Korb wird beim Abholen geleert');

  // Unleserliche Mail ohne KI-Key: wird trotzdem abgelegt, als unsicher markiert
  r = mockRes(); await inbound({ method: 'POST', query: { key: 'geheim' }, body: { Subject: 'x', TextBody: 'hallo' } }, r);
  assert.strictEqual(r.body.via, 'regeln-unsicher');

  // Brief-Trockenlauf
  r = mockRes(); await letter({ method: 'POST', body: { text: 'Hallo', empfaenger: ['Amt', 'Str. 1'], absender: ['Ich'], betreff: 'B' } }, r);
  assert.strictEqual(r.code, 200); assert.ok(r.body.versand.status.includes('Trockenlauf')); assert.ok(Buffer.from(r.body.pdf_base64, 'base64').toString('latin1').startsWith('%PDF'));
  r = mockRes(); await letter({ method: 'POST', body: { text: '', empfaenger: ['x'] } }, r); assert.strictEqual(r.code, 400);
  console.log('server: ok');
})().catch((e) => { console.error(e); process.exit(1); });
