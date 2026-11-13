// Shared test helpers: a fake fetch that answers by URL/method pattern, and
// an event builder matching the shape Netlify passes to a handler.
//
// _zenoti.js refuses to call Zenoti at all when ZENOTI_API_KEY is unset (the
// production fix for "apikey undefined") — tests that exercise a real
// handler need a value present, so every file that requires this helper
// gets one by default. hardening.test.js does not require this file; it
// manages the env var itself to test the missing-key path directly.
process.env.ZENOTI_API_KEY = process.env.ZENOTI_API_KEY || 'test-key';

function fakeFetch(routes) {
  const calls = [];
  const fn = async (url, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    calls.push({ url, method, body: opts.body ? JSON.parse(opts.body) : null });
    const route = routes.find(r => r.method === method && r.match(url));
    const status = route ? route.status : 404;
    const body = route ? (typeof route.body === 'function' ? route.body(url, opts) : route.body) : { error: 'unhandled in test' };
    return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) };
  };
  fn.calls = calls;
  return fn;
}

function event({ method = 'GET', query = {}, body = null, origin = null, ip = '203.0.113.7' } = {}) {
  const headers = { 'x-nf-client-connection-ip': ip };
  if (origin) headers.origin = origin;
  return { httpMethod: method, queryStringParameters: query, body: body ? JSON.stringify(body) : null, headers };
}

module.exports = { fakeFetch, event };
