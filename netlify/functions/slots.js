const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date } = event.queryStringParameters || {};
  if (!service_id || !date) return err('service_id, date required', 400);

  try {
    // Step 1: Create booking session
    const booking = await zenoti('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        center_id: CENTER_ID,
        services: [{ service_id, therapist_id: null }],
      }),
    });

    const booking_id = booking.booking_id || booking.id;
    if (!booking_id) return err('Could not create booking session', 500, booking);

    // Step 2: Get available slots
    const slotsData = await zenoti(`/bookings/${booking_id}/slots?date=${date}`);

    const slots = (slotsData.slots || []).map(s => ({
      start_time: s.start_time,
      end_time: s.end_time,
      therapist_id: s.therapist?.id || null,
      therapist_name: s.therapist ? `${s.therapist.first_name} ${s.therapist.last_name}`.trim() : 'Any',
    }));

    return ok({ booking_id, date, slots, raw_count: slotsData.slots?.length || 0 });
  } catch (e) {
    // Return raw error so we can debug
    return err('Failed to fetch slots', e.status || 500, e.body);
  }
};
