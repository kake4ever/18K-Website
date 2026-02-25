// POST /api/book
// Body: { booking_id, slot_time, therapist_id, guest_id, service_id }
// Reserves a slot and confirms the appointment
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  let body;
  try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400); }

  const { booking_id, slot_time, therapist_id, guest_id, service_id } = body;
  if (!booking_id || !slot_time || !guest_id) return err('booking_id, slot_time, guest_id required', 400);

  try {
    // Step 1: Reserve the slot
    const reservePayload = {
      slot_time,
      therapist_id,
      services: [{ service_id, therapist_id }],
    };

    await zenoti(`/bookings/${booking_id}/reserve`, {
      method: 'POST',
      body: JSON.stringify(reservePayload),
    });

    // Step 2: Confirm the booking
    const confirmPayload = { guest_id };
    const confirmed = await zenoti(`/bookings/${booking_id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(confirmPayload),
    });

    return ok({
      success: true,
      appointment_id: confirmed.appointment_id || confirmed.id,
      booking_id,
      slot_time,
      message: 'Appointment confirmed!',
    });
  } catch (e) {
    return err('Failed to confirm booking', e.status || 500, e.body);
  }
};
