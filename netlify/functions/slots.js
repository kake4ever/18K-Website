const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  try {
    // Create booking session with center_date
    const booking = await zenoti('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        center_id: CENTER_ID,
        center_date: date,
        guests: [{ guest_id, services: [{ service_id }] }],
      }),
    });

    const booking_id = booking.booking_id || booking.id;
    if (!booking_id || booking_id === '00000000-0000-0000-0000-000000000000') {
      return err('Could not create booking session', 500, booking);
    }

    // Get available slots
    const slotsData = await zenoti(`/bookings/${booking_id}/slots?date=${date}`);
    const slots = (slotsData.slots || []).map(s => ({
      start_time: s.start_time,
      end_time: s.end_time,
      therapist_id: s.therapist?.id || null,
      therapist_name: s.therapist ? `${s.therapist.first_name} ${s.therapist.last_name}`.trim() : 'Any',
    }));

    return ok({ booking_id, date, slots, count: slots.length });
  } catch (e) {
    return err('Failed to fetch slots', e.status || 500, e.body);
  }
};
