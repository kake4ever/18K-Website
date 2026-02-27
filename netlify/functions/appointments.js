// GET /api/appointments?center_id=xxx&guest_id=xxx
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id, guest_id } = event.queryStringParameters || {};
  if (!center_id || !guest_id) return err('center_id and guest_id required', 400);

  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Fetch upcoming: today + 10 days
    const futureEnd = new Date(now);
    futureEnd.setDate(futureEnd.getDate() + 10);
    const futureEndStr = futureEnd.toISOString().split('T')[0];

    // Fetch past: last 10 days
    const pastStart = new Date(now);
    pastStart.setDate(pastStart.getDate() - 10);
    const pastStartStr = pastStart.toISOString().split('T')[0];

    const [upcomingData, pastData] = await Promise.all([
      zenoti(`/appointments?center_id=${center_id}&guest_id=${guest_id}&start_date=${today}&end_date=${futureEndStr}`).catch(() => []),
      zenoti(`/appointments?center_id=${center_id}&guest_id=${guest_id}&start_date=${pastStartStr}&end_date=${today}`).catch(() => []),
    ]);

    const mapAppt = (a) => ({
      id: a.appointment_id,
      date: a.start_time,
      end_time: a.end_time,
      status: a.status,
      service: a.parent_service_name || a.service?.name,
      therapist: a.therapist
        ? `${a.therapist.first_name || ''} ${a.therapist.last_name || ''}`.trim()
        : null,
    });

    const upcoming = Array.isArray(upcomingData) ? upcomingData.map(mapAppt) : [];
    const past = Array.isArray(pastData) ? pastData.map(mapAppt).filter(a => a.date !== today) : [];

    return ok({ upcoming, past });
  } catch (e) {
    return err('Failed to fetch appointments', e.status || 500, e.body);
  }
};
