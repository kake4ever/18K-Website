// The whole point of this rewrite: cancel must refuse when the invoice does
// not belong to the guest asking, and it must accept the shape the app
// actually sends (POST { appointment_id, guest_id }), not just the old
// PUT ?invoice_id= shape nothing was calling.
const test = require('node:test');
const assert = require('node:assert/strict');
const { setFetchImpl } = require('../_zenoti');
const { resetRateLimitsForTests } = require('../_security');
const { fakeFetch, event } = require('./_helpers');
const cancel = require('../cancel');

const CENTER = 'eca2792d-2bbb-4789-be99-6a263c609925';
const GUEST_A = 'guest-a';
const GUEST_B = 'guest-b';

function routes({ cancelStatus = 200 } = {}) {
  return [
    {
      method: 'GET', match: (u) => u.includes('/appointments') && u.includes(`guest_id=${GUEST_A}`), status: 200,
      body: { appointments: [{ appointment_id: 'appt-1', invoice_id: 'inv-1' }, { appointment_id: 'appt-2', invoice_id: 'inv-2' }] },
    },
    { method: 'GET', match: (u) => u.includes('/appointments') && u.includes(`guest_id=${GUEST_B}`), status: 200, body: { appointments: [] } },
    { method: 'PUT', match: (u) => u.includes('/invoices/inv-1/cancel') || u.includes('/invoices/inv-2/cancel'), status: cancelStatus, body: cancelStatus === 200 ? {} : { Message: 'boom' } },
  ];
}

test.beforeEach(() => { resetRateLimitsForTests(); setFetchImpl(null); });

test('POST with the app\'s real shape (appointment_id + guest_id) cancels the matching invoice', async () => {
  setFetchImpl(fakeFetch(routes()));
  const res = await cancel.handler(event({ method: 'POST', body: { center_id: CENTER, appointment_id: 'appt-1', guest_id: GUEST_A } }));
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).success, true);
});

test('a guest_id that does not own the appointment is refused with 403, and Zenoti\'s cancel is never called', async () => {
  const fetch = fakeFetch(routes());
  setFetchImpl(fetch);
  const res = await cancel.handler(event({ method: 'POST', body: { center_id: CENTER, appointment_id: 'appt-1', guest_id: GUEST_B } }));
  assert.equal(res.statusCode, 403);
  assert.ok(!fetch.calls.some(c => c.url.includes('/cancel')), 'the cancel call must never reach Zenoti for a mismatched guest');
});

test('an invoice_id belonging to someone else is refused the same way', async () => {
  setFetchImpl(fakeFetch(routes()));
  const res = await cancel.handler(event({ method: 'POST', body: { center_id: CENTER, invoice_id: 'inv-1', guest_id: GUEST_B } }));
  assert.equal(res.statusCode, 403);
});

test('guest_id is mandatory — omitting it is a 400, not an unauthenticated cancel', async () => {
  setFetchImpl(fakeFetch(routes()));
  const res = await cancel.handler(event({ method: 'POST', body: { center_id: CENTER, invoice_id: 'inv-1' } }));
  assert.equal(res.statusCode, 400);
  assert.match(JSON.parse(res.body).error, /guest_id/);
});

test('the legacy PUT ?invoice_id=&guest_id= shape still works, verified the same way', async () => {
  setFetchImpl(fakeFetch(routes()));
  const res = await cancel.handler(event({ method: 'PUT', query: { center_id: CENTER, invoice_id: 'inv-2', guest_id: GUEST_A } }));
  assert.equal(res.statusCode, 200);
});

test('a Zenoti cancel failure after a verified match is surfaced as an error, not a false success', async () => {
  setFetchImpl(fakeFetch(routes({ cancelStatus: 500 })));
  const res = await cancel.handler(event({ method: 'POST', body: { center_id: CENTER, appointment_id: 'appt-1', guest_id: GUEST_A } }));
  assert.equal(res.statusCode, 500);
});

test('repeated cancel attempts for one guest are rate-limited', async () => {
  setFetchImpl(fakeFetch(routes()));
  for (let i = 0; i < 10; i++) {
    const r = await cancel.handler(event({ method: 'POST', body: { center_id: CENTER, appointment_id: 'appt-1', guest_id: GUEST_A } }));
    assert.equal(r.statusCode, 200);
  }
  const eleventh = await cancel.handler(event({ method: 'POST', body: { center_id: CENTER, appointment_id: 'appt-1', guest_id: GUEST_A } }));
  assert.equal(eleventh.statusCode, 429);
});

test('CORS is restricted: an allowed origin is reflected, an unknown one is not', async () => {
  setFetchImpl(fakeFetch(routes()));
  const good = await cancel.handler(event({ method: 'OPTIONS', origin: 'https://18knailboutique.com' }));
  assert.equal(good.headers['Access-Control-Allow-Origin'], 'https://18knailboutique.com');
  const bad = await cancel.handler(event({ method: 'OPTIONS', origin: 'https://evil.example' }));
  assert.equal(bad.headers['Access-Control-Allow-Origin'], undefined);
});
