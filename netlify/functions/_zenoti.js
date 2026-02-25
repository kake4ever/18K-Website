// ─────────────────────────────────────────────────────────
// Zenoti API helper — shared across all Netlify Functions
// ─────────────────────────────────────────────────────────
const BASE_URL = process.env.ZENOTI_API_URL || 'https://api.zenoti.com/v1';
const API_KEY  = process.env.ZENOTI_API_KEY;

async function zenoti(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `apikey ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    throw { status: res.status, body: data };
  }
  return data;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

function ok(body, status = 200) {
  return { statusCode: status, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function err(message, status = 500, detail = null) {
  return { statusCode: status, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: message, detail }) };
}

module.exports = { zenoti, ok, err, cors };
