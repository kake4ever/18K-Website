const { zenoti, ok, err, cors } = require('./_zenoti');

const DEMO_GUEST = 'B83AE293-BD1E-4AC8-9714-74F5C3F5989C';

// Services that require a deposit, with their deposit amounts.
// Deposit = 50% of price per Zenoti config (DepositType: 1, DepositValue: 50%).
// Source of truth: Zenoti webstore AvailableTimes response.
// Update this map when services or prices change.
// Deposit = 50% of price per Zenoti config (DepositType: 1, DepositValue: 50%).
// If service not in map, fall back to checking Zenoti booking response.
const DEPOSIT_MAP = {
  // Manicures
  'dc2874d0-a6e0-459b-a530-019aa40bd81e': 22.50, // Gel Manicure ($45)
  'adb41db2-0d85-4929-be77-4a5fd995a0b6': 25.00, // Gel Manicure with Removal ($50)
};

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

    // Look up deposit from our map first, then check the booking response
    let deposit_amount = DEPOSIT_MAP[service_id] || null;
    if (!deposit_amount) {
      const guestBooking = booking.guests?.[0];
      const item = guestBooking?.items?.[0];
      if (item?.deposit_amount > 0) {
        deposit_amount = item.deposit_amount;
      } else if (item?.price?.deposit > 0) {
        deposit_amount = item.price.deposit;
      }
    }

    return ok({ booking_id, date, slots, deposit_amount });
  } catch (e) {
    return err('Failed to fetch slots', e.status || 500, e.body);
  }
};
