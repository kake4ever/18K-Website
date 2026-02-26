const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  const ts = new Date(date).getTime();
  const results = {};

  const attempts = {
    'no_date':        { center_id: CENTER_ID, guests: [{ guest_id, services: [{ service_id }] }] },
    'unix_ms':        { center_id: CENTER_ID, center_date: ts, guests: [{ guest_id, services: [{ service_id }] }] },
    'unix_s':         { center_id: CENTER_ID, center_date: Math.floor(ts/1000), guests: [{ guest_id, services: [{ service_id }] }] },
    'date_key':       { center_id: CENTER_ID, date, guests: [{ guest_id, services: [{ service_id }] }] },
    'start_date':     { center_id: CENTER_ID, start_date: date, guests: [{ guest_id, services: [{ service_id }] }] },
    'requested_date': { center_id: CENTER_ID, requested_date: date, guests: [{ guest_id, services: [{ service_id }] }] },
  };

  for (const [label, payload] of Object.entries(attempts)) {
    try {
      const data = await zenoti('/bookings', { method: 'POST', body: JSON.stringify(payload) });
      const booking_id = data.booking_id || data.id;
      results[label] = { booking_id, error: data.Error || null };
    } catch (e) {
      results[label] = { failed: true, msg: e.body?.message || e.body?.Message };
    }
  }

  return ok({ results });
};
