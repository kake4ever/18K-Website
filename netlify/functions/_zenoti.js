// ─────────────────────────────────────────────────────────
// Zenoti API helper — shared across all Netlify Functions.
//
// The credential is env-only. There is no fallback: a Zenoti application
// secret was previously hardcoded here as a default (in token.js, since
// removed) and committed to this public repository. The fix is not "hide it
// better" — it is "never write a real credential into source again."
// ─────────────────────────────────────────────────────────
const { corsFor } = require('./_security');

const BASE_URL = process.env.ZENOTI_API_URL || 'https://api.zenoti.com/v1';

// Swappable for tests only — production always uses the real fetch.
let fetchImpl = (...args) => fetch(...args);
function setFetchImpl(fn) { fetchImpl = fn || ((...args) => fetch(...args)); }

async function zenoti(path, options = {}) {
  const apiKey = process.env.ZENOTI_API_KEY;
  if (!apiKey) throw { status: 503, body: { error: 'ZENOTI_API_KEY is not configured' } };

  const url = `${BASE_URL}${path}`;
  const res = await fetchImpl(url, {
    ...options,
    headers: {
      'Authorization': `apikey ${apiKey}`,
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

function ok(body, status = 200, extraHeaders = {}) {
  return { statusCode: status, headers: { ...extraHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function err(message, status = 500, detail = null, extraHeaders = {}) {
  return { statusCode: status, headers: { ...extraHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: message, detail }) };
}

module.exports = { zenoti, ok, err, corsFor, setFetchImpl };
