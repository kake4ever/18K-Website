const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  try {
    // Try multiple booking payload formats to find what works
    const payload1 = {
      center_id: CENTER_ID,
      services: [{ service_id, guest_id, therapist_id: null }],
    };

    const payload2 = {
      center_id: CENTER_ID,
      appointment: {
        center_id: CENTER_ID,
        services: [{ service_id, guest_id }],
      },
    };

    const payload3 = {
      center_id: CENTER_ID,
      guest_id,
      service_id,
    };

    const results = {};
    for (const [label, payload] of [['payload1', payload1], ['payload2', payload2], ['payload3', payload3]]) {
      try {
        const booking = await zenoti('/bookings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        results[label] = { success: true, booking_id: booking.booking_id || booking.id, raw: booking };
      } catch (e) {
        results[label] = { success: false, status: e.status, body: e.body };
      }
    }

    return ok({ debug: true, results });
  } catch (e) {
    return err('Failed', e.status || 500, e.body);
  }
};
