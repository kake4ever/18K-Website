const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  const results = {};

  // The guests format works - try variations to get a real booking_id
  const payloads = {
    'a': { center_id: CENTER_ID, guests: [{ guest_id, services: [{ service_id }] }] },
    'b': { center_id: CENTER_ID, guests: [{ id: guest_id, services: [{ service_id }] }] },
    'c': { center_id: CENTER_ID, guests: [{ guest_id, services: [{ id: service_id }] }] },
    'd': { center_id: CENTER_ID, guests: [{ guest_id, services: [{ service_id, therapist_id: null }] }] },
    'e': { center_id: CENTER_ID, guests: [{ guest_id, service_id }] },
  };

  for (const [label, payload] of Object.entries(payloads)) {
    try {
      const data = await zenoti('/bookings', { method: 'POST', body: JSON.stringify(payload) });
      results[label] = { success: true, booking_id: data.booking_id || data.id, error: data.Error, keys: Object.keys(data), full: data };
    } catch (e) {
      results[label] = { success: false, status: e.status, msg: e.body?.message || e.body?.Message };
    }
  }

  return ok({ results });
};
