const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date) return err('service_id, date required', 400);

  try {
    // Use provided guest_id or create a temp anonymous guest
    let guestId = guest_id;
    if (!guestId) {
      const tempGuest = await zenoti(`/centers/${CENTER_ID}/guests`, {
        method: 'POST',
        body: JSON.stringify({
          center_id: CENTER_ID,
          personal_info: {
            first_name: 'Guest',
            last_name: 'User',
            mobile_phone: { country_code: 1, number: '0000000000' },
          },
        }),
      });
      guestId = tempGuest.guest?.id || tempGuest.id;
    }

    if (!guestId) return err('Could not get guest ID for booking', 500);

    // Create booking session with guest
    const booking = await zenoti('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        center_id: CENTER_ID,
        services: [{
          service_id,
          guest_id: guestId,
          therapist_id: null,
        }],
      }),
    });

    const booking_id = booking.booking_id || booking.id;
    if (!booking_id) return err('Could not create booking session', 500, booking);

    // Get available slots
    const slotsData = await zenoti(`/bookings/${booking_id}/slots?date=${date}`);

    const slots = (slotsData.slots || []).map(s => ({
      start_time: s.start_time,
      end_time: s.end_time,
      therapist_id: s.therapist?.id || null,
      therapist_name: s.therapist
        ? `${s.therapist.first_name} ${s.therapist.last_name}`.trim()
        : 'Any',
    }));

    return ok({ booking_id, guest_id: guestId, date, slots });
  } catch (e) {
    return err('Failed to fetch slots', e.status || 500, e.body);
  }
};
