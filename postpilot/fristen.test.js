const assert = require('assert');
const F = require('./fristen');

// Steuerbescheid vom 10.03.2026 (Di): Bekanntgabe 13.03., Fristende 13.04.2026 (Mo)
assert.strictEqual(F.berechne({ datum: '2026-03-10', frist_regel: 'einspruch_1m' }).datum, '2026-04-13');
// Fristende auf Samstag: Bescheid 29.01.2026 → Bekanntgabe 01.02. (So) → 01.03. (So) → Mo 02.03.
assert.strictEqual(F.berechne({ datum: '2026-01-29', frist_regel: 'einspruch_1m' }).datum, '2026-03-02');
// Monatsende: Bekanntgabe 31.01. + 1 Monat = 28.02.2026 (Sa) → Mo 02.03.
assert.strictEqual(F.berechne({ datum: '2026-01-28', frist_regel: 'widerspruch_1m' }).datum, '2026-03-02');
// Explizite Frist hat Vorrang
assert.strictEqual(F.berechne({ datum: '2026-03-10', frist_datum: '2026-03-31', frist_regel: 'einspruch_1m' }).datum, '2026-03-31');
// Tage ab Briefdatum
assert.strictEqual(F.berechne({ datum: '2026-03-02', frist_tage: 14 }).datum, '2026-03-16');
// Nichts erkannt
assert.strictEqual(F.berechne({ datum: '2026-03-02' }).datum, null);
assert.strictEqual(F.berechne({}).datum, null);
assert.strictEqual(F.tageBis('2026-03-10', new Date(2026, 2, 8, 15)), 2);
console.log('fristen: ok');
