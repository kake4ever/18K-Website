const { zenoti, ok, err, cors } = require('./_zenoti');

const DEMO_GUEST = 'B83AE293-BD1E-4AC8-9714-74F5C3F5989C';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id, service_id, date, guest_id, therapist_id } = event.queryStringParameters || {};
  if (!center_id || !service_id || !date) return err('center_id, service_id, date required', 400);

  try {
    const guestItem = { item: { id: service_id } };
    if (therapist_id) guestItem.therapist = { id: therapist_id };

    const booking = await zenoti('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        center_id,
        date,
        guests: [{
          id: guest_id || DEMO_GUEST,
          items: [guestItem],
        }],
      }),
    });

    const booking_id = booking.id;
    if (!booking_id) return err('Could not create booking session', 500, booking);

    const slotsData = await zenoti(`/bookings/${booking_id}/slots?date=${date}`);

    const slots = (slotsData.slots || [])
      .filter(s => s.Available)
      .map(slot => {
        const t = new Date(slot.Time);
        const start_time = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return {
          start_time,
          raw_time: slot.Time,
          therapist: therapist_id ? { id: therapist_id, name: '' } : null,
        };
      });

    return ok({ booking_id, date, slots });
  } catch (e) {
    return err('Failed to fetch slots', e.status || 500, e.body);
  }
};
