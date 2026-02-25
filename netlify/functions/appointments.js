// GET /api/appointments?center_id=xxx&guest_id=xxx
// Returns upcoming and past appointments for a guest
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id, guest_id } = event.queryStringParameters || {};
  if (!center_id || !guest_id) return err('center_id and guest_id required', 400);

  try {
    const data = await zenoti(
      `/guests/${guest_id}/appointments?center_id=${center_id}&size=20`
    );

    const appointments = (data.appointments || []).map(a => ({
      id: a.id,
      date: a.start_time,
      end_time: a.end_time,
      status: a.status,
      service: a.service?.name,
      therapist: a.therapist
        ? `${a.therapist.first_name} ${a.therapist.last_name}`.trim()
        : null,
      price: a.price,
    }));

    const now = new Date();
    return ok({
      upcoming: appointments.filter(a => new Date(a.date) >= now),
      past: appointments.filter(a => new Date(a.date) < now),
    });
  } catch (e) {
    return err('Failed to fetch appointments', e.status || 500, e.body);
  }
};
