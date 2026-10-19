const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

function configured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function ask({ system, content, maxTokens = 2000 }) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content }] }),
  });
  if (!r.ok) throw new Error(`Claude API ${r.status}`);
  const data = await r.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
}

function extractJson(text) {
  const m = /\{[\s\S]*\}/.exec(text);
  if (!m) throw new Error('Keine JSON-Antwort');
  return JSON.parse(m[0]);
}

module.exports = { ask, extractJson, configured };
