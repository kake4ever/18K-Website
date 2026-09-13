const test = require('node:test');
const assert = require('node:assert/strict');
const { setFetchImpl } = require('../_zenoti');
const { resetRateLimitsForTests } = require('../_security');
const { fakeFetch, event } = require('./_helpers');
const guest = require('../guest');

const CENTER = 'eca2792d-2bbb-4789-be99-6a263c609925';

function routes() {
  return [
    { method: 'GET', match: (u) => u.includes('/guests/search'), status: 200, body: { guests: [{ id: 'g1', code: 'C1', personal_info: { first_name: 'Khue', last_name: 'Pham', email: 'k@x.com', mobile_phone: { number: '4242385500' } } }] } },
    { method: 'GET', match: (u) => u.includes('/guests/g1'), status: 200, body: { referral: { referral_code: 'R1' } } },
    { method: 'POST', match: (u) => u.endsWith('/guests'), status: 200, body: { id: 'new-guest' } },
    { method: 'PUT', match: (u) => u.includes('/guests/g1'), status: 200, body: {} },
  ];
}

test.beforeEach(() => { resetRateLimitsForTests(); setFetchImpl(null); });

test('GET finds a guest by phone', async () => {
  setFetchImpl(fakeFetch(routes()));
  const res = await guest.handler(event({ method: 'GET', query: { center_id: CENTER, phone: '(424) 238-5500' } }));
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).guest.id, 'g1');
});

test('a malformed phone is rejected before any Zenoti call', async () => {
  const fetch = fakeFetch(routes());
  setFetchImpl(fetch);
  const res = await guest.handler(event({ method: 'GET', query: { center_id: CENTER, phone: '123' } }));
  assert.equal(res.statusCode, 400);
  assert.equal(fetch.calls.length, 0);
});

test('repeated searches for the SAME phone are rate-limited tighter than general traffic', async () => {
  setFetchImpl(fakeFetch(routes()));
  for (let i = 0; i < 10; i++) {
    const r = await guest.handler(event({ method: 'GET', query: { center_id: CENTER, phone: '4242385500' }, ip: `10.0.0.${i}` }));
    assert.equal(r.statusCode, 200, `lookup ${i} from a distinct IP should still succeed`);
  }
  const eleventh = await guest.handler(event({ method: 'GET', query: { center_id: CENTER, phone: '4242385500' }, ip: '10.0.0.99' }));
  assert.equal(eleventh.statusCode, 429, 'the SAME phone number across many IPs must still trip the per-target limit');
});

test('one IP is rate-limited on overall guest-search volume even across different phones', async () => {
  setFetchImpl(fakeFetch(routes()));
  for (let i = 0; i < 20; i++) {
    const r = await guest.handler(event({ method: 'GET', query: { center_id: CENTER, phone: `555000${String(i).padStart(4, '0')}` } }));
    assert.equal(r.statusCode, 200);
  }
  const next = await guest.handler(event({ method: 'GET', query: { center_id: CENTER, phone: '5559999999' } }));
  assert.equal(next.statusCode, 429);
});

test('POST creates a guest; PUT updates one', async () => {
  setFetchImpl(fakeFetch(routes()));
  const created = await guest.handler(event({ method: 'POST', body: { center_id: CENTER, first_name: 'A', last_name: 'B', phone: '4242385500' } }));
  assert.equal(created.statusCode, 201);
  const updated = await guest.handler(event({ method: 'PUT', body: { center_id: CENTER, guest_id: 'g1', first_name: 'A', last_name: 'B', email: 'a@b.com' } }));
  assert.equal(updated.statusCode, 200);
});
