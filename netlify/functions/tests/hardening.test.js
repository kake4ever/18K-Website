// Properties of the codebase itself, not of one function's behavior — the
// same reason 18k-ads-bot pins these as source-text assertions: a rule that
// is not checked rots the next time someone touches a file.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { setFetchImpl } = require('../_zenoti');

const DIR = path.join(__dirname, '..');
const FUNCTION_FILES = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.js') && !f.startsWith('_') && fs.statSync(path.join(DIR, f)).isFile());

test('the leaked-credential diagnostic endpoints are gone, not just fixed', () => {
  assert.equal(fs.existsSync(path.join(DIR, 'token.js')), false);
  assert.equal(fs.existsSync(path.join(DIR, 'debug.js')), false);
});

test('no source file hardcodes a Zenoti application id, secret, or API key as a fallback default', () => {
  const suspicious = /ZENOTI_(APP_ID|APP_SECRET|API_KEY)\s*\|\|\s*['"][^'"]{6,}['"]/;
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith('.js')) continue;
    const text = fs.readFileSync(path.join(DIR, f), 'utf8');
    assert.equal(suspicious.test(text), false, `${f} still hardcodes a Zenoti credential fallback`);
  }
});

test('_zenoti.js refuses to call Zenoti when no API key is configured, rather than sending "apikey undefined"', async () => {
  const { zenoti } = require('../_zenoti');
  const prev = process.env.ZENOTI_API_KEY;
  delete process.env.ZENOTI_API_KEY;
  setFetchImpl(async () => { throw new Error('must not be called'); });
  try {
    await assert.rejects(() => zenoti('/centers'), (e) => e.status === 503);
  } finally {
    if (prev !== undefined) process.env.ZENOTI_API_KEY = prev;
    setFetchImpl(null);
  }
});

test('every handler that talks to Zenoti or Anthropic restricts CORS via _security\'s corsFor — none allow "*"', () => {
  for (const f of FUNCTION_FILES) {
    const text = fs.readFileSync(path.join(DIR, f), 'utf8');
    assert.match(text, /require\(['"]\.\/_security['"]\)/, `${f} must import corsFor from _security`);
    assert.doesNotMatch(text, /Access-Control-Allow-Origin['"]:\s*['"]\*['"]/, `${f} must not allow any origin`);
  }
});

test('every mutation or PII-lookup handler calls checkRateLimit', () => {
  const MUST_RATE_LIMIT = ['guest.js', 'appointments.js', 'cancel.js', 'book.js', 'slots.js', 'loyalty.js', 'services.js', 'center.js', 'reviews.js', 'chat.js'];
  for (const f of MUST_RATE_LIMIT) {
    const text = fs.readFileSync(path.join(DIR, f), 'utf8');
    assert.match(text, /checkRateLimit\(/, `${f} must call checkRateLimit`);
  }
});

test('cancel.js never calls the Zenoti cancel endpoint without first resolving an owned invoice', () => {
  const text = fs.readFileSync(path.join(DIR, 'cancel.js'), 'utf8');
  assert.match(text, /findOwnedInvoice/);
  assert.doesNotMatch(text, /queryStringParameters[\s\S]{0,80}invoice_id[\s\S]{0,200}\/invoices\/\$\{invoiceId\}\/cancel/, 'a direct query-string invoice_id must not reach the cancel call unverified');
});

test('_zenoti.js exports no wide-open CORS object — removed, not left as an easy way back into "*"', () => {
  const zenotiModule = require('../_zenoti');
  assert.equal('cors' in zenotiModule, false);
  const text = fs.readFileSync(path.join(DIR, '_zenoti.js'), 'utf8');
  assert.doesNotMatch(text, /Access-Control-Allow-Origin/, '_zenoti.js must not define CORS headers itself — corsFor in _security.js is the one place that decides');
});
