// GET /api/loyalty?guest_id=xxx
const { zenoti, ok, err } = require('./_zenoti');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

exports.handler = async (event) => {
  const cors = corsFor(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { guest_id } = event.queryStringParameters || {};
  if (!guest_id) return err('guest_id required', 400, null, cors);

  const check = checkRateLimit(`loyalty:${clientIp(event)}:${guest_id}`, { max: 30, windowMs: 60_000 });
  if (!check.allowed) return rateLimitedResponse(cors, check.retryAfterSec);

  try {
    const data = await zenoti(`/guests/${guest_id}/points`);
    return ok(data.guest_points, 200, cors);
  } catch (e) {
    return err('Failed to fetch loyalty points', e.status || 500, e.body, cors);
  }
};
