/* Eingangskorb für neue Post. Redis-kompatibel über REST (Upstash / Vercel KV).
 * Umgebungsvariablen: KV_REST_API_URL, KV_REST_API_TOKEN (alternativ UPSTASH_REDIS_REST_URL/_TOKEN). */
const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'postpilot:inbox';

const configured = () => Boolean(url() && token());

async function cmd(args) {
  const r = await fetch(url(), {
    method: 'POST',
    headers: { authorization: `Bearer ${token()}`, 'content-type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`Store ${r.status}`);
  return (await r.json()).result;
}

const push = (item) => cmd(['RPUSH', KEY, JSON.stringify(item)]);
async function pull(max = 50) {
  const rows = (await cmd(['LPOP', KEY, String(max)])) || [];
  return rows.map((x) => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean);
}

module.exports = { configured, push, pull };
