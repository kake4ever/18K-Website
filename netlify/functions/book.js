// POST /api/book
// Body: { booking_id, slot_time, guest_id, service_id, therapist_id? }
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return ok({ success: false, appointment_id: null, error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body); } catch { return ok({ success: false, appointment_id: null, error: 'Invalid JSON' }); }

  const { booking_id, slot_time, guest_id, service_id, therapist_id } = body;
  if (!booking_id || !slot_time || !guest_id) return ok({ success: false, appointment_id: null, error: 'booking_id, slot_time, guest_id required' });

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

    // Extract appointment ID — Zenoti may return it at different paths
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
    });
  } catch (e) {
    return ok({ success: false, appointment_id: null, booking_id, slot_time, error: 'Failed to confirm booking', detail: e.body || e.message });
  }
};
