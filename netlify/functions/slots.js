// GET /api/slots?center_id=xxx&service_id=xxx&date=2026-02-25&therapist_id=xxx(optional)
// Returns available time slots
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id, service_id, date, therapist_id } = event.queryStringParameters || {};
  if (!center_id || !service_id || !date) return err('center_id, service_id, date required', 400);

  try {
    // Step 1: Create a booking to get slots
    const bookingPayload = {
      center_id,
      services: [{
        service_id,
        therapist_id: therapist_id || null,
      }],
    };

    const booking = await zenoti('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload),
    });

    const booking_id = booking.booking_id || booking.id;
    if (!booking_id) return err('Could not create booking session', 500);

    // Step 2: Get available slots for this booking
    const slotsData = await zenoti(`/bookings/${booking_id}/slots?date=${date}`);

    const slots = (slotsData.slots || []).map(slot => ({
      start_time: slot.start_time,
      end_time: slot.end_time,
      therapist: slot.therapist ? {
        id: slot.therapist.id,
        name: `${slot.therapist.first_name} ${slot.therapist.last_name}`.trim(),
      } : null,
    }));

    return ok({ booking_id, date, slots });
  } catch (e) {
    return err('Failed to fetch slots', e.status || 500, e.body);
  }
};
