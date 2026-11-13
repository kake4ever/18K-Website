const test = require('node:test');
const assert = require('node:assert/strict');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse, resetRateLimitsForTests, allowedOrigins } = require('../_security');
const { event } = require('./_helpers');

test.beforeEach(() => resetRateLimitsForTests());

test('CORS reflects an allowed origin and omits the header for an unrecognized one', () => {
  const allowed = corsFor(event({ origin: 'https://18knailboutique.com' }));
  assert.equal(allowed['Access-Control-Allow-Origin'], 'https://18knailboutique.com');
  const denied = corsFor(event({ origin: 'https://evil.example' }));
  assert.equal(denied['Access-Control-Allow-Origin'], undefined, 'an unrecognized origin must not be reflected back');
  const none = corsFor(event({}));
  assert.equal(none['Access-Control-Allow-Origin'], undefined, 'no Origin header at all (the app, curl) gets no ACAO — harmless, since only browsers check it');
});

test('the default allowlist is the site\'s own two domains, never "*"', () => {
  assert.deepEqual(allowedOrigins(), ['https://18knailboutique.com', 'https://www.18knailboutique.com']);
});

test('clientIp prefers the Netlify header, falls back to x-forwarded-for, then unknown', () => {
  assert.equal(clientIp({ headers: { 'x-nf-client-connection-ip': '1.2.3.4' } }), '1.2.3.4');
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '5.6.7.8, 9.9.9.9' } }), '5.6.7.8');
  assert.equal(clientIp({ headers: {} }), 'unknown');
});

test('the rate limiter allows up to max, then blocks with a retry-after, then resets after the window', () => {
  const now0 = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(checkRateLimit('k', { max: 3, windowMs: 1000, now: now0 }).allowed, true);
  const fourth = checkRateLimit('k', { max: 3, windowMs: 1000, now: now0 });
  assert.equal(fourth.allowed, false);
  assert.ok(fourth.retryAfterSec >= 1);
  const afterWindow = checkRateLimit('k', { max: 3, windowMs: 1000, now: now0 + 1001 });
  assert.equal(afterWindow.allowed, true, 'a new window must reset the count');
});

test('different keys never share a bucket', () => {
  checkRateLimit('a', { max: 1, windowMs: 1000 });
  assert.equal(checkRateLimit('b', { max: 1, windowMs: 1000 }).allowed, true);
});

test('rateLimitedResponse is a 429 carrying Retry-After and the passed-through CORS headers', () => {
  const res = rateLimitedResponse({ 'Access-Control-Allow-Origin': 'https://18knailboutique.com' }, 42);
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers['Retry-After'], '42');
  assert.equal(res.headers['Access-Control-Allow-Origin'], 'https://18knailboutique.com');
});
