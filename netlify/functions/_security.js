// ─────────────────────────────────────────────────────────
// Shared hardening for every Netlify Function on this site: CORS restricted
// to the site's own origins, a per-key rate limiter, and IP extraction.
// No new dependency — Netlify Functions run on a Lambda-like model where a
// warm container can be reused across nearby invocations, so an in-memory
// limiter is best-effort (it will not coordinate across concurrently
// invoked cold containers). That is a real limit, not a bug: it still
// blocks the common case (one script hammering one endpoint) and costs no
// new infrastructure. If real abuse shows up, the next step is a durable
// counter (Netlify Blobs, or a shared table) — not attempted here.
//
// CORS here is a second line of defense, not the primary control: it stops
// a browser running on another site from reading a cross-origin response
// with a visitor's browser. It does nothing against a direct call from a
// script, curl, or the mobile app (which never sends an Origin header) —
// those are stopped, if at all, by the rate limiter and the ownership
// checks in the functions themselves.
// ─────────────────────────────────────────────────────────

const DEFAULT_ALLOWED_ORIGINS = ['https://18knailboutique.com', 'https://www.18knailboutique.com'];

function allowedOrigins() {
  const env = process.env.ALLOWED_ORIGINS;
  if (!env) return DEFAULT_ALLOWED_ORIGINS;
  return env.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * CORS headers for this request. Reflects the Origin header only when it is
 * on the allowlist; otherwise omits Access-Control-Allow-Origin entirely so
 * a browser refuses to let cross-origin JS read the response. Non-browser
 * callers (the app, curl, server-to-server) are unaffected either way —
 * CORS is enforced by browsers, not servers.
 */
function corsFor(event, methods = 'GET, POST, PUT, DELETE, OPTIONS') {
  const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || null;
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': methods,
    Vary: 'Origin',
  };
  if (origin && allowedOrigins().includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

/** Best-effort caller IP: Netlify's own header first, then the standard proxy header. */
function clientIp(event) {
  const h = (event && event.headers) || {};
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

// key -> { count, resetAt }
let buckets = new Map();
const SWEEP_EVERY = 500; // amortize cleanup instead of scanning on every call
let callsSinceSweep = 0;

function sweepIfDue(now) {
  if (++callsSinceSweep < SWEEP_EVERY) return;
  callsSinceSweep = 0;
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

/**
 * Fixed-window limiter. `key` should already include the endpoint name so
 * different endpoints never share a bucket by accident (e.g. `cancel:1.2.3.4`).
 * Returns { allowed, remaining, retryAfterSec }.
 */
function checkRateLimit(key, { max, windowMs, now = Date.now() } = {}) {
  if (!max || !windowMs) throw new Error('checkRateLimit: max and windowMs are required');
  sweepIfDue(now);
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  const allowed = b.count <= max;
  return { allowed, remaining: Math.max(0, max - b.count), retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
}

/** The 429 response body/headers, in the same shape every function's `err()` uses. */
function rateLimitedResponse(cors, retryAfterSec) {
  return {
    statusCode: 429,
    headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': String(retryAfterSec) },
    body: JSON.stringify({ error: 'Too many requests', retry_after_seconds: retryAfterSec }),
  };
}

/** Test-only: clears all buckets so tests don't leak state into each other. */
function resetRateLimitsForTests() {
  buckets = new Map();
  callsSinceSweep = 0;
}

module.exports = { corsFor, clientIp, checkRateLimit, rateLimitedResponse, allowedOrigins, resetRateLimitsForTests, DEFAULT_ALLOWED_ORIGINS };
