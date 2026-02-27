// POST /api/book
// Body: { booking_id, slot_time, guest_id, service_id, therapist_id? }
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  let body;
  try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400); }

  const { booking_id, slot_time, guest_id, service_id, therapist_id } = body;
  if (!booking_id || !slot_time || !guest_id) return err('booking_id, slot_time, guest_id required', 400);

  try {
    // Step 1: Reserve the slot
    const reservePayload = { slot_time };
    if (therapist_id) reservePayload.therapist_id = therapist_id;

    await zenoti(`/bookings/${booking_id}/slots/reserve`, {
      method: 'POST',
      body: JSON.stringify(reservePayload),
    });

    // Step 2: Confirm the booking
    const confirmed = await zenoti(`/bookings/${booking_id}/slots/confirm`, {
      method: 'POST',
      body: JSON.stringify({ notes: '' }),
    });

    const apptId = confirmed?.invoice?.items?.[0]?.appointment_id || null;

    return ok({
      success: true,
      appointment_id: apptId,
      booking_id,
      slot_time,
      message: 'Appointment confirmed!',
    });
  } catch (e) {
    return err('Failed to confirm booking', e.status || 500, e.body);
  }
};
