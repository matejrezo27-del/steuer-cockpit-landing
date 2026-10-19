const crypto = require('crypto');
function gleich(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
const bearer = (req) => (req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
module.exports = { gleich, bearer };
