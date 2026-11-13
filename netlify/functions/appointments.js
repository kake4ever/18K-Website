// GET /api/appointments?center_id=xxx&guest_id=xxx
const { zenoti, ok, err } = require('./_zenoti');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

exports.handler = async (event) => {
  const cors = corsFor(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id, guest_id } = event.queryStringParameters || {};
  if (!center_id || !guest_id) return err('center_id and guest_id required', 400, null, cors);

  const check = checkRateLimit(`appointments:${clientIp(event)}:${guest_id}`, { max: 30, windowMs: 60_000 });
  if (!check.allowed) return rateLimitedResponse(cors, check.retryAfterSec);

  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const futureEnd = new Date(now); futureEnd.setDate(futureEnd.getDate() + 10);
    const pastStart = new Date(now); pastStart.setDate(pastStart.getDate() - 10);
    const futureEndStr = futureEnd.toISOString().split('T')[0];
    const pastStartStr = pastStart.toISOString().split('T')[0];

    const [upcomingData, pastData] = await Promise.all([
      zenoti(`/appointments?center_id=${center_id}&guest_id=${guest_id}&start_date=${today}&end_date=${futureEndStr}`).catch(() => []),
      zenoti(`/appointments?center_id=${center_id}&guest_id=${guest_id}&start_date=${pastStartStr}&end_date=${today}`).catch(() => []),
    ]);

    const mapAppt = (a) => ({
      id: a.appointment_id,
      invoice_id: a.invoice_id || null,
      date: a.start_time,
      end_time: a.end_time,
      status: a.status,
      service: a.parent_service_name || a.service?.name,
      therapist: a.therapist ? `${a.therapist.first_name || ''} ${a.therapist.last_name || ''}`.trim() : null,
    });

    const upcomingList = Array.isArray(upcomingData) ? upcomingData : (upcomingData?.appointments || []);
    const pastList = Array.isArray(pastData) ? pastData : (pastData?.appointments || []);
    const upcoming = upcomingList.map(mapAppt);
    const past = pastList.map(mapAppt).filter(a => a.date !== today);

    return ok({ upcoming, past }, 200, cors);
  } catch (e) {
    return err('Failed to fetch appointments', e.status || 500, e.body, cors);
  }
};
