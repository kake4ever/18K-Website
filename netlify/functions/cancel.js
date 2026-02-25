// POST /api/cancel
// Body: { center_id, appointment_id, guest_id }
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  let body;
  try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400); }

  const { center_id, appointment_id, guest_id } = body;
  if (!center_id || !appointment_id) return err('center_id and appointment_id required', 400);

  try {
    await zenoti(`/appointments/${appointment_id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ center_id, guest_id }),
    });

    return ok({ success: true, message: 'Appointment cancelled.' });
  } catch (e) {
    return err('Failed to cancel appointment', e.status || 500, e.body);
  }
};
