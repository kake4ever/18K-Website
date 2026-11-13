// GET /api/slots?center_id=&service_id=&date=&guest_id=&therapist_id=
//
// Every call creates a booking DRAFT in Zenoti (POST /bookings) before it can
// read slots — that is how Zenoti's API works, not a choice made here — so
// this is the highest-frequency near-mutation in the whole flow and the one
// most worth rate-limiting.
const { zenoti, ok } = require('./_zenoti');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

const DEMO_GUEST = 'B83AE293-BD1E-4AC8-9714-74F5C3F5989C';

// Deposit = 50% of price per Zenoti config (DepositType: 1, DepositValue: 50%).
// Source of truth: Zenoti webstore AvailableTimes response.
// Update this map when services or prices change.
const DEPOSIT_MAP = {
  'dc2874d0-a6e0-459b-a530-019aa40bd81e': 22.50, // Gel Manicure ($45)
  'adb41db2-0d85-4929-be77-4a5fd995a0b6': 25.00, // Gel Manicure with Removal ($50)
};

exports.handler = async (event) => {
  const cors = corsFor(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id, service_id, guest_id, therapist_id } = event.queryStringParameters || {};
  const date = event.queryStringParameters?.date || new Date().toISOString().split('T')[0];
  if (!center_id || !service_id) return ok({ booking_id: null, date, slots: [], deposit_amount: null, error: 'center_id and service_id required' }, 200, cors);

  const check = checkRateLimit(`slots:${clientIp(event)}`, { max: 30, windowMs: 60_000 });
  if (!check.allowed) return rateLimitedResponse(cors, check.retryAfterSec);

  let effectiveGuestId = guest_id || DEMO_GUEST;
  if (guest_id) {
    try {
      await zenoti(`/guests/${guest_id}`);
    } catch (e) {
      return ok({ booking_id: null, date, slots: [], deposit_amount: null, error: 'Unknown guest_id' }, 200, cors);
    }
  }

  try {
    const guestItem = { item: { id: service_id } };
    if (therapist_id) guestItem.therapist = { id: therapist_id };

    const booking = await zenoti('/bookings', {
      method: 'POST',
      body: JSON.stringify({ center_id, date, guests: [{ id: effectiveGuestId, items: [guestItem] }] }),
    });

    const booking_id = booking.id || booking.booking_id;
    if (!booking_id) return ok({ booking_id: null, date, slots: [], deposit_amount: null, error: 'Could not create booking session' }, 200, cors);

    const slotsData = await zenoti(`/bookings/${booking_id}/slots?date=${date}`);

    const slots = (slotsData.slots || slotsData.Slots || [])
      .filter(s => s.Available)
      .map(slot => {
        const t = new Date(slot.Time);
        const start_time = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' });
        return { start_time, raw_time: slot.Time, therapist: therapist_id ? { id: therapist_id, name: '' } : null };
      });

    let deposit_amount = DEPOSIT_MAP[service_id] || null;
    if (!deposit_amount) {
      const guestBooking = booking.guests?.[0];
      const item = guestBooking?.items?.[0];
      if (item?.deposit_amount > 0) deposit_amount = item.deposit_amount;
      else if (item?.price?.deposit > 0) deposit_amount = item.price.deposit;
    }

    return ok({ booking_id, date, slots, deposit_amount }, 200, cors);
  } catch (e) {
    return ok({ booking_id: null, date, slots: [], deposit_amount: null, error: 'Failed to fetch slots', detail: e.body || e.message }, 200, cors);
  }
};
