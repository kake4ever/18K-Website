// GET /api/center
const { zenoti, ok, err } = require('./_zenoti');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

exports.handler = async (event) => {
  const cors = corsFor(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const check = checkRateLimit(`center:${clientIp(event)}`, { max: 30, windowMs: 60_000 });
  if (!check.allowed) return rateLimitedResponse(cors, check.retryAfterSec);

  try {
    const data = await zenoti('/centers');
    const centers = data.centers || [];
    const center = centers.find(c => c.code === process.env.ZENOTI_CENTER_CODE || c.name?.includes('18K')) || centers[0];
    if (!center) return err('Center not found', 404, null, cors);

    return ok({
      id: center.id,
      name: center.display_name || center.name,
      code: center.code,
      address: center.contact?.address,
      phone: center.contact?.phone_1,
      email: center.contact?.email,
      hours: center.working_hours,
    }, 200, cors);
  } catch (e) {
    return err('Failed to fetch center', e.status || 500, e.body, cors);
  }
};
