const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  const results = {};

  // Build on the working format: date at top + date in service
  const attempts = {
    'base':               { center_id: CENTER_ID, date, guests: [{ guest_id, services: [{ service_id, date }] }] },
    'with_therapist_any': { center_id: CENTER_ID, date, guests: [{ guest_id, services: [{ service_id, date, therapist_id: '00000000-0000-0000-0000-000000000000' }] }] },
    'with_quantity':      { center_id: CENTER_ID, date, guests: [{ guest_id, services: [{ service_id, date, quantity: 1 }] }] },
    'with_slot_time':     { center_id: CENTER_ID, date, guests: [{ guest_id, services: [{ service_id, date, slot_time: `${date}T10:00:00` }] }] },
    'with_duration':      { center_id: CENTER_ID, date, guests: [{ guest_id, services: [{ service_id, date, duration: 60 }] }] },
    'no_guest_id':        { center_id: CENTER_ID, date, guests: [{ services: [{ service_id, date }] }] },
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
