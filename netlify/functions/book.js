// POST /api/book
// Body: { booking_id, slot_time, guest_id, service_id, therapist_id? }
const { zenoti, ok } = require('./_zenoti');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

exports.handler = async (event) => {
  const cors = corsFor(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return ok({ success: false, appointment_id: null, error: 'Method not allowed' }, 200, cors);

  let body;
  try { body = JSON.parse(event.body); } catch { return ok({ success: false, appointment_id: null, error: 'Invalid JSON' }, 200, cors); }

  const { booking_id, slot_time, guest_id, service_id, therapist_id } = body;
  if (!booking_id || !slot_time || !guest_id) return ok({ success: false, appointment_id: null, error: 'booking_id, slot_time, guest_id required' }, 200, cors);

  const check = checkRateLimit(`book:${clientIp(event)}:${guest_id}`, { max: 10, windowMs: 3_600_000 });
  if (!check.allowed) return rateLimitedResponse(cors, check.retryAfterSec);

  try {
    // A booking under a guest_id nobody can find is either a typo or a
    // probe — reject before Zenoti creates anything under it.
    await zenoti(`/guests/${guest_id}`);
  } catch (e) {
    return ok({ success: false, appointment_id: null, error: 'Unknown guest_id' }, 200, cors);
  }

  try {
    const reservePayload = { slot_time };
    if (therapist_id) reservePayload.therapist_id = therapist_id;
    await zenoti(`/bookings/${booking_id}/slots/reserve`, { method: 'POST', body: JSON.stringify(reservePayload) });

    const confirmed = await zenoti(`/bookings/${booking_id}/slots/confirm`, { method: 'POST', body: JSON.stringify({ notes: '' }) });

    const apptId = confirmed?.invoice?.items?.[0]?.appointment_id
      || confirmed?.appointment_id
      || confirmed?.appointments?.[0]?.id
      || confirmed?.id
      || null;

    return ok({
      success: true,
      appointment_id: apptId,
      booking_id,
      slot_time,
      confirmed_data: apptId ? undefined : confirmed,
      message: 'Appointment confirmed!',
    }, 200, cors);
  } catch (e) {
    return ok({ success: false, appointment_id: null, booking_id, slot_time, error: 'Failed to confirm booking', detail: e.body || e.message }, 200, cors);
  }
};
