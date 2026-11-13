// book.js and slots.js both create a real Zenoti object on every call; both
// now check the guest actually exists before doing that.
const test = require('node:test');
const assert = require('node:assert/strict');
const { setFetchImpl } = require('../_zenoti');
const { resetRateLimitsForTests } = require('../_security');
const { fakeFetch, event } = require('./_helpers');
const book = require('../book');
const slots = require('../slots');

const CENTER = 'eca2792d-2bbb-4789-be99-6a263c609925';

function bookRoutes() {
  return [
    { method: 'GET', match: (u) => u.includes('/guests/known-guest'), status: 200, body: {} },
    { method: 'POST', match: (u) => u.includes('/slots/reserve'), status: 200, body: {} },
    { method: 'POST', match: (u) => u.includes('/slots/confirm'), status: 200, body: { appointment_id: 'A1' } },
  ];
}

test.beforeEach(() => { resetRateLimitsForTests(); setFetchImpl(null); });

test('book.js refuses an unknown guest_id before touching the booking', async () => {
  const fetch = fakeFetch(bookRoutes());
  setFetchImpl(fetch);
  const res = await book.handler(event({ method: 'POST', body: { booking_id: 'BK1', slot_time: '2026-10-01T10:00:00', guest_id: 'ghost-guest', service_id: 'S1' } }));
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.success, false);
  assert.equal(parsed.error, 'Unknown guest_id');
  assert.ok(!fetch.calls.some(c => c.url.includes('/reserve')), 'reserve must never be attempted for an unverified guest');
});

test('book.js books for a known guest', async () => {
  setFetchImpl(fakeFetch(bookRoutes()));
  const res = await book.handler(event({ method: 'POST', body: { booking_id: 'BK1', slot_time: '2026-10-01T10:00:00', guest_id: 'known-guest', service_id: 'S1' } }));
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.success, true);
  assert.equal(parsed.appointment_id, 'A1');
});

function slotsRoutes() {
  return [
    { method: 'GET', match: (u) => u.includes('/guests/known-guest'), status: 200, body: {} },
    { method: 'POST', match: (u) => u.endsWith('/bookings'), status: 200, body: { id: 'BK9' } },
    { method: 'GET', match: (u) => u.includes('/bookings/BK9/slots'), status: 200, body: { Slots: [{ Time: '2026-10-01T14:00:00', Available: true }] } },
  ];
}

test('slots.js refuses an unknown guest_id and never creates a booking draft for it', async () => {
  const fetch = fakeFetch(slotsRoutes());
  setFetchImpl(fetch);
  const res = await slots.handler(event({ method: 'GET', query: { center_id: CENTER, service_id: 'S1', guest_id: 'ghost' } }));
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.error, 'Unknown guest_id');
  assert.ok(!fetch.calls.some(c => c.method === 'POST'), 'no draft booking may be created for an unverified guest');
});

test('slots.js still serves the anonymous/demo path with no guest_id (pre-account browsing)', async () => {
  setFetchImpl(fakeFetch(slotsRoutes()));
  const res = await slots.handler(event({ method: 'GET', query: { center_id: CENTER, service_id: 'S1' } }));
  const parsed = JSON.parse(res.body);
  assert.equal(parsed.slots.length, 1);
});

test('slots.js is rate-limited per IP', async () => {
  setFetchImpl(fakeFetch(slotsRoutes()));
  for (let i = 0; i < 30; i++) {
    const r = await slots.handler(event({ method: 'GET', query: { center_id: CENTER, service_id: 'S1' } }));
    assert.equal(r.statusCode, 200);
  }
  const r31 = await slots.handler(event({ method: 'GET', query: { center_id: CENTER, service_id: 'S1' } }));
  assert.equal(r31.statusCode, 429);
});
