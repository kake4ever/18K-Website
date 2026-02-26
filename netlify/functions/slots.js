const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  const results = {};

  // Try all known POST booking formats
  const payloads = {
    'format_a': {
      center_id: CENTER_ID,
      services: [{ service_id, guest_id }]
    },
    'format_b': {
      center_id: CENTER_ID,
      appointment_services: [{ service_id, guest_id }]
    },
    'format_c': {
      CenterId: CENTER_ID,
      Services: [{ ServiceId: service_id, GuestId: guest_id }]
    },
    'format_d': {
      center_id: CENTER_ID,
      items: [{ service_id, guest_id, quantity: 1 }]
    },
  };

  for (const [label, payload] of Object.entries(payloads)) {
    try {
      const data = await zenoti('/bookings', { method: 'POST', body: JSON.stringify(payload) });
      results[label] = { success: true, booking_id: data.booking_id || data.id, keys: Object.keys(data) };
    } catch (e) {
      results[label] = { success: false, status: e.status, msg: e.body?.message || e.body?.Message };
    }
  }

  return ok({ results });
};
